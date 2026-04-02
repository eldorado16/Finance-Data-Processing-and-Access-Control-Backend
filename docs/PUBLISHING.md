# GitHub Publishing Checklist

## Safe To Publish
- Source code folders (`config`, `models`, `controllers`, `routes`, `middleware`, `utils`)
- `server.js`, `seed.js`
- `README.md`
- `docs/ARCHITECTURE.md`
- `package.json`, `package-lock.json`
- `.env.example`
- Sanitized API collections (`postman/`, `thunder-client/`)

## Do Not Publish
- `.env` (real secrets)
- `node_modules/`
- `.server.pid`, logs, temporary files
- Any API export containing real bearer tokens or personal data

## Before Push
1. Confirm no secrets:
   - JWT secrets
   - database connection strings with credentials
   - live tokens in API collections
2. Verify `.gitignore` is active.
3. Re-run seed/start smoke test locally.
4. Ensure README setup steps are accurate.

## First Push Commands
```bash
git init
git add .
git commit -m "Initial backend submission"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

## Optional Professional Additions
- Add GitHub repository topics (`nodejs`, `express`, `mongodb`, `jwt`, `rbac`).
- Add branch protection and required PR review if this is a team repo.