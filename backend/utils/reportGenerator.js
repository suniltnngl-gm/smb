const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const { Parser } = require('json2csv');

const TABLE_NAME = process.env.TABLE_NAME;

async function generateFinancialReport() {
  const params = { TableName: TABLE_NAME };

  try {
    const data = await dynamodb.scan(params).promise();
    const items = data.Items || [];

    const fields = ['id', 'amount', 'productType', 'createdAt'];
    const parser = new Parser({ fields });
    const csv = parser.parse(items);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="financial-report.csv"'
      },
      body: csv
    };
  } catch (err) {
    console.error('Error generating financial report:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error generating financial report' })
    };
  }
}

module.exports = { generateFinancialReport };
