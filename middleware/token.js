const jwt = require("jsonwebtoken");

exports.generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role }, // role qo‘shildi
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "12h" }
  );
};


exports.generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "48h" }
  );
};
