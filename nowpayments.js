
const axios = require('axios');
require('dotenv').config();

async function createInvoice(userId) {
  const response = await axios.post("https://api.nowpayments.io/v1/invoice", {
    price_amount: 1,
    price_currency: "USD",
    pay_currency: "LTC",
    order_id: userId.toString(),
    order_description: "Pro Access"
  }, {
    headers: {
      "x-api-key": process.env.NOWPAYMENTS_API_KEY,
      "Content-Type": "application/json"
    }
  });
  return response.data;
}

module.exports = { createInvoice };
