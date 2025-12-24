
const User = require("../models/users.model");

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
      status: "PENDING" 
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
      submission: newSubmission 
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
exports.getUserSubmissions = async (req, res) => {
  try {
    let {page = 0, size = 10} = req.query;

    page = parseInt(page);
    size = parseInt(size);  

    if (page < 0) page = 0;
    if (size <= 0) size = 10;

    const skip = page * size;

     const { userId } = req.params;

    const user = await User.findById(userId).select("recentSubmissions").skip(skip).limit(size);
    if (!user) return res.status(404).json({ message: "User topilmadi" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.reviewSubmission = async (req, res) => {
  try {
    const { userId, submissionId } = req.params;
    const { score, teacherDescription, status } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User topilmadi" });

    const submission = user.recentSubmissions.id(submissionId);
    if (!submission) return res.status(404).json({ message: "Submission topilmadi" });

    if (score !== undefined) submission.score = score;
    if (teacherDescription) submission.teacherDescription = teacherDescription;
    if (status) submission.status = status.toUpperCase();

    if (status === "CHECKED") {
      user.completedLessons += 1;
      user.pendingLessons -= 1;
    }

    await user.save();
    res.status(200).json({ message: "Submission yangilandi", submission });
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
}