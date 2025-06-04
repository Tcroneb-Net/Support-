require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');
const express = require('express');
const app = express();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const userChannels = {}; // store user chatId => channel username

// Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `👋 *Welcome to Gemini Joke Bot!*\n\n` +
    `Use the button below or type /setchannel to add your channel username.\n\n` +
    `🎯 Features:\n` +
    `- Ask Gemini AI\n` +
    `- Send Random Jokes to your channel\n` +
    `- Log Fake Users\n` +
    `- Check NowPayments Status\n`, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '📡 Set Channel Username', callback_data: 'set_channel' }],
        [{ text: '🤖 Ask Gemini AI', callback_data: 'ask_gemini' }],
        [{ text: '🤣 Send Random Joke', callback_data: 'send_joke' }],
        [{ text: '🕵️‍♂️ Log Fake User', callback_data: 'fake_user' }],
        [{ text: '💳 Check NowPayments Status', callback_data: 'check_payment' }],
      ],
    }
  });
});

// Set channel username with command
bot.onText(/\/setchannel (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const channel = match[1].trim();
  if (!channel.startsWith('@')) {
    return bot.sendMessage(chatId, '❌ Invalid channel username. It must start with @.');
  }
  userChannels[chatId] = channel;
  bot.sendMessage(chatId, `✅ Your channel is set to *${channel}*`, { parse_mode: 'Markdown' });
});

// Handle button presses
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data === 'set_channel') {
    bot.sendMessage(chatId, '📩 Please send your channel username starting with @ (e.g., @mychannel):');
    bot.once('message', (msg) => {
      const username = msg.text.trim();
      if (!username.startsWith('@')) {
        return bot.sendMessage(chatId, '❌ Invalid channel username. Must start with @.');
      }
      userChannels[chatId] = username;
      bot.sendMessage(chatId, `✅ Channel set to *${username}*`, { parse_mode: 'Markdown' });
    });
  }

  if (data === 'ask_gemini') {
    bot.sendMessage(chatId, '💬 Send me the prompt for Gemini AI:');
    bot.once('message', async (msg) => {
      const prompt = msg.text;
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          }),
        });
        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '❌ Gemini did not return a response.';
        bot.sendMessage(chatId, `🤖 *Gemini AI Response:*\n\n${reply}`, { parse_mode: 'Markdown' });
      } catch (err) {
        bot.sendMessage(chatId, '❌ Error contacting Gemini API.');
      }
    });
  }

  if (data === 'send_joke') {
    const channel = userChannels[chatId];
    if (!channel) {
      return bot.sendMessage(chatId, '❗ Please set your channel username first with /setchannel or the button.');
    }
    try {
      const jokeRes = await fetch('https://official-joke-api.appspot.com/random_joke');
      const joke = await jokeRes.json();
      const jokeText = `🤣 *${joke.setup}*\n_${joke.punchline}_`;
      await bot.sendMessage(channel, jokeText, { parse_mode: 'Markdown' });
      bot.sendMessage(chatId, '✅ Joke sent to your channel!');
    } catch {
      bot.sendMessage(chatId, '❌ Failed to get/send joke.');
    }
  }

  if (data === 'fake_user') {
    const channel = userChannels[chatId];
    if (!channel) {
      return bot.sendMessage(chatId, '❗ Please set your channel username first with /setchannel or the button.');
    }
    try {
      const userRes = await fetch('https://randomuser.me/api/');
      const userData = await userRes.json();
      const user = userData.results[0];
      const userInfo = `🕵️ *Fake User Logged:*\n👤 ${user.name.first} ${user.name.last}\n📧 ${user.email}\n🌍 ${user.location.city}, ${user.location.country}`;
      await bot.sendPhoto(channel, user.picture.large, { caption: userInfo, parse_mode: 'Markdown' });
      bot.sendMessage(chatId, '✅ Fake user logged in your channel!');
    } catch {
      bot.sendMessage(chatId, '❌ Failed to log fake user.');
    }
  }

  if (data === 'check_payment') {
    try {
      const paymentRes = await fetch('https://api.nowpayments.io/v1/status', {
        headers: { 'x-api-key': process.env.NOWPAYMENTS_API_KEY }
      });
      const paymentData = await paymentRes.json();
      bot.sendMessage(chatId, `💳 *NowPayments Status:*\n${paymentData.message || 'Online'}`, { parse_mode: 'Markdown' });
    } catch {
      bot.sendMessage(chatId, '❌ Failed to get NowPayments status.');
    }
  }

  bot.answerCallbackQuery(query.id);
});

// Express server to keep bot alive (for Render or similar)
app.get('/', (_, res) => res.send('🤖 Gemini Joke Bot is running.'));
app.listen(process.env.PORT || 3000, () => console.log('Bot is running on port', process.env.PORT || 3000));
