# Yazılım.xyz Quiz API - NodeJS

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

... todo

## License

[MIT](https://choosealicense.com/licenses/mit/)
