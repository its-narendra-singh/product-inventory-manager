# 📌 Plan-03: Product Module (CRUD + Query Engine)

## 🎯 Goal

Implement complete product management with strict ownership, server-side querying, and full test coverage.

---

## 📦 Scope

- Product schema
- CRUD APIs
- Ownership enforcement
- Search (text index)
- Filter (category, stock)
- Sort
- Pagination
- Validation
- Full test coverage

---

## 📂 References

- `.claude/context.md`
- `.claude/skills/backend.md`
- `.claude/skills/database.md`
- `.claude/skills/testing.md`

---

## 📤 Expected Output

- Fully working product APIs
- Query engine (search/filter/sort/paginate)
- Strict ownership enforcement
- All tests passing

---

# 🧩 Phases

## 🅐 Phase A — Product Schema & Indexing

**Status:** ✅ Complete

- Define schema
- Add text index (name + description)

---

## 🅑 Phase B — Product Test Suite (FULL)

**Status:** ✅ Complete

- Create product
- Get products (with query params)
- Update (owner + non-owner)
- Delete (owner + non-owner)
- Edge cases

---

## 🅒 Phase C — Product CRUD Implementation

**Status:** ✅ Complete

- Controllers + services

---

## 🅓 Phase D — Query Engine

**Status:** ✅ Complete

- Search
- Filter
- Sort
- Pagination

---

## 🅔 Phase E — Ownership Enforcement

**Status:** ✅ Complete

- createdBy checks in all queries

---

## 🅕 Phase F — Validation Layer

**Status:** ✅ Complete

- Joi/Zod validation

---

## 🅖 Phase G — Final Verification

**Status:** ✅ Complete

- All tests pass
- Response format compliance
