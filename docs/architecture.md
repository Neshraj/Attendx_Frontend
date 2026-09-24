# AttendX Architecture

```text
                         ┌──────────────────────┐
                         │      React / Vite     │
                         │       Tailwind        │
                         └──────────┬───────────┘
                                    │ HTTPS + JSON
                                    ▼
                         ┌──────────────────────┐
                         │     Express API      │
                         │                      │
                         │ Auth / RBAC          │
                         │ Tenant isolation     │
                         │ Validation           │
                         │ Attendance workflow  │
                         │ Corrections          │
                         │ Reports              │
                         │ Audit                │
                         └──────────┬───────────┘
                                    │ Mongoose
                                    ▼
                         ┌──────────────────────┐
                         │    MongoDB Atlas     │
                         │   Free cluster / M0  │
                         └──────────────────────┘
```

## Request lifecycle

```text
Browser
  ↓
HTTP-only JWT cookie
  ↓
requireAuth
  ↓
Identify user + organization
  ↓
requireRole
  ↓
Zod request validation
  ↓
Tenant-scoped MongoDB query
  ↓
Business rule
  ↓
Audit event when appropriate
  ↓
JSON response
```

## Why this is a good MVP architecture

It keeps the whole product easy to run locally and explain, while still separating authentication, authorization, tenant isolation, validation, persistence and business workflows into distinct modules.
