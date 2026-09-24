# AttendX — Approach Note

## 1. Problem understanding

The attendance problem is broader than recording Present/Absent. In a real institution, the system must also answer:

- Who is allowed to record attendance?
- Which class/session is being recorded?
- How do we prevent duplicate submissions?
- What happens when a record is wrong?
- Who can approve a correction?
- How can a student or administrator understand attendance history?
- How do we identify low attendance without requiring manual spreadsheet work?
- How do we preserve an explainable history of changes?

## 2. Product decision: SaaS instead of one college

AttendX is designed as a multi-tenant SaaS product. A school or college creates an institution workspace. That workspace becomes a tenant with its own students, faculty, academic structure, attendance sessions, correction requests, policies and audit history.

This interpretation makes the product reusable while still satisfying the assessment's single-institution business scenario.

### Tenant isolation rule

Every tenant-owned document contains `organizationId`.

The server obtains the user's organization from the authenticated HTTP-only JWT and adds that organization to database filters. The browser never gets to choose which organization's records it can read by simply changing an ID in a request.

## 3. Roles

### Platform Admin

Owns the SaaS control plane. Can see registered institutions, platform-level usage counters and platform audit activity.

### Institution Admin

Owns one institution workspace. Can manage active student/faculty accounts, review corrections, view low-attendance reports and inspect the audit trail.

### Faculty

Can access assigned subjects, select a class session, mark attendance and view their attendance sessions. Faculty cannot arbitrarily edit finalized records.

### Student

Can see their own attendance and create a correction request for a specific record with a reason.

## 4. Core workflows

### Institution onboarding

```text
Create institution
→ create organization tenant
→ create institution-admin user
→ set default attendance policy
→ admin signs in
→ configure academic structure
```

### Attendance

```text
Faculty login
→ choose section + subject + date + time
→ backend verifies faculty assignment and student membership
→ duplicate-session check
→ create AttendanceSession
→ create AttendanceRecord documents
→ write audit event
```

### Correction

```text
Student selects incorrect record
→ chooses requested status
→ submits reason
→ pending correction created
→ institution admin reviews
→ approve/reject
→ if approved, attendance changes
→ audit event records the before/after state
```

## 5. Data model decision

Attendance is split into two collections:

- `AttendanceSession`: the class event itself.
- `AttendanceRecord`: the per-student state for that event.

This keeps the session reusable and lets individual student records be queried independently. A unique index prevents two records for the same student in one session. Another unique index prevents a duplicate session for the same organization, section, subject, date and time.

## 6. Attendance percentage

Percentage is calculated from finalized attendance records:

```text
attendance % = present records / total finalized records × 100
```

The minimum percentage is stored as an institution-level policy rather than hardcoded because different organizations may use different rules.

## 7. Security and engineering choices

- Passwords are hashed with bcryptjs.
- Authentication uses an HTTP-only cookie instead of exposing the JWT to normal frontend JavaScript.
- Helmet adds common security headers.
- CORS uses an allow-list.
- Authentication routes have rate limiting.
- Request payloads are validated with Zod.
- Protected routes enforce role checks server-side.
- Tenant ownership is enforced in database filters.
- MongoDB unique indexes handle important duplicate constraints.
- Important state transitions write audit records.

## 8. Trade-offs

### Why MongoDB?

The domain contains several related but independently evolving entities, and MongoDB makes tenant-scoped documents straightforward. It is also directly compatible with the requested MongoDB Atlas setup.

### Why not microservices?

The assessment does not require distributed scaling. A modular Express service is easier to build, test, explain and deploy for an MVP. The boundaries are kept clean enough to split later if product scale requires it.

### Why no billing in the MVP?

The assignment is about attendance management. Subscription billing adds an unrelated financial domain and would take time away from correctness of the attendance workflow.

### Why no biometric/face recognition?

Those are potential capture mechanisms, not necessary to prove the product's attendance workflow. A future integration can create an attendance session or submit trusted attendance events through a controlled API.

## 9. Validation approach

The implementation is designed to validate:

- invalid credentials
- inactive accounts
- wrong roles
- cross-tenant access attempts
- duplicate emails
- duplicate roll numbers
- invalid academic ownership
- faculty marking a subject they are not assigned to
- students outside a selected section
- duplicate attendance sessions
- duplicate correction requests
- corrections with no actual status change
- approving an already reviewed correction

## 10. What is intentionally outside the MVP

- payment/subscription management
- biometric/RFID hardware integration
- parent portal
- mobile app
- WhatsApp notifications
- complete ERP modules such as fees, exams, HR and admissions
- predictive ML models

These can be future product roadmap items once the core attendance workflow is stable.
