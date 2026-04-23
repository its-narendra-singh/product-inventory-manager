# 🧠 Skill: Database Design (MongoDB + Mongoose)

## 🎯 Goal
Design efficient, scalable schemas with proper indexing.

---

## 📦 Collections

### Users
- email (unique)
- password
- role
- refreshToken

### Products
- name
- description
- price
- category
- stock
- sku (unique)
- imageUrl
- createdBy

---

## 🔍 Indexing

- Text index:
  name + description

---

## ⚡ Query Rules

Always include:
createdBy: userId

---

## 📊 Aggregations

Used in dashboard:
- total products
- total value
- low stock count

---

## 🚫 Anti-patterns

- No indexing ❌
- Fetch all data ❌
- No ownership filtering ❌