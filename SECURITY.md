# Security Policy

## Supported Version
This repository is maintained as a single active codebase.

## Reporting a Vulnerability
If you find a security issue, do not open a public issue with exploit details.
Instead, share a private report with clear reproduction steps and impact.

## Security Practices in This Project
- Secrets are loaded from environment variables, not source code.
- JWT auth uses signed bearer tokens with role checks.
- Validation is applied on write endpoints.
- Error responses avoid exposing internal stack traces by default.
- Basic request rate limiting is enabled for auth routes.