const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

// Computes the SHA-256 hash of a file
function computeHash(filePath) {
    const fileContent = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(fileContent).digest('hex');
}

// Verifies file integrity by comparing the computed hash with an expected hash
function verifyIntegrity(filePath, expectedHash) {
    const currentHash = computeHash(filePath);
    return currentHash === expectedHash;
}

// Reverts any unintended modification by copying the backup file over the original file
function revertModification(filePath, backupFilePath) {
    fs.copyFileSync(backupFilePath, filePath);
}

// New functions for folder integrity

function computeFolderHash(folderPath) {
    let fileHashes = [];
    const items = fs.readdirSync(folderPath);
    items.forEach(item => {
        const fullPath = path.join(folderPath, item);
        const stat = fs.statSync(fullPath);
        if (stat.isFile()) {
            fileHashes.push(computeHash(fullPath));
        } else if (stat.isDirectory()) {
            fileHashes.push(computeFolderHash(fullPath));
        }
    });
    fileHashes.sort();
    return crypto.createHash('sha256').update(fileHashes.join('')).digest('hex');
}

function verifyFolderIntegrity(folderPath, expectedHash) {
    const currentHash = computeFolderHash(folderPath);
    return currentHash === expectedHash;
}

function revertFolderModification(folderPath, backupFolderPath) {
    // Remove the current folder recursively and copy backup folder over
    fs.rmSync(folderPath, { recursive: true, force: true });
    fs.cpSync(backupFolderPath, folderPath, { recursive: true });
}

// New function to watch for any code (or file/folder) modification
function watchForModification(targetPath, expectedHash, onModificationDetected) {
    const stat = fs.statSync(targetPath);
    const isDirectory = stat.isDirectory();
    const watcher = fs.watch(targetPath, { recursive: isDirectory }, (eventType, filename) => {
        let modified;
        if (isDirectory) {
            modified = !verifyFolderIntegrity(targetPath, expectedHash);
        } else {
            modified = !verifyIntegrity(targetPath, expectedHash);
        }
        if (modified) {
            onModificationDetected(targetPath);
        }
    });
    return watcher; // caller can use watcher.close() to stop watching
}

// New function to automatically revert unintended modifications for file content
function autoRevertOnModification(targetPath, expectedHash, backupPath) {
    const stat = fs.statSync(targetPath);
    const isDirectory = stat.isDirectory();
    const revertFn = isDirectory ? revertFolderModification : revertModification;
    console.log(`Auto revert enabled. Monitoring ${targetPath} using backup from ${backupPath}`);
    return watchForModification(targetPath, expectedHash, (modifiedPath) => {
        console.log(`Modification detected on ${modifiedPath}. Reverting changes using backup strategy...`);
        revertFn(modifiedPath, backupPath);
    });
}

module.exports = {
    computeHash,
    verifyIntegrity,
    revertModification,
    computeFolderHash,
    verifyFolderIntegrity,
    revertFolderModification,
    watchForModification,
    autoRevertOnModification
};
