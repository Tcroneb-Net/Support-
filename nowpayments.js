
const fetch = require('node-fetch');
require('dotenv').config();

async function createInvoice(telegramId) {
  const res = await fetch('https://api.nowpayments.io/v1/invoice', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.NOWPAYMENTS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      price_amount: 5,
      price_currency: 'usd',
      pay_currency: 'ltc',
      order_id: telegramId,
      order_description: 'Pro Access'
    })
  });
  return res.json();
}

module.exports = { createInvoice };
