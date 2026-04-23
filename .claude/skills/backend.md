# 🧠 Skill: Backend Architecture (Node.js + Express + MongoDB)

## 🎯 Goal
Build a scalable, modular, production-ready backend using Express.

---

## 🏗️ Structure

backend/
- controllers/
- routes/
- models/
- middlewares/
- validators/
- services/
- utils/
- config/
- tests/

---

## 🔥 Rules

1. Controllers must NOT contain business logic
2. Services handle all business logic
3. Validation happens before controller
4. Use asyncHandler wrapper (no try-catch everywhere)

---

## 🔐 Auth Implementation

- JWT for access token
- Refresh token stored in DB (hashed)
- Rotate refresh token

---

## 🧱 Middleware

- auth.middleware → verifies JWT
- role.middleware → checks roles
- error.middleware → centralized error handler
- rateLimiter → auth routes protection

---

## 📦 Database Rules

- Use Mongoose
- Use schema validation
- Use indexes (text index for search)

---

## 🔍 Query Handling

Always support:
- search
- filter
- sort
- pagination

Use:
.skip()
.limit()

---

## 🧪 Testing

- Jest + Supertest
- Cover:
  - auth
  - CRUD
  - ownership

---

## 🚫 Anti-patterns

- Fat controllers ❌
- Business logic in routes ❌
- No validation ❌
- No error handling ❌