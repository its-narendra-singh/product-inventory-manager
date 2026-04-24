# 📦 Product Inventory Manager (MERN)

A full-stack Product Inventory Manager built using the MERN stack.
This application allows authenticated users to manage their own product inventory with search, filtering, sorting, pagination, and dashboard insights.

---

## 🚀 Features

### 🔐 Authentication

- Register / Login with JWT
- Access + Refresh token flow
- Secure logout
- Role-based schema (extensible)

---

### 📦 Product Management

- Create, update, delete products
- View product details
- Upload product images (local storage)
- Ownership enforcement (multi-tenant)

---

### 🔍 Advanced Querying

- Server-side search (name + description)
- Filtering (category, stock)
- Sorting (price, date, stock)
- Pagination (server-side)

---

### 📊 Dashboard

- Total products
- Total inventory value
- Low-stock products

---

### ⚡ Frontend UX

- Built with React + Tailwind CSS
- Debounced search
- URL-based filters
- Loading skeletons
- Clean and responsive UI

---

### 🧪 Testing

- Full backend test coverage (Jest + Supertest)
- Scenario-based testing (not just happy paths)
- Auth + Product + Dashboard coverage

---

### 🐳 Docker Support

- Fully containerized setup
- One-command startup

---

## 🏗️ Tech Stack

### Backend

- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Joi/Zod Validation

### Frontend

- React 18 (Vite)
- Tailwind CSS
- React Query (TanStack)
- React Router v6

### DevOps & Testing

- Docker + Docker Compose
- Jest + Supertest
- Cypress (E2E ready)

---

## 📁 Project Structure

```bash
root/
 ├── backend/
 ├── frontend/
 ├── docker-compose.yml
 └── README.md
```

---

## ⚙️ Setup Instructions

### 🔹 Prerequisites

Make sure you have installed:

- Node.js (v18+ recommended)
- Docker & Docker Compose

---

## 🐳 Option 1: Run with Docker (Recommended)

👉 One command setup:

```bash
docker-compose up --build
```

### 🔗 Services

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- MongoDB: running inside Docker

---

## 💻 Option 2: Local Development Setup

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd product-inventory-manager
```

---

### 2. Setup Backend

```bash
cd backend
npm install
```

Create `.env` file:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/product-inventory
MONGO_TEST_URI=mongodb://localhost:27017/product-inventory-test
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

### 3. MongoDB Requirement (Local Development)

If you are running the backend locally (without Docker), make sure MongoDB is running.

You can quickly start MongoDB using Docker:

````bash
docker run -d -p 27017:27017 --name mongo mongo

Run backend:

```bash
npm run dev
````

---

### 4. Setup Frontend

```bash
cd frontend
npm install
```

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

Run frontend:

```bash
npm run dev
```

---

## 🧪 Running Tests

Backend tests:

```bash
cd backend
npm test
```

### Notes:

- Uses test database (`MONGO_TEST_URI`)
- Database is cleaned after each test
- Tests run sequentially (`--runInBand`)

---

## 🔐 Environment Variables

| Variable           | Description           |
| ------------------ | --------------------- |
| MONGO_URI          | Main database         |
| MONGO_TEST_URI     | Test database         |
| JWT_ACCESS_SECRET  | Access token secret   |
| JWT_REFRESH_SECRET | Refresh token secret  |
| VITE_API_URL       | Frontend API base URL |

---

## 📌 Architecture Decisions

### 🔹 Multi-Tenant Design

Each user can only access their own products using `createdBy` filtering.

---

### 🔹 Test Strategy

- Test-first (scenario-driven)
- Full coverage of edge cases
- Real DB testing (Docker Mongo)

---

### 🔹 File Upload

- Local storage used for assignment
- Easily replaceable with AWS S3 in production

---

### 🔹 API Design

- RESTful architecture
- Standard response format
- Centralized error handling

---

## ⚠️ Known Limitations

- Local file storage (not cloud-based)
- No role-based UI (backend ready)
- No real-time updates

---

## 🚀 Future Improvements

- AWS S3 integration
- Role-based access control (admin panel)
- WebSocket for real-time updates
- Advanced analytics dashboard

---

## 👨‍💻 Author

Narendra Singh
Senior Full Stack Developer

---

## 📝 License

This project is part of a technical assessment.
