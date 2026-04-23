# 📦 Project Context — Product Inventory Manager (MERN)

## 🎯 Project Overview
This is a full-stack MERN application for managing product inventory in a multi-tenant environment. Each authenticated user manages their own private inventory.

This project is part of a senior full-stack developer assessment and must demonstrate:
- Clean architecture
- Scalable design
- Secure authentication
- Production-level coding practices

---

## 🧠 Core Principles

1. Multi-tenant system (STRICT data isolation)
   - Users can ONLY access their own data
   - Enforced at database query level

2. Backend-driven logic
   - Search, filtering, sorting, pagination MUST be server-side

3. Clean architecture over quick hacks
   - Controllers should be thin
   - Business logic in services

4. No assumptions
   - Every behavior must be explicitly implemented

---

## 🔐 Authentication Strategy

- JWT-based authentication
- Access Token (short-lived)
- Refresh Token (stored in DB, hashed)

### Flow:
1. User logs in → receives access + refresh token
2. Access token used for API calls
3. On expiry → refresh token used to get new access token
4. Refresh token is rotated on every use

### Storage:
- Access Token → frontend memory
- Refresh Token → httpOnly cookie

---

## 👤 User Model

Fields:
- name
- email (unique)
- password (hashed)
- role (enum: user, admin — default: user)
- refreshToken (hashed)

---

## 📦 Product Model

Fields:
- name (required)
- description (optional)
- price (number >= 0)
- category
- stock (integer >= 0)
- sku (optional, unique)
- imageUrl (string)
- createdBy (ObjectId → User)
- timestamps

---

## 🚫 Data Access Rules

- All product routes are protected
- Queries MUST include:
  createdBy = req.user.id

- Unauthorized access → 403

---

## 🔍 API Features

### Products API supports:
- Search (text index on name + description)
- Filter (category, inStock)
- Sort (price, createdAt, stock)
- Pagination (page, limit)

---

## 📊 Dashboard

Endpoint:
GET /api/dashboard/stats

Returns:
- totalProducts
- totalValue
- lowStockCount

---

## 🧪 Testing Strategy

Backend:
- Jest (unit + integration)
- Supertest (API testing)

E2E:
- Cypress

Frontend:
- NOT required (optional, skipped)

---

## ⚡ Performance & Enhancements

Must include:
- Debounced search (frontend)
- API response standard format
- Rate limiting (auth routes)
- Seed script
- Loading skeleton UI

---

## 🧹 Code Quality

- ESLint configured
- Prettier configured
- No console logs
- Clean folder structure

---

## 🐳 Infrastructure

- Dockerized setup using docker-compose
- Services:
  - backend
  - frontend
  - mongodb

- MongoDB via Docker (NOT Atlas)

---

## 🖼️ File Upload Strategy

- Local storage (/uploads)
- Save path in DB

NOTE:
Mention in README that production would use S3

---

## 🌐 Frontend Routing

- /login
- /register
- /dashboard
- /products
- /products/new
- /products/:id/edit

Supports:
- URL-based filtering:
  /products?search=abc&category=xyz&page=1

---

## 🔁 API Response Format (MANDATORY)

All responses must follow:

Success:
{
  success: true,
  message: string,
  data: any
}

Error:
{
  success: false,
  message: string,
  error: details (optional)
}

---

## ⚠️ Critical Requirements (Do NOT Miss)

- Ownership enforcement
- Input validation (Joi/Zod)
- Centralized error handling
- Server-side pagination
- Secure token handling

---

## 🧠 Philosophy

This project must feel like:
"A production-ready system built by a senior engineer"

NOT:
"A demo CRUD app"