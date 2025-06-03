
const fetch = require('node-fetch');
require('dotenv').config();

async function generateResponse(text) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text }] }]
    })
  });

  const data = await response.json();
  try {
    return data.candidates[0].content.parts[0].text;
  } catch {
    return '❌ Error from Gemini AI';
  }
}

module.exports = { generateResponse };
