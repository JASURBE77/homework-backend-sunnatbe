const express = require("express")
const router = express.Router()
const {getallTopTypings} = require("../controller/typingrating.controller")

router.get("/top", getallTopTypings)


module.exports = router