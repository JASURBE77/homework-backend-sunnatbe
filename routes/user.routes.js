const router = require("express").Router();
const { createUser, login,getTopUsers, getAllUsers, getMe, deleteUserOne } = require("../controller/users.controller");
const authMiddleware = require("../middleware/auth.middleware");
const isAdmin = require("../middleware/isAdmin.middleware");

router.post("/register", createUser);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);
router.get("/all", authMiddleware, isAdmin, getAllUsers);
router.delete("/delete/:id", authMiddleware, isAdmin, deleteUserOne);
router.get("/top", getTopUsers);

module.exports = router;
