const express = require("express")
const router = express.Router()
const {getallTopTypings, addTypingResult} = require("../controller/typingrating.controller")



router.get("/top", getallTopTypings)

router.post("/addtyping", addTypingResult)

module.exports = router