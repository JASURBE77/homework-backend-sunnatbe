const User = require("../models/users.model");

exports.getallTopTypings = async (req, res) => {
    try {
        const typers = await User.find().select("name wpm").sort({ typing: -1 }).limit(5);
        res.status(200).json(typers);
    } catch (error) {
         res.status(500).json({ message: error.message });
    }
}

exports.addTypingResult = async (req, res) => {
  try {
    const { userId, wpm } = req.body;

    if (!userId || !wpm) {
      return res.status(400).json({ message: "userId va wpm kerak" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User topilmadi" });
    }

    // agar eng yaxshi natijani saqlamoqchi bo‘lsang
    if (wpm > user.wpm) {
      user.wpm = wpm;
      await user.save();
    }

    res.status(200).json({
      message: "Typing natija saqlandi",
      user
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
