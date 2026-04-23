# 🧠 Skill: Frontend Architecture (React + React Query)

## 🎯 Goal
Build scalable, clean, responsive UI with proper state management.

---

## 🏗️ Structure

frontend/
- components/
- pages/
- hooks/
- api/
- services/
- routes/
- utils/

---

## 🔥 Rules

1. Use React Query for ALL API calls
2. Do NOT use raw useEffect for fetching
3. Keep components small and reusable

---

## 🔁 Data Fetching

- useQuery → GET
- useMutation → POST/PUT/DELETE

---

## 🔎 Search Optimization

- Debounce input
- Avoid unnecessary API calls

---

## 🌐 Routing

Use React Router v6

Support:
- Protected routes
- URL-based filters

---

## ⚡ UX Requirements

- Loading skeletons
- Error states
- Empty states

---

## 🔐 Auth Handling

- Store access token in memory
- Handle refresh flow silently

---

## 🚫 Anti-patterns

- Global state misuse ❌
- Fetch inside components ❌
- No loading state ❌