
const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');

const token = process.env.BOT_TOKEN;
const geminiKey = process.env.GEMINI_API_KEY;
const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Auto-react (custom emoji reply)
  bot.sendMessage(chatId, '🤖');

  if (text.startsWith('/code')) {
    const prompt = text.replace('/code', '').trim() || "Create an HTML page that says 'Love'";
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    const output = data.candidates?.[0]?.content?.parts?.[0]?.text || '⚠️ No response from Gemini';

    // Format as quote for copy-paste
    bot.sendMessage(chatId, `💬 Here's a suggested response based on your prompt:

<b><i>${prompt}</i></b>

<pre>${output}</pre>`, {
      parse_mode: 'HTML'
    });
  }

  if (text === '/dev') {
    bot.sendMessage(chatId, '👨‍💻 Developer: @TCRONEB_HACKX');
  }

  if (text === '/pay') {
    bot.sendMessage(chatId, '💎 Become a Pro via Litecoin:
https://nowpayments.io/payment/?iid=example_payment_id');
  }

  if (text === '/copy') {
    bot.sendMessage(chatId, '📋 Just long-press and copy any code block above!');
  }

  if (text === '/start') {
    bot.sendMessage(chatId, 'Welcome! 👋 Choose an option:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '💻 Generate Code', callback_data: 'gen_code' }],
          [{ text: '📋 Copy Code', callback_data: 'copy_code' }],
          [{ text: '💎 Upgrade to Pro', url: 'https://nowpayments.io/payment/?iid=example_payment_id' }],
          [{ text: '👨‍💻 About Dev', callback_data: 'dev_info' }]
        ]
      }
    });
  }
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data === 'gen_code') {
    bot.sendMessage(chatId, 'Type your prompt using /code followed by your request (e.g., /code create a login form).');
  } else if (data === 'copy_code') {
    bot.sendMessage(chatId, '📋 Just long-press and copy any code block you received.');
  } else if (data === 'dev_info') {
    bot.sendMessage(chatId, '👨‍💻 Developer: @TCRONEB_HACKX
Channel: t.me/paidtechzone');
  }
});
