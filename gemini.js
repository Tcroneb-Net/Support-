const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    }),
  }
);

const data = await response.json();

const reply =
  data.candidates?.[0]?.content?.parts?.[0]?.text ||
  "❌ No response from Gemini.";

bot.sendMessage(chatId, `🤖 *Gemini AI Response:*\n\n${reply}`, {
  parse_mode: "Markdown",
});
