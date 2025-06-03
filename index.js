
const TelegramBot = require('node-telegram-bot-api');
const { generateResponse } = require('./gemini');
const { fancyFont } = require('./fonts');
const { createInvoice } = require('./nowpayments');
const { isPro, activatePro } = require('./proManager');
require('dotenv').config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || '';

  bot.sendMessage(chatId, '🤖');

  const aiComment = await generateResponse(`Comment this post: "${text}"`);
  bot.sendMessage(chatId, `💬 ${aiComment}`);

  if (text.startsWith('/code ')) {
    const query = text.slice(6);
    const reply = await generateResponse(`Write code for: ${query}`);
    const styled = fancyFont("Here's your code:");
    bot.sendMessage(chatId, `${styled}

\`\`\`
${reply}
\`\`\``, { parse_mode: 'Markdown' });
    return;
  }

  if (text === '/pro') {
    const invoice = await createInvoice(chatId);
    bot.sendMessage(chatId, `Pay with Litecoin to unlock Pro: ${invoice.invoice_url}`);
  }

  if (text.startsWith('/confirmpro')) {
    activatePro(chatId);
    bot.sendMessage(chatId, '✅ Pro Activated! You can now use all features.');
  }
});

bot.onText(/\/copy (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  if (!isPro(chatId)) {
    return bot.sendMessage(chatId, '🔒 You need Pro to copy codes. Use /pro to upgrade.');
  }

  const code = match[1];
  bot.sendMessage(chatId, `📋 Copied:
\`\`\`
${code}
\`\`\``, { parse_mode: 'Markdown' });
});
