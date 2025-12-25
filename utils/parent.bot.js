// utils/parent.bot.js
require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const HwUsers = require("../models/users.model.js"); // sizning user modeli

// -------------------- MongoDB ga ulanish --------------------
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB ulandi"))
  .catch((err) => console.log(err));

// -------------------- Telegram Bot --------------------
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// -------------------- Foydalanuvchi sessiyalari (memory) --------------------
const sessions = {}; // { chatId: { step: 'awaitLogin'|'awaitPassword'|'authenticated', login, user } }

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
          "Login topilmadi. Iltimos /start bilan qayta urinib ko‘ring."
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

      // login va parol to'g'ri → chatId saqlash
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

// -------------------- Bot instance export --------------------
module.exports = bot;
