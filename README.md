# Yazılım.xyz Quiz API - NodeJS

[Github Link](https://github.com/caglayagmuricerr/xyz-quiz-api)

A simple question API built with Node.js for my summer internship at Yazılım.xyz. This project provides RESTful endpoints to retrieve programming and Linux-related questions. These questions are stored in a MongoDB database using Mongoose ODM for data modeling.

Multiple endpoints are available to retrieve all questions, retrieve random questions with optional category filtering and discarding of asked questions (7 questions), retrieve all question categories, and perform answer validation.

The backend is well-structured with separate controllers and routes. There's also a script you can run to automatically initialize the database.

I've included a web-based demo using plain HTML, CSS, and JavaScript to demonstrate how the API works.

![Screenshot](https://i.imgur.com/fVkS5Jz.png)

### Environment Variables

see : [.env.example](.env.example)

```bash
PORT=5000                           # Server port
MONGODB_URI="mongodb://..."         # MongoDB connection string
```

## Scripts

- **Watch Mode**: `npm run dev` - Auto-reloads on file changes (requires node v20.6.0 or higher)
- **Seeding DB**: `npm run seed` - Populate database with [questions.json](data/questions.json)
- **Production**: `npm start` - Run in production mode

## Installation

!!! Your node version should be at least **v20.6.0** or higher.
Or you could download and configure dotenv.
see : [support for .env files](https://nodejs.org/dist/latest-v22.x/docs/api/cli.html#--env-fileconfig)

### 1. Download the repository

```bash
git clone https://github.com/caglayagmuricerr/xyz-quiz-api.git
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Follow the steps below to install and configure MongoDB. (Ubuntu)

#### 3.1. Download and install MongoDB:

- download community server
  ```bash
  https://www.mongodb.com/try/download/community
  ```
- download shell
  ```bash
  https://www.mongodb.com/try/download/shell
  ```

#### 3.2. Start MongoDB server:

```bash
sudo systemctl start mongod
```

```bash
sudo systemctl enable mongod
```

#### 3.3. Enable authorization

- go into etc/mongod.conf

- add
  ```bash
  security:
    authorization: enabled
  ```

#### 3.4. Create a user with admin privileges:

```bash
  mongosh
```

```bash
  use admin
```

```bash
  db.createUser({
    user: "username",
    pwd: "password",
    roles: [
      { role: "readWriteAnyDatabase", db: "admin" },
      { role: "root", db: "admin" },
      { role: "userAdminAnyDatabase", db: "admin" }
    ]
    });
```

#### 3.5. Restart MongoDB server:

```bash
  sudo systemctl restart mongod
```

#### 3.6. Update the .env file with your MongoDB URI:

```bash
  MONGODB_URI="mongodb://username:password@localhost:27017/xyz-quiz-db?authSource=admin"
```

You can connect to MongoDB from shell using:

```bash
  mongosh --username username --password password --authenticationDatabase admin
```

### 4. Run seed script

Populates xyz-quiz-db database with questions from questions.js

```bash
  npm run seed
```

### 5. Run the application:

```bash
  npm start
```

or

```bash
  npm run dev
```

## API Reference

#### Question Routes

| Method | Endpoint                    | Description                                                                  |
| :----- | :-------------------------- | :--------------------------------------------------------------------------- |
| `GET`  | `/api/questions`            | Returns all questions (excludes answers)                                     |
| `GET`  | `/api/question/random`      | Returns a random question. Optional query params: categories and excludeIds. |
| `GET`  | `/api/questions/categories` | Returns a list of all question categories.                                   |

#### Answer Routes

| Method | Endpoint      | Description                                                                                       |
| :----- | :------------ | :------------------------------------------------------------------------------------------------ |
| `POST` | `/api/answer` | Checks if the selected answer is correct. Requires questionId and selectedOption in the req body. |

## Example Requests and responses

### Questions

#### `GET /api/questions`

Returns all questions (without answers)

**Response:**

```json
[
  {
    "_id": "68794266828d25c6c7541ceb",
    "question": "What does 'grep' command do in Linux?",
    "options": [
      "Copy files",
      "Search text patterns",
      "Remove files",
      "Change permissions"
    ],
    "category": "Linux Commands",
    "difficulty": "medium",
    "timeLimit": 60,
    "__v": 0
  },
  {
    "_id": "68794266828d25c6c7541cec",
    "question": "Which command shows the current working directory?",
    "options": ["pwd", "cwd", "dir", "where"],
    "category": "Linux Commands",
    "difficulty": "easy",
    "timeLimit": 60,
    "__v": 0
  },
  .
  .
  .
]
```

#### `GET /api/question/random`

Gets a random question with optional filtering.

**Query Parameters:**

- `categories` (optional): Comma-separated list of categories
- `excludeIds` (optional): Comma-separated list of question IDs to exclude

**Example:**

```
GET /api/question/random?categories=Git,JavaScript&excludeIds=64a1b2c3d4e5f6
```

**Response:**

```json
{
  "_id": "68794266828d25c6c7541cef",
  "question": "What does '===' operator do in JavaScript?",
  "options": [
    "Assigns value",
    "Compares value only",
    "Compares value and type",
    "Compares type only"
  ],
  "category": "JavaScript",
  "difficulty": "medium",
  "timeLimit": 60,
  "__v": 0
}
```

#### `GET /api/questions/categories`

Returns all question categories.

**Response:**

```json
["JavaScript", "Git", "Linux Commands"]
```

### Answers

#### `POST /api/answer`

Validates the answer user submitted.

**Request Body:**

```json
{
  "questionId": "64a1b2c3d4e5f6",
  "selectedOption": "xyz"
}
```

**Response:**

```json
{
  "isCorrect": true,
  "correctAnswer": "xyz"
}
```

### Test Scenarios

#### Question Routes Tests

##### `GET /api/questions`

**Test Case 1: Successful retrieval of all questions**

- **Scenario**: Request all questions from populated database
- **Expected**: 200 status, array of questions without answer field
- **Verification**: Check that response is array, contains question structure, no answer field present

**Test Case 2: Empty database**

- **Scenario**: Request all questions from empty database
- **Expected**: 200 status, empty array `[]`

**Test Case 3: Database connection error**

- **Scenario**: Database is unavailable
- **Expected**: 500 status, error message

##### `GET /api/question/random`

**Test Case 1: Get random question without filters**

- **Scenario**: Request random question with no query parameters
- **Expected**: 200 status, single question object without answer field
- **Verification**: Response contains \_id, question, options, category, difficulty, timeLimit

**Test Case 2: Filter by single category**

- **Scenario**: `GET /api/question/random?categories=JavaScript`
- **Expected**: 200 status, question from JavaScript category only
- **Verification**: Returned question.category === "JavaScript"

**Test Case 3: Filter by multiple categories**

- **Scenario**: `GET /api/question/random?categories=JavaScript,Git,Linux Commands`
- **Expected**: 200 status, question from one of specified categories
- **Verification**: Returned question.category is in the requested categories

**Test Case 4: Exclude specific question IDs**

- **Scenario**: `GET /api/question/random?excludeIds=64a1b2c3d4e5f6,64a1b2c3d4e5f7`
- **Expected**: 200 status, question not in exclude list
- **Verification**: Returned question.\_id not in excludeIds array

**Test Case 5: Combine filters**

- **Scenario**: `GET /api/question/random?categories=JavaScript&excludeIds=64a1b2c3d4e5f6`
- **Expected**: 200 status, JavaScript question not in exclude list

**Test Case 6: No questions match filters**

- **Scenario**: Request with category that doesn't exist
- **Expected**: 404 status, "No questions found" message

**Test Case 7: All questions excluded**

- **Scenario**: Exclude all question IDs in a category
- **Expected**: 200 status, reset filter and return question from that category
- **Verification**: Should fallback and return any question from the category

**Test Case 8: Invalid category filter**

- **Scenario**: Request with non-existent category
- **Expected**: 404 status, "No questions found" message

##### `GET /api/questions/categories`

**Test Case 1: Get all categories**

- **Scenario**: Request all available categories
- **Expected**: 200 status, array of unique category strings
- **Verification**: Array contains expected categories like ["JavaScript", "Git", "Linux Commands"]

#### Answer Routes Tests

##### `POST /api/answer`

**Test Case 1: Correct answer submission**

- **Scenario**: Submit correct answer for a question
- **Request Body**:
  ```json
  {
    "questionId": "valid-question-id",
    "selectedOption": "correct-answer"
  }
  ```
- **Expected**: 200 status, `{ "isCorrect": true, "correctAnswer": "correct-answer" }`

**Test Case 2: Incorrect answer submission**

- **Scenario**: Submit wrong answer for a question
- **Request Body**:
  ```json
  {
    "questionId": "valid-question-id",
    "selectedOption": "wrong-answer"
  }
  ```
- **Expected**: 200 status, `{ "isCorrect": false, "correctAnswer": "actual-correct-answer" }`

**Test Case 3: Missing questionId**

- **Scenario**: Submit answer without questionId
- **Request Body**:
  ```json
  {
    "selectedOption": "some-answer"
  }
  ```
- **Expected**: 400 status, "questionId and selectedOption are required" message

**Test Case 4: Missing selectedOption**

- **Scenario**: Submit without selectedOption
- **Request Body**:
  ```json
  {
    "questionId": "valid-question-id"
  }
  ```
- **Expected**: 400 status, "questionId and selectedOption are required" message

**Test Case 5: Empty request body**

- **Scenario**: Submit POST request with empty body
- **Request Body**: `{}`
- **Expected**: 400 status, "questionId and selectedOption are required" message

**Test Case 6: Invalid questionId**

- **Scenario**: Submit answer for non-existent question
- **Request Body**:
  ```json
  {
    "questionId": "64a1b2c3d4e5f9",
    "selectedOption": "some-answer"
  }
  ```
- **Expected**: 404 status, "Question not found" message

**Test Case 7: selectedOption is null**

- **Scenario**: Submit null as selectedOption
- **Request Body**:
  ```json
  {
    "questionId": "valid-question-id",
    "selectedOption": null
  }
  ```
- **Expected**: 400 status (since selectedOption === undefined check)

**Test Case 8: selectedOption is empty string**

- **Scenario**: Submit empty string as answer
- **Request Body**:
  ```json
  {
    "questionId": "valid-question-id",
    "selectedOption": ""
  }
  ```
- **Expected**: 200 status, should process normally (empty string is valid. its just the wrong answer)

### Postman Tests

https://www.postman.com/joint-operations-geoscientist-18058594/workspace/xyz/collection/28718637-2a63febf-0314-4283-86c8-0fa54f843bc3?action=share&creator=28718637

## License

[MIT](https://choosealicense.com/licenses/mit/)
