# Coding Standards & Architecture Invariants

This document defines the strict architectural standards and review criteria for the project. These rules must be enforced during code reviews and development.

---

## 1. Authentication & Security (身分驗證與安全)

- **Pure Database Authentication**:
  - All admin credentials must be validated strictly against the Cloudflare D1 `admin_users` table with SHA-256 hashed passwords.
  - **ZERO Hardcoded Credentials**: Never write hardcoded fallback usernames, passwords, or bypass branches in `src/`.
  - **HMAC Signed Sessions**: Authenticated requests must use cryptographically signed HMAC session tokens stored in secure, HttpOnly cookies (`admin_session`) or Bearer tokens.
  - Fail closed on any authentication error (HTTP 401 Unauthorized).

## 2. Persistence & Error Handling (持久化與容錯策略)

- **Fail-Closed Persistence**:
  - Never implement in-memory mock arrays or fallback seed constants in production handlers (`src/`).
  - If a D1 database query fails or a schema column is missing, the application must throw or return a proper HTTP 500 / maintenance response. Masking database failures with hardcoded in-memory state is strictly prohibited.
- **Explicit Empty States**:
  - When the database has 0 published articles, the UI must render an informative empty state message (`"尚無文章發布，請稍後再嘗試。"`), rather than silently populating default seed posts.
- **Accurate Aggregations**:
  - Distinct entity counts (such as total published posts) must be queried directly from D1 (e.g., `COUNT(*) as count FROM posts WHERE is_published = 1`), never derived by summing multi-tag associations.

## 3. Production Hygiene & Diagnostics (生產環境衛生)

- **No Diagnostic Endpoints in Production**:
  - Never commit unauthenticated debug or introspection endpoints (e.g. `/api/db-diagnostics`) to production route files.
  - To inspect remote database state, use the Cloudflare Wrangler CLI directly:
    ```powershell
    npx.cmd wrangler d1 execute DB --remote --command "PRAGMA table_info(posts);"
    ```

## 4. Test Hygiene & Seams (測試隔離規範)

- **Test Isolation**:
  - Mock databases, synthetic fixtures, and in-memory mock stores belong exclusively in `tests/` (e.g., `tests/helpers/mockDb.ts`).
  - Tests exercising route handlers must supply a mock database instance via `{ DB: mockDb }` in `app.request()`.
- **Migration Verification**:
  - All SQL files in `migrations/*.sql` must be sequentially executable on standard SQLite and verified by `tests/migrations.test.ts`.
