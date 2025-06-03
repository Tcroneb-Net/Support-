
const express = require('express');
const app = express();
const TelegramBot = require('node-telegram-bot-api');
const { generateResponse } = require('./gemini');
const { fancyFont } = require('./fonts');
const { createInvoice } = require('./nowpayments');
const { isPro, activatePro } = require('./proManager');
require('dotenv').config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '🚀 Welcome to the Pro Bot! Choose an option:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '💻 Generate Code', callback_data: 'code' }],
        [{ text: '📋 Copy Code (Pro)', callback_data: 'copy' }],
        [{ text: '💎 Upgrade to Pro', callback_data: 'pro' }],
        [{ text: '👨‍💻 About Developer', callback_data: 'dev' }]
      ]
    }
  });
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data === 'code') {
    bot.sendMessage(chatId, '✏️ Send a message starting with /code followed by your request.');
  } else if (data === 'copy') {
    bot.sendMessage(chatId, '🔐 Use /copy <your_code> to copy (Pro required).');
  } else if (data === 'pro') {
    const invoice = await createInvoice(chatId);
    bot.sendMessage(chatId, `💳 Pay with Litecoin to unlock Pro:\n${invoice.invoice_url}`);
  } else if (data === 'dev') {
    bot.sendMessage(chatId, '👨‍💻 Developer: @TCRONEB_HACKX\nTelegram: https://t.me/paidtechzone');
  }
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || '';

  if (text.startsWith('/code ')) {
    const query = text.slice(6);
    const reply = await generateResponse(`Write JavaScript for: ${query}`);
    const styled = fancyFont("Here is your code:");
    bot.sendMessage(chatId, `💻 ${styled}\n\n<pre><code class="language-js">${reply}</code></pre>`, { parse_mode: 'HTML' });
    return;
  }

  if (text === '/pro') {
    const invoice = await createInvoice(chatId);
    bot.sendMessage(chatId, `💳 Pay with Litecoin to unlock Pro:\n${invoice.invoice_url}`);
    return;
  }

  if (text.startsWith('/confirmpro')) {
    activatePro(chatId);
    bot.sendMessage(chatId, '✅ Pro Activated! You can now use all features.');
    return;
  }

  if (text.startsWith('/copy ')) {
    if (!isPro(chatId)) {
      return bot.sendMessage(chatId, '🔒 You need Pro to use copy. Use /pro to upgrade.');
    }
    const code = text.slice(6);
    bot.sendMessage(chatId, `📋 Copied:\n\n<pre><code class="language-js">${code}</code></pre>`, { parse_mode: 'HTML' });
    return;
  }

  if (!text.startsWith('/')) {
    const aiComment = await generateResponse(`Give a short, clever reply to: "${text}"`);
    bot.sendMessage(chatId, `💬 ${aiComment}`);
  }
});

// Web port to keep alive on Render
app.get("/", (_, res) => res.send("Bot is running!"));
app.listen(3000, () => console.log("Server running on port 3000"));
