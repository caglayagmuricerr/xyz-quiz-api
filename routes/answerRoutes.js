const express = require("express");
const router = express.Router();

const questionController = require("../controllers/questionController");

router.post("/", questionController.checkAnswer);

module.exports = router;
