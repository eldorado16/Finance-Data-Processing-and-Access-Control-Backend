# Finance Dashboard Backend

Secure backend API for a finance dashboard with JWT authentication, role-based access control, transaction management, and analytics.

## Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- JWT + bcryptjs
- Zod validation

## Features
- Auth: register/login with JWT
- RBAC: `admin`, `analyst`, `viewer`
- Users: list and role/status updates (admin only)
- Records: create/read/update/delete with filters
- Analytics: summary, category breakdown, monthly trends
- Security: auth rate limiting, safe error responses, security headers

## Project Structure
- `config/` database connection
- `models/` Mongoose models
- `controllers/` business logic
- `routes/` API routes
- `middleware/` auth, RBAC, validation, rate limit, errors
- `utils/` helpers and token utilities
- `docs/` architecture and publishing docs
- `postman/` sanitized Postman collection
- `thunder-client/` sanitized Thunder Client collection

## Setup
1. Copy `.env.example` to `.env`.
2. Fill required values in `.env`.
3. Start MongoDB.
4. Install packages:
   ```bash
   npm install
   ```
5. Seed admin:
   ```bash
   npm run seed
   ```
6. Start server:
   ```bash
   npm start
   ```

## API Base URL
- `http://127.0.0.1:4000`

## Security Notes
- Do not commit `.env`.
- Keep real tokens out of exported API collections.
- Default error responses do not expose stack traces.

## Testing Collections
- Postman:
  - `postman/finance-dashboard.postman_collection.json`
  - `postman/finance-dashboard.postman_environment.json` (template values)
- Thunder Client:
  - `thunder-client/finance-dashboard.thunder_collection.json`

## Documentation
- Architecture: `docs/ARCHITECTURE.md`
- GitHub publishing checklist: `docs/PUBLISHING.md`
- Security policy: `SECURITY.md`