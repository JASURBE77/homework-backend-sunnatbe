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

    if (!name || !surname || !group || !age || !login || !password ) {
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
      role: user.role,
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
    const user = await User.findById(req.user.id).select("-password")

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
    // 🔐 faqat admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Faqat admin olishi mumkin" });
    }

    let { page = 0, size = 10, search } = req.query;

    page = parseInt(page);
    size = parseInt(size);

    if (page < 0) page = 0;
    if (size <= 0) size = 10;

    const skip = page * size;
    let filter = {};

    if (search) {
      filter = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { surname: { $regex: search, $options: "i" } },
          { login: { $regex: search, $options: "i" } },
          { group: { $regex: search, $options: "i" } },
          { level: { $regex: search, $options: "i" } },
        ],
      };
    }

    const users = await User.find(filter)
      .select("-password")
      .select("-recentSubmissions")
      .skip(skip)
      .limit(size);

    // ❗ response OLDINGIDEK — FAQAT ARRAY
    res.status(200).json(users);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



exports.getTopUsers = async (req, res) => {
  try {
    const users = await User.find().select("name wp").sort({ wp: -1 }).limit(5);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.putUserOne = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔐 faqat admin yoki user o‘zi
    if (req.user.role !== "admin" && req.user.id !== id) {
      return res.status(403).json({
        message: "Siz bu userni o‘zgartira olmaysiz"
      });
    }

    const {
      name,
      surname,
      group,
      age,
      avatar,
      level,
      password,
      role
    } = req.body;

    // ❌ oddiy user role o‘zgartira olmaydi
    if (role && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Role o‘zgartirish faqat admin uchun"
      });
    }

    const updateData = {};

    if (name) updateData.name = name;
    if (surname) updateData.surname = surname;
    if (group) updateData.group = group;
    if (age) updateData.age = age;
    if (avatar) updateData.avatar = avatar;
    if (level) updateData.level = level;

    // 🔐 password bo‘lsa → hash
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // 🔥 admin bo‘lsa role ham o‘zgaradi
    if (role && req.user.role === "admin") {
      updateData.role = role;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User topilmadi" });
    }

    res.status(200).json({
      message: "User muvaffaqiyatli yangilandi",
      user: updatedUser
    });

  } catch (error) {
    console.error("PUT USER ERROR:", error);
    res.status(500).json({ message: "Server xatosi" });
  }
};
