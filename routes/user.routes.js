// const router = require("express").Router();
// const { createUser, login,getTopUsers, getAllUsers, getMe, deleteUserOne } = require("../controller/users.controller");
// const authMiddleware = require("../middleware/auth.middleware");
// const isAdmin = require("../middleware/isAdmin.middleware");

// router.post("/register", createUser);
// router.post("/login", login);
// router.get("/me", authMiddleware, getMe);
// router.get("/all", authMiddleware, isAdmin, getAllUsers);
// router.delete("/delete/:id", authMiddleware, isAdmin, deleteUserOne);
// router.get("/top", getTopUsers);

// module.exports = router;

const router = require("express").Router();
const {
  createUser,
  login,
  getTopUsers,
  getAllUsers,
  getMe,
  putUserOne,
  deleteUserOne
} = require("../controller/users.controller");

const auth = require("../middleware/auth.middleware");
const isAdmin = require("../middleware/isAdmin.middleware");

router.post("/register", createUser);
router.post("/login", login);

router.get("/me", auth, getMe);

router.put("/update/:id", auth, putUserOne);

router.get("/all", auth, isAdmin, getAllUsers);

router.delete("/delete/:id", auth, isAdmin, deleteUserOne);
router.get("/top", getTopUsers);

module.exports = router;
