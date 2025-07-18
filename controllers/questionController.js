const Question = require("../models/Question");

exports.getQuestions = async (req, res) => {
  try {
    // exclude the answer field from the response
    const questions = await Question.find().select("-answer");
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRandomQuestion = async (req, res) => {
  try {
    const { excludeIds, categories } = req.query;

    let filter = {};

    // filter by categories
    if (categories) {
      const categoryArray = categories.split(",").map((cat) => cat.trim());
      filter.category = { $in: categoryArray };
    }

    // exclude recently asked questions
    if (excludeIds) {
      const excludeArray = excludeIds.split(",").map((id) => id.trim());
      filter._id = { $nin: excludeArray };
    }

    const count = await Question.countDocuments(filter);
    if (count === 0) {
      // if no questions available after excluding recent ones, reset and try again
      const newFilter = categories ? { category: filter.category } : {};
      const newCount = await Question.countDocuments(newFilter);
      if (newCount === 0) {
        return res
          .status(404)
          .json({ message: "No questions found or categories don't exist" });
      }
      const randomIndex = Math.floor(Math.random() * newCount);
      const question = await Question.findOne(newFilter)
        .skip(randomIndex)
        .select("-answer");
      return res.status(200).json(question);
    }

    const randomIndex = Math.floor(Math.random() * count);
    const question = await Question.findOne(filter)
      .skip(randomIndex)
      .select("-answer");

    res.status(200).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkAnswer = async (req, res) => {
  try {
    const { questionId, selectedOption } = req.body;

    if (!questionId || selectedOption === undefined) {
      return res
        .status(400)
        .json({ message: "questionId and selectedOption are required" });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const isCorrect = question.answer === selectedOption;

    res.status(200).json({
      isCorrect,
      correctAnswer: question.answer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Question.distinct("category");
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
