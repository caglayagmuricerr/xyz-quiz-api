const mongoose = require("mongoose");
const Question = require("../models/Question");
const questionsData = require("../data/questions.json");
const connectDB = require("../db");

async function seedDatabase() {
  try {
    // connect to db
    connectDB();

    // clear existing questions
    console.log("Clearing existing questions...");
    await Question.deleteMany({});
    console.log("Existing questions cleared");

    // matching the Question model schema
    const questions = questionsData.map((questionData) => ({
      question: questionData.question,
      options: questionData.options,
      answer: questionData.answer,
      category: questionData.category,
      difficulty: questionData.difficulty,
      timeLimit: questionData.timeLimit,
    }));

    // inserting the questions
    console.log(`Inserting ${questions.length} questions...`);
    await Question.insertMany(questions);
    console.log(
      `Successfully inserted ${questions.length} questions into the database`
    );

    // question stats
    const stats = await Question.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          difficulties: { $push: "$difficulty" },
        },
      },
    ]);

    console.log("\nDatabase seeding completed!");
    console.log("Questions by category:");
    stats.forEach((stat) => {
      const difficultyCount = stat.difficulties.reduce((acc, diff) => {
        acc[diff] = (acc[diff] || 0) + 1;
        return acc;
      }, {});
      console.log(`  ${stat._id}: ${stat.count} questions`);
      console.log(`    - Easy: ${difficultyCount.easy || 0}`);
      console.log(`    - Medium: ${difficultyCount.medium || 0}`);
      console.log(`    - Hard: ${difficultyCount.hard || 0}`);
    });
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    // close the connection
    await mongoose.connection.close();
    process.exit(0);
  }
}
seedDatabase();
