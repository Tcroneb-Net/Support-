require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');
const express = require('express');
const app = express();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const userChannels = {}; // chatId => channel username

// Helper: Validate channel username
function isValidChannel(username) {
  return typeof username === 'string' && username.startsWith('@');
}

// Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `👋 *Welcome to Gemini Joke Bot!*

Add your channel username with /setchannel @yourchannel
Then enjoy automatic jokes & fake user logs sent to your channel!

Buttons below 👇`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📡 Set Channel Username', callback_data: 'set_channel' }],
          [{ text: '🤖 Ask Gemini AI', callback_data: 'ask_gemini' }],
          [{ text: '💳 NowPayments Status', callback_data: 'check_payment' }],
        ],
      },
    }
  );
});

// /setchannel command
bot.onText(/\/setchannel (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const channel = match[1].trim();
  if (!isValidChannel(channel)) {
    return bot.sendMessage(chatId, '❌ Invalid channel username. Must start with @');
  }
  userChannels[chatId] = channel;
  bot.sendMessage(chatId, `✅ Channel set to *${channel}*`, { parse_mode: 'Markdown' });
});

// Handle button presses
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data === 'set_channel') {
    bot.sendMessage(chatId, '📩 Please send your channel username starting with @:');
    bot.once('message', (msg) => {
      const username = msg.text.trim();
      if (!isValidChannel(username)) {
        return bot.sendMessage(chatId, '❌ Invalid channel username. Must start with @');
      }
      userChannels[chatId] = username;
      bot.sendMessage(chatId, `✅ Channel set to *${username}*`, { parse_mode: 'Markdown' });
    });
  }

  if (data === 'ask_gemini') {
    bot.sendMessage(chatId, '💬 Send me your prompt for Gemini AI:');
    bot.once('message', async (msg) => {
      const prompt = msg.text;
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }],
                },
              ],
            }),
          }
        );
        const data = await response.json();

        const reply =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          '❌ No response from Gemini.';
        bot.sendMessage(chatId, `🤖 *Gemini AI Response:*\n\n${reply}`, {
          parse_mode: 'Markdown',
        });
      } catch (e) {
        bot.sendMessage(chatId, '❌ Error contacting Gemini API.');
      }
    });
  }

  if (data === 'check_payment') {
    try {
      const paymentRes = await fetch('https://api.nowpayments.io/v1/status', {
        headers: { 'x-api-key': process.env.NOWPAYMENTS_API_KEY },
      });
      const paymentData = await paymentRes.json();
      bot.sendMessage(
        chatId,
        `💳 *NowPayments Status:*\n${paymentData.message || 'Online'}`,
        { parse_mode: 'Markdown' }
      );
    } catch {
      bot.sendMessage(chatId, '❌ Failed to get NowPayments status.');
    }
  }

  bot.answerCallbackQuery(query.id);
});

// Helper to send joke to channel
async function sendJokeToChannel(channel) {
  try {
    const jokeRes = await fetch('https://official-joke-api.appspot.com/random_joke');
    if (!jokeRes.ok) throw new Error('Failed to fetch joke');
    const joke = await jokeRes.json();
    const jokeText = `🤣 *${joke.setup}*\n_${joke.punchline}_`;
    await bot.sendMessage(channel, jokeText, { parse_mode: 'Markdown' });
  } catch (e) {
    console.error('Error sending joke:', e.message);
  }
}

// Helper to send fake user to channel
async function sendFakeUserToChannel(channel) {
  try {
    const userRes = await fetch('https://randomuser.me/api/');
    if (!userRes.ok) throw new Error('Failed to fetch fake user');
    const userData = await userRes.json();
    const user = userData.results[0];
    const userInfo = `🕵️ *Fake User Logged:*\n👤 ${user.name.first} ${user.name.last}\n📧 ${
      user.email
    }\n🌍 ${user.location.city}, ${user.location.country}`;
    await bot.sendPhoto(channel, user.picture.large, { caption: userInfo, parse_mode: 'Markdown' });
  } catch (e) {
    console.error('Error sending fake user:', e.message);
  }
}

// Auto-send jokes & fake users every 10 minutes for all users who set channel
setInterval(() => {
  Object.values(userChannels).forEach((channel) => {
    sendJokeToChannel(channel);
    sendFakeUserToChannel(channel);
  });
}, 10 * 60 * 1000); // 10 minutes

// Express server to keep bot alive
app.get('/', (_, res) => res.send('🤖 Gemini Joke Bot is running.'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bot is running on port ${PORT}`));
