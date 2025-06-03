const fetch = require('node-fetch');
require('dotenv').config();

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;

async function createInvoice(telegramUserId) {
  const url = 'https://api.nowpayments.io/v1/invoice';
  const body = {
    price_amount: 3, // Amount in USD
    price_currency: 'usd',
    pay_currency: 'ltc', // You can change to 'eth', 'btc', etc.
    order_id: `pro_${telegramUserId}_${Date.now()}`,
    order_description: `Upgrade to Pro for user ${telegramUserId}`,
    success_url: 'https://t.me/paidtechzone',
    cancel_url: 'https://t.me/paidtechzone'
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'x-api-key': NOWPAYMENTS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();

  if (!res.ok || !data.invoice_url) {
    console.error('NowPayments error:', data);
    throw new Error('Failed to create payment invoice.');
  }

  return data; // Contains invoice_url, id, etc.
}

module.exports = { createInvoice };
