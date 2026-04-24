# 🧠 Skill: Frontend Architecture (React + Tailwind + React Query)

## 🎯 Goal

Build a scalable, clean, and modern UI using React, Tailwind CSS, and structured state management.

---

## 🏗️ Tech Stack

- React 18 (Vite)
- Tailwind CSS (for styling)
- React Query (TanStack) for data fetching
- Axios for API calls
- React Router v6 for routing

---

## 🎨 Styling Strategy

### Tailwind CSS (Primary)

- Use utility-first styling
- Avoid inline styles or custom CSS unless necessary
- Keep styles consistent and reusable

---

## 🧩 Component Strategy

- Build reusable UI components:
  - Button
  - Input
  - Modal
  - Table
  - Loader / Skeleton

- Keep components:
  - Small
  - Reusable
  - Stateless where possible

---

## 📁 Folder Structure

frontend/

- components/
- pages/
- hooks/
- api/
- services/
- routes/
- utils/
- styles/ (if needed)

---

## 🔁 Data Fetching

- useQuery → GET
- useMutation → POST/PUT/DELETE
- Centralized API layer (api/ or services/)

---

## 🔎 Search Optimization

- Debounced input
- Avoid unnecessary API calls
- Sync with URL query params

---

## 🌐 Routing

Use React Router v6

Routes:

- /login
- /register
- /dashboard
- /products
- /products/new
- /products/:id/edit

---

## 🔐 Auth Handling

- Store access token in memory (or secure storage)
- Handle refresh token flow silently
- Protect routes using wrapper

---

## ⚡ UX Requirements

- Loading skeletons (NOT just spinners)
- Error states
- Empty states

---

## 🔗 URL-based State

Use query params for:

- search
- filter
- pagination

Example:
`/products?search=abc&page=2`

---

## 🚫 Anti-patterns

- Fetching inside components without React Query ❌
- Large monolithic components ❌
- Hardcoded API calls ❌
- No loading/error states ❌
