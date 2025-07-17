const express = require("express");
const app = express();

const connectDB = require("./db");
connectDB();

app.use(express.json());
app.use(express.static("public"));

const questionRoutes = require("./routes/questionRoutes");
const answerRoutes = require("./routes/answerRoutes");
app.use("/api", questionRoutes);
app.use("/api/answer", answerRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
