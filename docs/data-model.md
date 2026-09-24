# AttendX Data Model

```mermaid
erDiagram
    ORGANIZATION ||--o{ USER : owns
    ORGANIZATION ||--o{ DEPARTMENT : contains
    DEPARTMENT ||--o{ SECTION : has
    SECTION ||--o{ STUDENT : contains
    SECTION ||--o{ SUBJECT : offers
    USER ||--o| STUDENT : may_have
    USER ||--o{ SUBJECT : teaches
    SECTION ||--o{ ATTENDANCE_SESSION : schedules
    SUBJECT ||--o{ ATTENDANCE_SESSION : uses
    ATTENDANCE_SESSION ||--o{ ATTENDANCE_RECORD : contains
    STUDENT ||--o{ ATTENDANCE_RECORD : receives
    ATTENDANCE_RECORD ||--o{ CORRECTION_REQUEST : may_create
    USER ||--o{ AUDIT_LOG : performs
    ORGANIZATION ||--o{ AUDIT_LOG : scopes
```

## Important indexes

- `Organization.slug` — unique
- `User.email` — unique
- `Department(organizationId, code)` — unique
- `Section(organizationId, departmentId, name, academicYear)` — unique
- `Subject(organizationId, code, sectionId)` — unique
- `Student(organizationId, rollNumber)` — unique
- `AttendanceSession(organizationId, sectionId, subjectId, date, startTime)` — unique
- `AttendanceRecord(sessionId, studentId)` — unique

## Tenant ownership

`organizationId` is present on all operational collections. `AuditLog.organizationId` can be null only for platform-level events.
