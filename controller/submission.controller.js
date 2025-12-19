// const User = require("../models/users.model");

// exports.createSubmission = async (req, res) => {
//   try {
//     const { HwLink, description } = req.body;

//  if (!HwLink || HwLink.trim() === "") {
//   return res.status(400).json({ message: "Uy ishi linki kerak" });
// }

//     const user = await User.findById(req.user.id);

//     if (!user) {
//       return res.status(404).json({ message: "User topilmadi" });
//     }

//     const newSubmission = {
//       HwLink,
//       description,
//       date: new Date().toISOString().slice(0, 10),
//       status: "pending"
//     };

//     user.recentSubmissions.unshift(newSubmission);

//     user.totalLessons += 1;
//     user.pendingLessons += 1;

//     await user.save();

//     res.status(201).json({
//       message: "Uy ishi yuborildi",
//       submission: newSubmission
//     });

//   } catch (e) {
//     res.status(500).json({ message: e.message });
//   }
// };



const User = require("../models/users.model");

// CREATE SUBMISSION
exports.createSubmission = async (req, res) => {
  try {
    const { HwLink, description } = req.body;
    if (!HwLink || HwLink.trim() === "") return res.status(400).json({ message: "Uy ishi linki kerak" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User topilmadi" });

    const newSubmission = { HwLink, description, date: new Date().toISOString().slice(0, 10), status: "PENDING" };
    user.recentSubmissions.unshift(newSubmission);
    user.totalLessons += 1;
    user.pendingLessons += 1;

    await user.save();
    res.status(201).json({ message: "Uy ishi yuborildi", submission: newSubmission });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET SUBMISSIONS BY USER
exports.getUserSubmissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    const user = await User.findById(userId).select("recentSubmissions");
    if (!user) return res.status(404).json({ message: "User topilmadi" });

    let submissions = user.recentSubmissions;
    if (status) submissions = submissions.filter(s => s.status.toUpperCase() === status.toUpperCase());

    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REVIEW SUBMISSION (Admin)
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
