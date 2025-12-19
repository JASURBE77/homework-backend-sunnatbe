const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Token yo‘q" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET); // shu nom mos bo‘lishi kerak
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token yaroqsiz" });
  }
};
