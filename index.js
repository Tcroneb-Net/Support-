const TelegramBot = require('node-telegram-bot-api');
const { generateResponse } = require('./gemini');
const { fancyFont } = require('./fonts');
const { createInvoice } = require('./nowpayments');
const { isPro, activatePro } = require('./proManager');
require('dotenv').config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '🚀 *Welcome to the Pro Bot!* Choose an option:', {
    parse_mode: 'Markdown',
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
    try {
      const invoice = await createInvoice(chatId);
      bot.sendMessage(chatId, `💳 *Pay with Litecoin to unlock Pro:*
[Click to Pay](${invoice.invoice_url})`, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      });
    } catch (err) {
      bot.sendMessage(chatId, '❌ Failed to create payment invoice. Please try again later.');
    }
  } else if (data === 'dev') {
    bot.sendMessage(chatId, '👨‍💻 Developer: @TCRONEB_HACKX\nTelegram: https://t.me/paidtechzone');
  }
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || '';

  if (text.startsWith('/code ')) {
    const query = text.slice(6);
    const reply = await generateResponse(`Write code for: ${query}`);
    const styled = fancyFont("Here is your code:");
    bot.sendMessage(chatId, `💻 ${styled}\n\n<pre>${reply}</pre>`, { parse_mode: 'HTML' });
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
    bot.sendMessage(chatId, `📋 Copied:\n<pre>${code}</pre>`, { parse_mode: 'HTML' });
    return;
  }

  // Auto-react and comment to any post using Gemini
  if (!text.startsWith('/')) {
    try {
      const aiComment = await generateResponse(`Comment this post: \"${text}\"`);
      bot.sendMessage(chatId, `💬 ${aiComment}`);
    } catch (err) {
      console.error('Auto-comment failed:', err);
    }
  }
});
