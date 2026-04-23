# 📌 Plan-01: Project Setup & Foundational Architecture

## 🎯 Goal
Establish the foundational structure for backend and frontend, configure development environment, and prepare the system for feature development with test-first workflow.

---

## 📦 Scope

This plan includes:
- Repository structure setup
- Backend base setup (Express + config + structure)
- Frontend base setup (React + Vite)
- Docker setup (backend + frontend + MongoDB)
- Linting & formatting setup
- Base utilities (error handling, response format)
- Initial test environment setup (Jest + Supertest)

---

## 📂 Related Context

- `.claude/context.md`
- `.claude/skills/backend.md`
- `.claude/skills/frontend.md`
- `.claude/skills/devops.md`
- `.claude/skills/testing.md`

---

## 📤 Expected Output

By the end of this plan:
- Project runs via Docker
- Backend server runs with clean structure
- Frontend runs with routing setup
- Jest is configured and ready
- ESLint + Prettier working
- Base response + error system ready

---

# 🧩 Phases

---

## 🅐 Phase A — Repository & Folder Structure Setup
**Status:** ✅ Completed

### 🎯 Objective
Create clean and scalable folder structure for backend and frontend.

### ⚙️ Steps
1. Initialize root project
2. Create:
   - backend/
   - frontend/
   - .claude/

3. Backend structure:
   - controllers/
   - routes/
   - models/
   - middlewares/
   - validators/
   - services/
   - utils/
   - config/
   - tests/

4. Frontend structure:
   - components/
   - pages/
   - hooks/
   - api/
   - services/
   - routes/
   - utils/

5. Add `.gitignore`

---

### ✅ Verification
- Folder structure matches defined architecture
- No unnecessary files present

---

## 🅑 Phase B — Backend Base Setup
**Status:** ✅ Completed

### 🎯 Objective
Initialize Express app with scalable architecture.

---

### ⚙️ Steps
1. Initialize Node project
2. Install dependencies:
   - express
   - mongoose
   - dotenv
   - cors
   - helmet
   - morgan

3. Setup:
   - app.js
   - server.js

4. Connect MongoDB via config

5. Setup middleware:
   - JSON parser
   - CORS
   - security headers

---

### ✅ Verification
- Server runs successfully
- DB connects successfully

---

## 🅒 Phase C — Base Architecture (Core Utilities)
**Status:** ✅ Completed

### 🎯 Objective
Setup reusable core utilities.

---

### ⚙️ Steps
1. Create standardized API response utility
2. Create error class utility
3. Setup centralized error middleware
4. Setup async handler wrapper

---

### ✅ Verification
- API responses follow standard format
- Errors handled centrally

---

## 🅓 Phase D — Testing Setup (Test-First Foundation)
**Status:** ✅ Completed

### 🎯 Objective
Prepare full backend testing environment.

---

### ⚙️ Steps
1. Install:
   - jest
   - supertest
   - mongodb-memory-server (optional but recommended)

2. Configure Jest
3. Setup test folder structure:
   - tests/auth/
   - tests/product/
   - tests/dashboard/

4. Add base test example

---

### 🧪 Test Cases
- Basic health check endpoint

---

### ✅ Verification
- `npm test` runs successfully
- Test passes

---

## 🅔 Phase E — Frontend Base Setup
**Status:** ⏳ Pending

### 🎯 Objective
Initialize React app with routing.

---

### ⚙️ Steps
1. Setup React (Vite)
2. Install:
   - react-router-dom
   - axios
   - @tanstack/react-query

3. Setup routing:
   - /login
   - /register
   - /dashboard
   - /products

4. Setup QueryClientProvider

---

### ✅ Verification
- App runs
- Routes work

---

## 🅕 Phase F — Linting & Formatting
**Status:** ⏳ Pending

### 🎯 Objective
Ensure code quality and consistency.

---

### ⚙️ Steps
1. Setup ESLint
2. Setup Prettier
3. Add scripts:
   - lint
   - format

---

### ✅ Verification
- Lint passes without errors

---

## 🅖 Phase G — Docker Setup
**Status:** ⏳ Pending

### 🎯 Objective
Containerize full application.

---

### ⚙️ Steps
1. Create Dockerfile for backend
2. Create Dockerfile for frontend
3. Setup docker-compose:
   - backend
   - frontend
   - mongodb

4. Setup MongoDB volume

---

### ✅ Verification
- `docker-compose up` runs successfully
- All services connected

---

## 🅗 Phase H — Environment Configuration
**Status:** ⏳ Pending

### 🎯 Objective
Setup environment variables properly.

---

### ⚙️ Steps
1. backend/.env.example
2. frontend/.env.example
3. Add required variables:
   - DB URI
   - JWT secrets
   - API URL

---

### ✅ Verification
- App runs using env variables

---

# 🧠 Execution Rules

- Execute ONE phase at a time
- Do NOT move to next phase without verification
- Follow test-first approach where applicable
- No assumptions — follow context strictly