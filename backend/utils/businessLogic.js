const calculateTax = (amount) => {
  return amount * TAX_RATE;
};

const generateInvoice = (item, customer) => {
  const tax = calculateTax(item.amount);
  const taxBreakdown = {
    CGST: tax / 2,
    SGST: tax / 2
  };

  return {
    invoiceNumber: crypto.randomUUID(),
    date: new Date().toISOString(),
    customer,
    item,
    subtotal: item.amount,
    tax,
    taxBreakdown,
    total: item.amount + tax,
    currency: 'INR'
  };
};

const calculateCashFlow = async (dynamodb, TABLE_NAME) => {
  return trackOperation('calculateCashFlow', async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const params = {
      TableName: TABLE_NAME,
      FilterExpression: '#date >= :thirtyDaysAgo',
      ExpressionAttributeNames: {
        '#date': 'createdAt'
      },
      ExpressionAttributeValues: {
        ':thirtyDaysAgo': thirtyDaysAgo.getTime()
      }
    };

    const result = await dynamodb.scan(params).promise();
    return {
      income: result.Items.filter(i => i.type === 'income').reduce((sum, i) => sum + i.amount, 0),
      expenses: result.Items.filter(i => i.type === 'expense').reduce((sum, i) => sum + i.amount, 0),
      profit: result.Items.filter(i => i.type === 'income').reduce((sum, i) => sum + i.amount, 0) -
             result.Items.filter(i => i.type === 'expense').reduce((sum, i) => sum + i.amount, 0)
    };
  });
};

const checkInventoryAlerts = async (dynamodb, TABLE_NAME) => {
  return trackOperation('checkInventoryAlerts', async () => {
    const params = {
      TableName: TABLE_NAME,
      FilterExpression: '#qty <= :threshold',
      ExpressionAttributeNames: {
        '#qty': 'quantity'
      },
      ExpressionAttributeValues: {
        ':threshold': 10 // Alert when quantity is 10 or less
      }
    };

    const result = await dynamodb.scan(params).promise();
    return result.Items.map(item => ({
      id: item.id,
      productType: item.productType,
      stock: item.quantity
    }));
  });
};

module.exports = {
  calculateTax,
  generateInvoice,
  calculateCashFlow,
  checkInventoryAlerts
};