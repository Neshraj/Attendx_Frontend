# AttendX — Demo Script (5–7 minutes)

## 1. Opening — 30 seconds

> AttendX is a multi-tenant attendance SaaS for schools and colleges. I focused the MVP on the attendance lifecycle rather than trying to build an entire ERP.

## 2. Show the SaaS model — 45 seconds

- Open login.
- Show that one application supports Platform Admin, Institution Admin, Faculty and Student.
- Mention that every institution receives an `organizationId` tenant context.

## 3. Institution admin — 90 seconds

Login as `admin@svpcet.edu`.

Show:

- overview cards
- students
- faculty
- academic structure
- low-attendance report
- correction queue
- audit log

Say:

> The important product decision is that correction is a workflow, not an unrestricted edit.

## 4. Faculty workflow — 90 seconds

Login as `faculty@svpcet.edu`.

- open Mark attendance
- choose CSE-A and Web Technology
- show the student list
- toggle one student absent
- finalize
- explain duplicate-session protection

## 5. Student workflow — 75 seconds

Login as `student@svpcet.edu`.

- show subject-wise attendance
- open recent records
- request correction for an absent record
- explain that the student cannot directly edit the record

## 6. Admin review — 60 seconds

Return to institution admin.

- open Corrections
- approve the pending request
- open Audit log
- show the correction event

Say:

> The final state is explainable because the correction has an actor, time, old state and new state.

## 7. Engineering close — 45 seconds

Mention:

- React + Tailwind frontend
- Express + Mongoose backend
- MongoDB Atlas
- HTTP-only JWT cookie
- Zod validation
- role-based authorization
- backend tenant isolation
- unique indexes for business constraints
- audit logging

Finish with the main trade-off:

> I chose a modular monolith because it is simpler to validate for an MVP, while the domain boundaries leave room for later scaling.
