# AttendX — Edge Cases & Failure Scenarios

| Scenario | Expected handling |
|---|---|
| Faculty attempts to mark another institution's subject | Server returns 403 because the subject is not assigned within the authenticated tenant |
| Browser sends a different `organizationId` | Server ignores the supplied tenant and uses the authenticated user's organization |
| Same faculty submits attendance twice | Unique session index returns a conflict; second session is not created |
| Same student appears twice in one attendance payload | Record uniqueness plus validation prevents duplicate attendance record creation |
| Student from another section is included | Backend checks student membership in the selected section |
| Student tries to change attendance directly | No student attendance mutation endpoint exists; only correction requests are allowed |
| Student requests a correction twice | Pending request for the same record is rejected |
| Student requests the same current status | Request is rejected because it would not change anything |
| Admin reviews an already reviewed correction | Server rejects the action because only `PENDING` requests can be reviewed |
| Approved correction | Attendance record changes and an audit event captures old/new state |
| Rejected correction | Attendance remains unchanged and rejection is audited |
| User account is deactivated | Authentication middleware rejects the account on the next request |
| Invalid login bursts | Authentication endpoints are rate limited |
| Malformed JSON/payload | Request schema validation returns a controlled 400 response |
| Database duplicate | Mongoose duplicate-key error maps to a 409 response |
| Empty section | UI explains that students must be added before recording attendance |
| Low attendance threshold changes | Report uses the institution's stored policy, not a hardcoded value |
