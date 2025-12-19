const router = require("express").Router();
const { createSubmission, getUserSubmissions, reviewSubmission } = require("../controller/submission.controller");
const auth = require("../middleware/auth.middleware");
const isAdmin = require("../middleware/isAdmin.middleware");

router.post("/postHomeWork", auth, createSubmission);
router.get("/submissions/:userId", auth, getUserSubmissions);
router.put("/submissions/:userId/:submissionId", auth, isAdmin, reviewSubmission);

module.exports = router;
