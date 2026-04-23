# 🧠 Skill: Testing Strategy (Test-First, Scenario-Complete Approach)

## 🎯 Goal
Ensure complete system correctness by defining ALL test cases upfront and implementing logic to satisfy them in one structured pass.

This is NOT iterative TDD (red-green-refactor).
This is FULL TEST-FIRST DEVELOPMENT.

---

## ⚠️ CORE PRINCIPLE

1. First define ALL scenarios
2. Then write COMPLETE test suite (covering all cases)
3. Then implement logic to satisfy ALL tests
4. Tests and implementation must ALWAYS stay aligned

---

## 🔁 DEVELOPMENT FLOW (STRICT)

For EVERY feature:

### Step 1: Scenario Design
Identify ALL possible cases:

- Happy paths
- Validation failures
- Authentication failures
- Authorization failures
- Edge cases
- Failure scenarios

---

### Step 2: Write FULL Test Suite

- Write ALL test cases upfront
- Do NOT partially write tests
- Do NOT write only happy path tests

Tests must represent COMPLETE expected system behavior

---

### Step 3: Implement Logic

- Now implement controllers/services
- Code must satisfy ALL test cases
- Do NOT hardcode just to pass tests

---

### Step 4: Verify

- Run all tests
- Ensure 100% pass
- Fix logic if any test fails

---

## 🧪 Backend Testing Stack

- Jest → test runner
- Supertest → API testing

---

## 📦 REQUIRED TEST COVERAGE

Every feature MUST include:

### ✅ Happy Path
- Valid input → success

---

### ❌ Validation Errors
- Missing required fields
- Invalid formats
- Boundary violations

---

### 🔐 Authentication Errors
- Missing token → 401
- Invalid token → 401
- Expired token → 401

---

### 🚫 Authorization Errors
- Accessing another user’s resource → 403

---

### ⚠️ Edge Cases
- Empty datasets
- Duplicate entries (email, SKU)
- Invalid ObjectId
- Large inputs

---

### 💥 Failure Cases
- Resource not found → 404
- DB-related failures (where applicable)

---

## 🧩 Example: Product Update Tests

Must include:

- Update own product → 200
- Update another user’s product → 403
- Update with invalid data → 400
- Update non-existing product → 404
- Update without token → 401

---

## 🔐 Auth Test Scenarios

### Register:
- Valid registration → success
- Duplicate email → fail
- Invalid email → fail
- Weak password → fail

---

### Login:
- Valid credentials → success
- Wrong password → fail
- Non-existing user → fail

---

### Refresh Token:
- Valid token → new access token
- Invalid token → fail
- Expired/rotated token → fail

---

### Logout:
- Valid logout → success
- Reuse of invalidated token → fail

---

## 📊 ASSERTIONS (MANDATORY)

Each test MUST verify:

- HTTP status code
- Response structure
- Response message
- Data correctness

---

## 🔁 API RESPONSE FORMAT VALIDATION

All tests MUST validate:

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
  error: optional
}

---

## 🚫 STRICT RULES

- DO NOT write implementation before test completion
- DO NOT skip edge cases
- DO NOT write partial test coverage
- DO NOT ignore failing tests
- DO NOT modify tests just to pass incorrect logic

---

## 🔁 ALIGNMENT RULE

Whenever logic changes:
- Tests MUST be reviewed
- Tests MUST reflect actual behavior
- No mismatch allowed between logic and tests

---

## 🌐 E2E TESTING (CYPRESS)

Test full flows:

- Register → Login → Create Product → Update → Delete
- Unauthorized access attempts
- Token expiration scenarios

---

## 🧪 TEST ORGANIZATION

backend/tests/
- auth/
- product/
- dashboard/

Each file:
- grouped by feature
- descriptive test cases

---

## 🧠 FINAL PRINCIPLE

Tests DEFINE the system behavior.

Implementation is ONLY written to satisfy those tests.

---

## 🚀 EXPECTED OUTCOME

- Complete coverage of all scenarios
- No hidden bugs
- No regression risk
- Production-level confidence