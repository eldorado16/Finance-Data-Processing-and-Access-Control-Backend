# System Architecture

## Stack
- Runtime: Node.js
- Framework: Express
- Database: MongoDB with Mongoose
- Auth: JWT (Bearer)
- Password Hashing: bcryptjs
- Validation: Zod

## Folder Structure
- `config/`: database connection and runtime configuration
- `models/`: Mongoose schemas (`User`, `Transaction`)
- `controllers/`: business logic per domain
- `routes/`: endpoint registration and middleware composition
- `middleware/`: auth, RBAC, validation, security headers, global errors, rate limit
- `utils/`: reusable helpers and shared token logic

## Request Flow
1. Request enters Express app (`server.js`).
2. Security middleware applies headers and body limits.
3. Route-level middleware runs:
   - validation
   - authentication (`authMiddleware`)
   - authorization (`roleMiddleware`)
4. Controller executes business logic.
5. Global error handler returns standardized JSON error responses.

## Security Controls
- JWT verification is restricted to `HS256`, with optional issuer/audience checks.
- Passwords are hashed with bounded bcrypt cost factor.
- Auth routes are rate limited to reduce brute-force attempts.
- Stack traces are hidden from API responses by default.
- Last active admin protection prevents lockout.
- `.env` and local runtime files are excluded via `.gitignore`.

## API Domains
- Auth: `/api/auth/*`
- Users (Admin): `/api/users/*`
- Records: `/api/records/*`
- Analytics (Admin/Analyst): `/api/analytics/*`