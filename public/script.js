const API_BASE = window.location.origin; // window.location.origin -> current origin (http://localhost:5000)
let currentQuestion = null;
let quizTimer = null;
let timeRemaining = 0;
let recentQuestionIds = []; // im storing 7 most recent question IDs to somewhat avoid repetition

async function testRoute(endpoint, method = "GET", body = null) {
  const responseElement = document.getElementById("responseContent");
  responseElement.textContent = "Loading..."; // setting the text to loading before making the request

  try {
    const options = {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const response = await fetch(API_BASE + endpoint, options); // send req and wait for res
    const data = await response.json(); // parse res body to JSON

    // displaying some response info
    const responseInfo = {
      status: response.status, // HTTP status code (like 200, 404, etc.)
      statusText: response.statusText, // HTTP text msg (like "OK", "Not Found", etc.)
      data: data, // actual data returned from the API
    };

    responseElement.textContent = JSON.stringify(responseInfo, null, 2); // pretty print JSON
  } catch (error) {
    responseElement.textContent = `Error: ${error.message}`;
  }
}

async function testCheckAnswer() {
  const responseElement = document.getElementById("responseContent");
  try {
    const response = await fetch(API_BASE + "/api/question/random");
    const question = await response.json();

    if (!question._id) {
      responseElement.textContent =
        "Error: No questions available to test with. Run 'npm run seed' to add some questions to the database.";
      return;
    }

    // select a random option
    const randomIndex = Math.floor(Math.random() * question.options.length);
    const selectedAnswer = question.options[randomIndex];

    const testBody = {
      questionId: question._id,
      selectedOption: selectedAnswer,
    };

    // show the question and selected answer
    responseElement.textContent = `Testing with question: "${question.question}"\nSelected answer: "${selectedAnswer}"\n\nAPI Response:\nLoading...`;

    const answerResponse = await fetch(API_BASE + "/api/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testBody),
    });

    const result = await answerResponse.json();

    const responseInfo = {
      status: answerResponse.status,
      statusText: answerResponse.statusText,
      data: result,
    };

    // display the complete information including the selected answer
    responseElement.textContent = `Testing with question: "${
      question.question
    }"\nSelected answer: "${selectedAnswer}"\nCorrect answer: "${
      result.correctAnswer
    }"\n\nAPI Response:\n${JSON.stringify(responseInfo, null, 2)}`;
  } catch (error) {
    responseElement.textContent = `Error: ${error.message}`;
  }
}

async function testRandomQuestionByCategory() {
  const responseElement = document.getElementById("responseContent");
  responseElement.textContent =
    "Loading categories and getting random question...";

  try {
    // first get all available categories
    const categoriesResponse = await fetch(
      API_BASE + "/api/questions/categories"
    );
    const categories = await categoriesResponse.json();

    if (categories.length === 0) {
      responseElement.textContent =
        "No categories available to test with. Run 'npm run seed' to add some questions to the database.";
      return;
    }

    // select a random category
    const randomCategory =
      categories[Math.floor(Math.random() * categories.length)];

    // get a random question from that category
    const questionResponse = await fetch(
      API_BASE +
        `/api/question/random?categories=${encodeURIComponent(randomCategory)}`
    );
    const question = await questionResponse.json();

    const responseInfo = {
      status: questionResponse.status,
      statusText: questionResponse.statusText,
      data: question,
    };

    responseElement.textContent = `Testing random question by category\nSelected category: "${randomCategory}"\nAvailable categories: [${categories.join(
      ", "
    )}]\n\nAPI Response:\n${JSON.stringify(responseInfo, null, 2)}`;
  } catch (error) {
    responseElement.textContent = `Error: ${error.message}`;
  }
}

async function startQuiz() {
  // clear any existing timer first
  clearInterval(quizTimer);
  quizTimer = null;

  const container = document.getElementById("quizContainer");
  container.innerHTML = '<p class="loading">Loading question...</p>';

  try {
    let queryParams = "";

    // if there are recent questions, exclude them
    if (recentQuestionIds.length > 0) {
      queryParams = `?excludeIds=${recentQuestionIds.join(",")}`;
    }

    const response = await fetch(
      API_BASE + "/api/question/random" + queryParams
    );
    const question = await response.json();

    if (question._id) {
      currentQuestion = question;

      // add current question to recent questions and keep only last 7
      recentQuestionIds.push(question._id);
      if (recentQuestionIds.length > 7) {
        recentQuestionIds.shift(); // remove oldest question
      }

      displayQuestion(question);
      startTimer(question.timeLimit);
    } else {
      container.innerHTML =
        '<p class="loading">No questions available. Run "npm run seed" to add some questions to the database.</p>';
    }
  } catch (error) {
    container.innerHTML = `<p class="loading">Error loading question: ${error.message}</p>`;
  }
}

async function submitAnswer() {
  if (!currentQuestion) return;

  const selectedOption = document.querySelector('input[name="answer"]:checked');
  if (!selectedOption) {
    const container = document.getElementById("quizContainer");
    const messageDiv = document.createElement("div");
    messageDiv.className = "result incorrect"; // classname to apply red background ./styles.css:222
    messageDiv.innerHTML = "Please select an answer first!";
    messageDiv.style.marginTop = "10px";
    container.appendChild(messageDiv);

    // remove message after 2 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.parentNode.removeChild(messageDiv);
      }
    }, 2000);
    return;
  }

  // disable all options and submit button to prevent multiple submissions
  document.querySelectorAll('input[name="answer"]').forEach((input) => {
    input.disabled = true;
  });
  document.querySelectorAll(".option").forEach((option) => {
    // making options look disabled
    option.style.pointerEvents = "none";
    option.style.opacity = "0.6";
  });
  const submitBtn = document.querySelector('button[onclick="submitAnswer()"]');
  if (submitBtn) {
    submitBtn.disabled = true;
  }

  // clear timer and reset reference
  clearInterval(quizTimer);
  quizTimer = null;

  try {
    const response = await fetch(API_BASE + "/api/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        questionId: currentQuestion._id,
        selectedOption: currentQuestion.options[parseInt(selectedOption.value)],
      }),
    });

    const result = await response.json();

    const resultDiv = document.createElement("div");
    resultDiv.className = `result ${
      result.isCorrect ? "correct" : "incorrect" // using CSS styles defined in styles.css line 215 to 223
    }`;
    resultDiv.innerHTML = result.isCorrect
      ? " Correct! Well done!"
      : ` Incorrect. The correct answer was: ${result.correctAnswer}`;

    document.getElementById("quizContainer").appendChild(resultDiv);

    // show result for 2 seconds, then load next question
    setTimeout(() => {
      startQuiz();
    }, 2000);
  } catch (error) {
    // display error on screen
    const container = document.getElementById("quizContainer");
    const errorDiv = document.createElement("div");
    errorDiv.className = "result incorrect"; // classname to apply red background ./styles.css:222
    errorDiv.innerHTML = ` Error submitting answer: ${error.message}`;
    container.appendChild(errorDiv);

    // show error for 2 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 2000);
  }
}

async function showTimeUpMessage() {
  if (!currentQuestion) return;

  // get the correct answer from the server
  try {
    const response = await fetch(API_BASE + "/api/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        questionId: currentQuestion._id,
        selectedOption: "dummy", // dummy val just to get the correct answer
      }),
    });

    const result = await response.json();

    const container = document.getElementById("quizContainer");
    const resultDiv = document.createElement("div");
    resultDiv.className = "result incorrect"; // classname to apply red background ./styles.css:222
    resultDiv.innerHTML = `Time's up! The correct answer was: ${result.correctAnswer}`;
    container.appendChild(resultDiv);

    // show correct answer for 2 seconds, then load next question
    setTimeout(() => {
      startQuiz();
    }, 2000);
  } catch (error) {
    console.error("Error getting correct answer:", error);

    // still move to next question after 2 seconds
    setTimeout(() => {
      startQuiz();
    }, 2000);
  }
}

// ╔════════════════════════════════════════════════════════════╗
//   from here on out its basic functionality for the quiz app
// ╚════════════════════════════════════════════════════════════╝

function startTimer(seconds) {
  // clear any existing timer first
  clearInterval(quizTimer);

  timeRemaining = seconds;
  updateTimerDisplay();

  quizTimer = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();

    if (timeRemaining <= 0) {
      clearInterval(quizTimer);
      quizTimer = null; // reset timer reference
      timeRemaining = 0; // prevent negative numbers
      updateTimerDisplay();
      showTimeUpMessage();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const timerElement = document.getElementById("timer");
  if (timerElement) {
    timerElement.textContent = `Time remaining: ${timeRemaining}s`;
    if (timeRemaining <= 10) {
      timerElement.style.color = "#f44336";
      timerElement.style.fontSize = "1.3em";
    }
  }
}

function displayQuestion(question) {
  const container = document.getElementById("quizContainer");

  const optionsHtml = question.options
    .map(
      (option, index) =>
        `<label class="option" onclick="selectOption(${index})">
              <input type="radio" name="answer" value="${index}" style="margin-right: 10px;">
              ${option}
          </label>`
    )
    .join("");

  container.innerHTML = `
          <div class="question-container">
              <div class="timer" id="timer">Time remaining: ${
                question.timeLimit || 60
              }s</div>
              <div class="question-text">${question.question}</div>
              <div class="category-info" style="color: #666; margin-bottom: 15px;">
                  Category: ${question.category} | Difficulty: ${
    question.difficulty
  }
              </div>
              <div class="options-container">
                  ${optionsHtml}
              </div>
              <div class="quiz-controls">
                  <button class="btn" onclick="submitAnswer()" style="max-width: 200px;">Submit Answer</button>
                  <button class="btn" onclick="startQuiz()" style="max-width: 200px; background: #6c757d;">New Question</button>
              </div>
          </div>
      `;
}

function selectOption(index) {
  // check if options are disabled (answer already submitted)
  const radioInputs = document.querySelectorAll('input[name="answer"]');
  if (radioInputs[0] && radioInputs[0].disabled) {
    return; // don't allow selection if already submitted
  }

  // remove previous selections
  document
    .querySelectorAll(".option")
    .forEach((opt) => opt.classList.remove("selected"));
  // select current option
  document.querySelectorAll(".option")[index].classList.add("selected");
  // check the radio button
  document.querySelectorAll('input[name="answer"]')[index].checked = true;
}
