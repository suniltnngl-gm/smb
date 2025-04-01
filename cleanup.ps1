# Import the cleanup module
Import-Module -Name (Join-Path $PSScriptRoot "CleanupModule.psm1") -Force

$cleanupScript = {
    try {
        $startTime = Get-Date
        Initialize-OperationTracking
        Write-Progress -PercentComplete 0 -Status "Starting"
        
        $lockOp = Start-Operation -Name "LockAcquisition"
        if (-not (Start-CleanupLock)) {
            Stop-Operation $lockOp
            Write-Progress -PercentComplete 10 -Status "Lock acquisition failed"
            throw "Failed to acquire cleanup lock"
        }
        Stop-Operation $lockOp
        Write-Progress -PercentComplete 20 -Status "Lock acquired"

        Write-LogMessage -Message "Starting cleanup process at $(Get-Date -Format 'HH:mm:ss')" -Category "SYSTEM"
        
        $budgetOp = Start-Operation -Name "BudgetCheck"
        Write-LogMessage -Message "Checking budget status..." -Category "SYSTEM" -IndentLevel 1
        Write-Progress -PercentComplete 30 -Status "Checking budget"
        
        # Budget check with enhanced metrics
        $budget = Get-BudgetStatus
        Stop-Operation $budgetOp
        if ($budget.IsOverBudget) {
            Write-Progress -PercentComplete 100 -Status "Cancelled: Over budget"
            throw "Cleanup cancelled: Budget at $([math]::Round($budget.UtilizationPercent * 100, 1))%"
        }

        if ($budget.IsWarning) {
            Write-LogMessage -Message "Warning: Budget utilization high ($([math]::Round($budget.UtilizationPercent * 100, 1))%)" -Category "SYSTEM" -IndentLevel 1
        }

        $backupOp = Start-Operation -Name "BackupAnalysis"
        Write-LogMessage -Message "Checking backup status..." -Category "SYSTEM" -IndentLevel 1
        Write-Progress -PercentComplete 40 -Status "Analyzing backups"
        $backupStatus = Get-BackupAnalysis
        Stop-Operation $backupOp
        Write-Progress -PercentComplete 60 -Status "Processing results"
        Write-Metric -Name "BackupsFound" -Value $backupStatus.BackupCount -Unit "Count"
        Write-Metric -Name "BackupsNeedingCleanup" -Value ([int]$backupStatus.RequiresCleanup) -Unit "Count"
        
        # Backup handling with improved error handling and metrics
        if ($backupStatus.RequiresCleanup) {
            Write-Progress -PercentComplete 80 -Status "Removing expired backups"
            Write-LogMessage -Message "Starting backup cleanup..." -Category "BACKUP" -IndentLevel 1
            
            $integrityCheck = Start-Operation -Name "IntegrityCheck"
            $integrity = Test-BackupIntegrity
            if (-not $integrity) {
                Stop-Operation $integrityCheck -Status "Failed"
                throw "Backup integrity check failed"
            }
            Stop-Operation $integrityCheck
            
            $removed = Remove-ExpiredBackup -BatchSize $script:CONFIG.Backup.BatchSize
            Write-Metric -Name "ExpiredBackupsRemoved" -Value $removed -Unit "Count"
        } else {
            Write-LogMessage -Message "No backups require cleanup" -Category "BACKUP" -IndentLevel 1
        }

        Write-Progress -PercentComplete 100 -Status "Complete"
        $duration = Get-Duration -StartTime $startTime
        $opSummary = Get-OperationsSummary
        $summaryMsg = "Process completed in $(Format-Duration $duration). "
        if ($opSummary.HasOperations) {
            $summaryMsg += "Ran $($opSummary.Count) operations in $(Format-Duration $opSummary.Duration). "
        }
        $summaryMsg += "Processed $($backupStatus.BackupCount) backup(s)"
        Write-LogMessage -Message $summaryMsg -Category "SYSTEM"
        if ($opSummary.HasOperations) {
            Write-OperationSummary -TotalDuration (New-TimeSpan -Start $startTime -End (Get-Date)) -OperationCount $opSummary.Count
        }
        Write-Metric -Name "CleanupSuccess" -Value 1 -Unit "Count"
    }
    catch {
        $errorDetails = $_.Exception.Message
        Write-Progress -PercentComplete 100 -Status "Error occurred" -Error
        Write-LogMessage -Message "Error during cleanup:" -Category "ERROR"
        Write-LogMessage -Message $errorDetails -Category "ERROR" -IndentLevel 1
        
        # Update any running operations as failed
        $script:Operations | Where-Object { $_.Status -eq "Running" } | ForEach-Object {
            Stop-Operation -Operation $_ -Status "Failed"
        }
        
        Write-Metric -Name "CleanupErrors" -Value 1 -Unit "Count" -Details $errorDetails.Split([Environment]::NewLine)[0]
    }
    finally {
        Stop-CleanupLock
    }
}

Measure-ExecutionTime -ScriptBlock $cleanupScript
