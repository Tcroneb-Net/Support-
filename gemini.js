const fetch = require('node-fetch');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function generateResponse(prompt) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '🤖 No reply from Gemini.';
}

module.exports = { generateResponse };
