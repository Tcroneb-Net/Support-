
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

async function generateResponse(prompt) {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    return "❌ Failed to generate response.";
  }
}

module.exports = { generateResponse };
