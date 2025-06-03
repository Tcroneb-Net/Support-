const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // or "gemini-pro" if available

async function generateResponse(prompt) {
  try {
    const result = await model.generateContent({
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ]
    });

    // Extract generated text
    const generatedText = result?.candidates?.[0]?.content;
    if (!generatedText) {
      throw new Error("No generated text found");
    }

    return generatedText.trim();
  } catch (err) {
    console.error("Error generating response:", err);
    return "❌ Failed to generate response.";
  }
}

module.exports = { generateResponse };
