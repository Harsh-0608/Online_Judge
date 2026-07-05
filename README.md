# CodePlex

A full-stack Online Judge platform where users can solve programming challenges, compile and run code, and view contest leaderboards.

## Features

- **Multi-Language Support**: Supports JavaScript, Python, C++, and Java.
- **Code Execution Sandbox**: Secure local sandbox execution for user submissions.
- **Complexity Analyzer**: Code complexity analysis and feedback.
- **Custom Input**: Test code against custom inputs.
- **Contest System**: Live standings and leaderboards.
- **Modern UI**: Clean dashboard and IDE interface with dark mode.

## Tech Stack

- **Frontend**: React, Vite, CSS
- **Backend**: Node.js, Express, MongoDB
- **Sandbox**: Local sandboxed runner
- **Deployment**: Docker, Docker Compose, Nginx

---

## Getting Started

### Setup

#### 1. Clone the repository
```bash
git clone https://github.com/Harsh-0608/Online_Judge.git
cd Online_Judge
```

#### 2. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/online-judge
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=7d
   ```
4. Seed the database with sample problems:
   ```bash
   node scripts/seedProblems.js
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

#### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` to view the app.

---

### Running with Docker Compose
To run the entire stack with Docker:
```bash
docker compose up --build
```
Once running, seed the database:
```bash
docker exec -it codeplex-backend node scripts/seedProblems.js
```
