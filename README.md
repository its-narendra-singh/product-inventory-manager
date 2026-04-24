# 📦 Product Inventory Manager (MERN)

A full-stack Product Inventory Manager built using the MERN stack.
This application allows authenticated users to manage their own product inventory with search, filtering, sorting, pagination, and dashboard insights.

---

## 🚀 Quick Start (Recommended — Docker)

### 1. Clone the repository

```bash id="c8px2p"
git clone <your-repo-url>
cd product-inventory-manager
```

---

### 2. Create environment file

Create a `.env` file in the **backend folder**:

```bash id="8c7l2c"
cd backend
cp .env.example .env
```

Update `.env` with required values:

```env id="dbnhg6"
PORT=5000
MONGO_URI=mongodb://mongo:27017/product-inventory
MONGO_TEST_URI=mongodb://mongo:27017/product-inventory-test
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

👉 Important:

- When using Docker, use `mongo` as host (NOT localhost)

---

### 3. (Optional) Frontend environment

Create `.env` in **frontend folder**:

```bash id="r7n91q"
cd ../frontend
cp .env.example .env
```

```env id="8rcs1w"
VITE_API_URL=http://localhost:5000
```

---

### 4. Run the application

Go back to root:

```bash id="7ap6e2"
cd ..
docker-compose up --build
```

---

### 5. Access the application

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

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

- Fully containerized setup (frontend, backend, database)
- One-command startup via Docker Compose

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

## 💻 Local Development (Without Docker)

### Backend

```bash id="v3o4aj"
cd backend
npm install
cp .env.example .env
npm run dev
```

👉 Ensure MongoDB is running locally:

```bash id="yx1r0c"
docker run -d -p 27017:27017 --name mongo mongo
```

---

### Frontend

```bash id="4k4y0m"
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## 🧪 Running Tests

```bash id="1b6p2y"
cd backend
npm test
```

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

- Multi-tenant design using `createdBy`
- Scenario-based testing with real DB
- RESTful API with standardized responses
- Local file storage (S3-ready structure)

---

## ⚠️ Known Limitations

- Local file storage (not cloud-based)
- No role-based UI
- No real-time updates

---

## 🚀 Future Improvements

- AWS S3 integration
- Role-based access control
- WebSocket updates
- Advanced analytics

---

## ✅ Verification

Tested via:

- Fresh clone
- Docker setup
- Local setup

---

## 👨‍💻 Author

Narendra Singh

---

## 📝 License

Technical assessment project
