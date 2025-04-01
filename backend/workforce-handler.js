const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const { processData, ensureUnique } = require('./utils/dataProcessor');

exports.handler = async (event) => {
    const TABLE_NAME = process.env.TABLE_NAME;
    
    try {
        const httpMethod = event.httpMethod;
        const path = event.path;
        const requestBody = event.body ? JSON.parse(event.body) : null;
        
        switch(httpMethod) {
            case 'GET':
                if (path.includes('/employee/')) {
                    const employeeId = event.pathParameters.proxy.split('/')[1];
                    const employee = await getEmployee(TABLE_NAME, employeeId);
                    return {
                        statusCode: 200,
                        body: JSON.stringify(employee)
                    };
                } else {
                    const employees = await listEmployees(TABLE_NAME);
                    return {
                        statusCode: 200,
                        body: JSON.stringify(employees)
                    };
                }
                
            case 'POST':
                const newEmployee = await createEmployee(TABLE_NAME, requestBody);
                return {
                    statusCode: 201,
                    body: JSON.stringify(newEmployee)
                };
                
            case 'PUT':
                const employeeId = event.pathParameters.proxy.split('/')[1];
                const updatedEmployee = await updateEmployee(TABLE_NAME, employeeId, requestBody);
                return {
                    statusCode: 200,
                    body: JSON.stringify(updatedEmployee)
                };
                
            case 'DELETE':
                const deleteEmployeeId = event.pathParameters.proxy.split('/')[1];
                await deleteEmployee(TABLE_NAME, deleteEmployeeId);
                return {
                    statusCode: 204,
                    body: ''
                };
                
            default:
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: 'Unsupported HTTP method' })
                };
        }
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};

async function getEmployee(tableName, employeeId) {
    const params = {
        TableName: tableName,
        Key: {
            EmployeeId: employeeId
        }
    };
    
    const result = await dynamodb.get(params).promise();
    return result.Item;
}

async function listEmployees(tableName) {
    const params = {
        TableName: tableName
    };
    
    const result = await dynamodb.scan(params).promise();
    return result.Items;
}

async function createEmployee(tableName, employee) {
    const timestamp = new Date().toISOString();
    const defaultValues = {
        managerId: null,
        skills: [],
        contactInfo: {},
        department: 'General',
        role: 'Employee'
    };

    // Fetch existing employees to check for duplicates
    const existingEmployees = await listEmployees(tableName);
    ensureUnique(employee, existingEmployees, ['employeeId', 'email']);

    const processedEmployee = processData(employee, defaultValues);

    const employeeItem = {
        EmployeeId: processedEmployee.employeeId,
        Name: processedEmployee.name,
        Department: processedEmployee.department,
        Role: processedEmployee.role,
        HireDate: processedEmployee.hireDate,
        Status: 'ACTIVE',
        CreatedAt: timestamp,
        LastModified: timestamp,
        ModifiedBy: event.requestContext.authorizer.claims.sub,
        ManagerId: processedEmployee.managerId,
        Skills: processedEmployee.skills,
        ContactInfo: processedEmployee.contactInfo,
        IsSubstituted: processedEmployee.isSubstituted,
        SubstitutedFields: processedEmployee.substitutedFields || []
    };

    const params = {
        TableName: tableName,
        Item: employeeItem
    };

    await dynamodb.put(params).promise();
    return employeeItem;
}

async function updateEmployee(tableName, employeeId, updates) {
    if (!event.requestContext?.authorizer?.claims?.sub) {
        throw new Error('Unauthorized: No valid authentication context');
    }
    const timestamp = new Date().toISOString();
    const updateExpressionParts = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};
    
    Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'employeeId') {
            updateExpressionParts.push(`#${key} = :${key}`);
            expressionAttributeNames[`#${key}`] = key;
            expressionAttributeValues[`:${key}`] = value;
        }
    });
    
    const params = {
        TableName: tableName,
        Key: {
            EmployeeId: employeeId
        },
        UpdateExpression: `SET ${updateExpressionParts.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
    };
    
    const result = await dynamodb.update(params).promise();
    return result.Attributes;
}

async function deleteEmployee(tableName, employeeId) {
    const params = {
        TableName: tableName,
        Key: {
            EmployeeId: employeeId
        }
    };
    
    await dynamodb.delete(params).promise();
}