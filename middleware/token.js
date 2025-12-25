const jwt = require("jsonwebtoken");

exports.generateAccessToken = (user) => {
  console.log("user :", user)
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      surname: user.surname,
      role: user.role,
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "1d" }
  );
};

exports.generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "48h",
  });
};
