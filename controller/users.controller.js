const User = require("../models/users.model");
const bcrypt = require("bcryptjs");
const {
  generateAccessToken,
  generateRefreshToken
} = require("../middleware/token");


exports.createUser = async (req, res) => {
  try {
    const {
      name,
      surname,
      group,
      age,
      avatar,
      login,
      password,
      level,
      role
    } = req.body;

    if (!name || !surname || !group || !age || !login || !password || !level) {
      return res.status(400).json({ message: "Hamma maydonlarni to‘ldiring" });
    }

    const existingUser = await User.findOne({ login });
    if (existingUser) {
      return res.status(400).json({ message: "Bu login mavjud" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔥 ASOSIY QISM
    const usersCount = await User.countDocuments();

    let finalRole = "student";

    // 1️⃣ Agar userlar yo‘q bo‘lsa → birinchi user ADMIN
    if (usersCount === 0) {
      finalRole = "admin";
    }
    // 2️⃣ Aks holda faqat admin admin yaratishi mumkin
    else if (role === "admin") {
      if (!req.user || req.user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Faqat admin admin yarata oladi" });
      }
      finalRole = "admin";
    }

    const newUser = new User({
      name,
      surname,
      group,
      age,
      avatar,
      login,
      password: hashedPassword,
      level,
      role: finalRole
    });

    await newUser.save();

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    res.status(201).json({
      message: "User created",
      role: finalRole,
      accessToken,
      refreshToken
    });

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};



exports.login = async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ message: "Login va password kerak" });
    }

    const user = await User.findOne({ login }).select(
      "_id login password role"
    );

    if (!user) {
      return res.status(401).json({ message: "Login yoki parol noto‘g‘ri" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Login yoki parol noto‘g‘ri" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return res.status(200).json({
      message: "Login muvaffaqiyatli",
      accessToken,
      refreshToken,
    });

    

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: "Server xatosi" });
  }
};

exports.deleteUserOne = async (req, res) => {
  try {
    const {id} = req.params;
  await User.findByIdAndDelete(id);
    res.status(200).json({message: "User o'chirildi"});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User topilmadi" });
    }

    return res.status(200).json(user);

  } catch (error) {
    console.error("GET ME ERROR:", error);
    return res.status(500).json({ message: "Server xatosi" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    // 🔥 Admin tekshiruvi
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Faqat admin olishi mumkin" });
    }

    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const users = await User.find()
      .select("-password")
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments();

    res.status(200).json({
      page,
      totalPages: Math.ceil(total / limit),
      total,
      users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// server/controllers/users.controller.js
exports.getTopUsers = async (req, res) => {
  try {
    const users = await User.find().select("name wp").sort({ wp: -1 }).limit(5);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
