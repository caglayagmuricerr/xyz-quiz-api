const express = require("express");
const router = express.Router();

const questionController = require("../controllers/questionController");

router.get("/questions", questionController.getQuestions); // get all questions
router.get("/question/random", questionController.getRandomQuestion); // get a random question (optional -> filtering by categories and excluding recent ones)
router.get("/questions/categories", questionController.getCategories); // get all available categories

module.exports = router;
