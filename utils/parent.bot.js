// utils/parent.bot.js
require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const HwUsers = require("../models/users.model.js"); // user modeli

// -------------------- MongoDB ga ulanish --------------------
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB ulandi"))
  .catch((err) => console.log(err));

// -------------------- Telegram Bot (webhook) --------------------
const bot = new TelegramBot(process.env.BOT_TOKEN);
const WEBHOOK_URL = process.env.WEBHOOK_URL; // Render URL masalan: https://your-app.onrender.com
const PORT = process.env.PORT || 3000;

// Bot webhookni sozlash
bot.setWebHook(`${WEBHOOK_URL}/bot${process.env.BOT_TOKEN}`);

// -------------------- Foydalanuvchi sessiyalari --------------------
const sessions = {}; // { chatId: { step: 'awaitLogin'|'awaitPassword'|'authenticated', login, user } }

// -------------------- Webhook endpoint --------------------
const express = require("express");
const app = express();
app.use(express.json());

// Telegram xabarlarini qabul qiladigan endpoint
app.post(`/bot${process.env.BOT_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// -------------------- /start komandasi --------------------
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  sessions[chatId] = { step: "awaitLogin" };
  bot.sendMessage(chatId, "Salom! Iltimos, login kiriting:");
});

// -------------------- Foydalanuvchi xabarlari --------------------
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!sessions[chatId]) return; // /start bosilmagan bo‘lsa

  const session = sessions[chatId];

  try {
    if (session.step === "awaitLogin") {
      session.login = text;
      session.step = "awaitPassword";
      bot.sendMessage(chatId, "Endi parolni kiriting:");
    } else if (session.step === "awaitPassword") {
      const user = await HwUsers.findOne({ login: session.login });
      if (!user) {
        bot.sendMessage(
          chatId,
          "Login topilmadi. /start bilan qayta urinib ko‘ring."
        );
        delete sessions[chatId];
        return;
      }

      const match = await bcrypt.compare(text, user.password);
      if (!match) {
        bot.sendMessage(
          chatId,
          "Parol noto‘g‘ri. /start bilan qayta urinib ko‘ring."
        );
        delete sessions[chatId];
        return;
      }

      user.chatId = chatId;
      await user.save();

      bot.sendMessage(chatId, `Xush kelibsiz, ${user.name}! ✅`);
      session.step = "authenticated";
      session.user = user;
    }
  } catch (err) {
    console.log(err);
    bot.sendMessage(
      chatId,
      "Xatolik yuz berdi. /start bilan qayta urinib ko‘ring."
    );
    delete sessions[chatId];
  }
});

// -------------------- Serverni ishga tushurish --------------------
app.listen(PORT, () => {
  console.log(
    `Server ${PORT} portda ishlayapti, Telegram webhook URL: ${WEBHOOK_URL}/bot${process.env.BOT_TOKEN}`
  );
});

// -------------------- Bot instance export --------------------
module.exports = bot;
