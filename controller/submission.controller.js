const User = require("../models/users.model");
const mongoose = require("mongoose");
const bot = require("../utils/parent.bot.js")

const { sendTelegramNotification } = require("../utils/telegram");

exports.createSubmission = async (req, res) => {
  try {
    const { HwLink, description } = req.body;
    if (!HwLink || HwLink.trim() === "")
      return res.status(400).json({ message: "Uy ishi linki kerak" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User topilmadi" });

    const newSubmission = {
      HwLink,
      description,
      date: new Date().toISOString().slice(0, 10),
      status: "PENDING",
    };

    user.recentSubmissions.unshift(newSubmission);
    user.totalLessons += 1;
    user.pendingLessons += 1;

    await user.save();

    // Telegram'ga xabar yuborish
    await sendTelegramNotification(newSubmission, user);

    res.status(201).json({
      message: "Uy ishi yuborildi",
      name: user.name,
      submission: newSubmission,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getUserSubmissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, page = 1, size = 10 } = req.query;

    const pageNum = Math.max(Number(page) || 1, 1);
    const pageSize = Math.max(Number(size) || 10, 1);

    // 🔍 User filter
    const matchUserStage = {
      $match: { _id: new mongoose.Types.ObjectId(userId) },
    };

    // 🔍 Status filter
    const matchSubmissionStage = status
      ? { $match: { "recentSubmissions.status": status } }
      : null;

    const pipeline = [
      matchUserStage,
      { $unwind: "$recentSubmissions" },
      ...(matchSubmissionStage ? [matchSubmissionStage] : []),
      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: 1,
          surname: 1,
          submission: "$recentSubmissions",
        },
      },
      { $sort: { "submission.date": -1 } },
      { $skip: (pageNum - 1) * pageSize },
      { $limit: pageSize },
    ];

    const data = await User.aggregate(pipeline);

    // 🔢 TOTAL COUNT
    const countPipeline = [
      matchUserStage,
      { $unwind: "$recentSubmissions" },
      ...(matchSubmissionStage ? [matchSubmissionStage] : []),
      { $count: "totalTasks" },
    ];

    const countResult = await User.aggregate(countPipeline);
    const totalTasks = countResult[0]?.totalTasks || 0;

    res.json({
      userId,
      page: pageNum,
      size: pageSize,
      totalTasks,
      totalPages: Math.ceil(totalTasks / pageSize),
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.reviewSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { score, teacherDescription } = req.body;

    const teacherName = `${req.user.name} ${req.user.surname}`;

    const user = await User.findOne({ "recentSubmissions._id": submissionId });
    if (!user) return res.status(404).json({ message: "Submission topilmadi" });

    const submission = user.recentSubmissions.id(submissionId);
    const today = new Date().toISOString();

    // Statusni yangilash
    if (submission.status === "PENDING") {
      submission.status = "CHECKED";
      submission.checkedDate = today;
      submission.checkedBy = teacherName;

      user.completedLessons += 1;
      user.pendingLessons = Math.max(0, user.pendingLessons - 1);
    } else if (submission.status === "CHECKED") {
      submission.status = "AGAIN CHECKED";
      submission.checkedDate = today;
      submission.checkedBy = teacherName;
    } else {
      return res.status(400).json({ message: "Bu uy ishi allaqachon qayta tekshirilgan" });
    }

    // Score update
    if (score !== undefined) submission.score = score;

    // Tavsif avtomatik generatsiya
    let autoDescription;
    if (!teacherDescription || teacherDescription.trim() === "") {
      if (submission.score < 25) {
        autoDescription = `O'glingiz topshirgan uy vazifa natijasi: ${submission.score}. Balli past, o'qishini kuchaytirishi kerak. Tekshirgan ustoz: ${teacherName}.`;
      } else {
        autoDescription = `O'glingiz uy vazifasini yaxshi bajardi! Ball: ${submission.score}. Davom etsin. Tekshirgan ustoz: ${teacherName}.`;
      }
      submission.teacherDescription = autoDescription;
    } else {
      submission.teacherDescription = teacherDescription;
    }

    await user.save();

    // Telegramga xabar yuborish
    const message = submission.teacherDescription;

    // Userga yuborish
    if (user.chatId) {
      bot.sendMessage(user.chatId, message);
      console.log("UY ISHI YUBORLD")
    }

    // Ota/onaga yuborish
    if (user.parentChatIds && user.parentChatIds.length > 0) {
      user.parentChatIds.forEach(chatId => {
        bot.sendMessage(chatId, message);
      });
    }

    res.status(200).json({
      message: "Submission muvaffaqiyatli tekshirildi va Telegramga yuborildi",
      submission: {
        _id: submission._id,
        status: submission.status,
        score: submission.score,
        teacherDescription: submission.teacherDescription,
        checkedDate: submission.checkedDate,
        checkedBy: submission.checkedBy,
      },
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getUserMe_submission = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("recentSubmissions");
    if (!user) return res.status(404).json({ message: "User topilmadi" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
