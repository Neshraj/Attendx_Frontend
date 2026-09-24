import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  FileClock,
  Filter,
  History,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import api, { apiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import Toast from "../components/Toast";

export function CorrectionsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [toast, setToast] = useState(null);

  async function load() {
    const { data } = await api.get("/attendance/corrections");
    setItems(data);
  }
  useEffect(() => {
    load().catch((err) => setToast({ type: "error", message: apiError(err) }));
  }, []);

  async function review(id, status) {
    try {
      await api.patch(`/attendance/corrections/${id}`, {
        status,
        reviewNote: "",
      });
      setToast({ message: `Correction ${status.toLowerCase()}.` });
      load();
    } catch (err) {
      setToast({ type: "error", message: apiError(err) });
    }
  }

  if (!items) return <Loading label="Loading correction requests…" />;
  const filtered =
    filter === "ALL" ? items : items.filter((x) => x.status === filter);

  return (
    <div className="space-y-6">
      {" "}
      <Toast toast={toast} onClose={() => setToast(null)} />
      <div className="page-heading">
        <div>
          <p className="eyebrow">Exception workflow</p>
          <h2>Correction requests</h2>
          <p>
            Changes are reviewed instead of silently overwriting historical
            attendance.
          </p>
        </div>
        <div className="flex gap-2">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`filter-chip ${filter === value ? "filter-chip-active" : ""}`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {filtered.map((item) => {
          const student = item.studentId?.userId;
          const session = item.attendanceRecordId?.sessionId;
          const canReview = item.status === "PENDING";
          return (
            <div key={item._id} className="card p-5">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-900">
                      {student?.name || "Student"}
                    </h3>
                    <span className="text-xs text-slate-400">
                      {item.studentId?.rollNumber}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {session?.subjectId?.name || "Subject"} · Requested{" "}
                    {item.requestedStatus}
                  </p>
                  <p className="mt-3 max-w-3xl rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                    {item.reason}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 size={13} />{" "}
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                    <span>
                      Current status:{" "}
                      <strong>{item.attendanceRecordId?.status}</strong>
                    </span>
                  </div>
                </div>
                {user?.role === "INSTITUTION_ADMIN" && canReview ? (
                  <div className="flex shrink-0 gap-2">
                    <button
                      className="btn-secondary text-emerald-700 hover:bg-emerald-50"
                      onClick={() => review(item._id, "APPROVED")}
                    >
                      <Check size={16} /> Approve
                    </button>
                    <button
                      className="btn-secondary text-rose-600 hover:bg-rose-50"
                      onClick={() => review(item._id, "REJECTED")}
                    >
                      <X size={16} /> Reject
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <EmptyState
          title="No correction requests"
          description="There are no requests matching this filter."
        />
      )}
      <div className="callout">
        <ShieldCheck size={18} />
        <div>
          <p className="font-semibold">Audit-friendly workflow</p>
          <p className="mt-1">
            An approved request changes the attendance record and writes an
            audit event containing the old and new state.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    PENDING: "badge-amber",
    APPROVED: "badge-green",
    REJECTED: "badge-red",
  };
  return <span className={styles[status] || "badge-indigo"}>{status}</span>;
}

export function ReportsPage() {
  const [rows, setRows] = useState(null);
  const [query, setQuery] = useState("");
  useEffect(() => {
    api.get("/reports/low-attendance").then(({ data }) => setRows(data));
  }, []);
  if (!rows) return <Loading label="Calculating low attendance…" />;
  const filtered = rows.filter((row) =>
    `${row.name} ${row.rollNumber} ${row.subject}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <div className="space-y-6">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Insight</p>
          <h2>Low attendance report</h2>
          <p>
            Students who are below the institution's configured minimum in a
            subject.
          </p>
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="field-icon max-w-md w-full">
            <Search size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search student or subject"
            />
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {filtered.length} exceptions
          </span>
        </div>
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Subject</th>
                <th>Attendance</th>
                <th>Present / total</th>
                <th>Minimum</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={`${row.studentId}-${row.subject}`}>
                  <td>
                    <div className="font-semibold">{row.name}</div>
                    <div className="text-xs text-slate-400">
                      {row.rollNumber} · {row.section}
                    </div>
                  </td>
                  <td>{row.subject}</td>
                  <td>
                    <span className="font-bold text-rose-600">
                      {row.percentage}%
                    </span>
                  </td>
                  <td>
                    {row.present} / {row.total}
                  </td>
                  <td>{row.minimum}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-slate-500">
            No exceptions found.
          </div>
        )}
      </div>
    </div>
  );
}

export function AuditPage() {
  const [logs, setLogs] = useState(null);
  useEffect(() => {
    api.get("/reports/audit").then(({ data }) => setLogs(data));
  }, []);
  if (!logs) return <Loading label="Loading audit history…" />;
  return (
    <div className="space-y-6">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Traceability</p>
          <h2>Audit log</h2>
          <p>
            Important actions are captured so changes can be explained later.
          </p>
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="divide-y divide-slate-100">
          {logs.map((log) => (
            <div key={log._id} className="flex gap-4 p-5">
              <div className="mt-0.5 rounded-xl bg-slate-100 p-2.5 text-slate-600">
                <FileClock size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-semibold text-slate-800">{log.action}</p>
                  <span className="text-xs text-slate-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {log.actorId?.name || "Platform"} · {log.entityType}
                  {log.entityId ? ` · ${log.entityId}` : ""}
                </p>
                {Object.keys(log.details || {}).length > 0 && (
                  <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>
        {logs.length === 0 && (
          <EmptyState
            title="No audit events"
            description="Events will appear here as important actions happen."
          />
        )}
      </div>
    </div>
  );
}

export function MarkAttendancePage() {
  const [catalog, setCatalog] = useState(null);
  const [form, setForm] = useState({
    sectionId: "",
    subjectId: "",
    date: new Date().toISOString().slice(0, 10),
    startTime: "10:00",
    topic: "",
  });
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    api.get("/institution/catalog").then(({ data }) => {
      setCatalog(data);
      const firstSection = data.sections[0]?._id || "";
      const firstSubject =
        data.subjects.find((s) => s.sectionId?._id === firstSection)?._id ||
        data.subjects[0]?._id ||
        "";
      setForm((x) => ({
        ...x,
        sectionId: firstSection,
        subjectId: firstSubject,
      }));
    });
  }, []);
  useEffect(() => {
  if (!form.sectionId || !form.subjectId) {
    setStudents([]);
    return;
  }

  api
    .get('/institution/students', {
      params: {
        sectionId: form.sectionId,
        subjectId: form.subjectId,
      },
    })
    .then(({ data }) => {
      setStudents(data);
    })
    .catch((err) => {
      setStudents([]);
      setToast({
        type: 'error',
        message: apiError(err),
      });
    });
}, [form.sectionId, form.subjectId]);
  useEffect(() => {
    setRecords(Object.fromEntries(students.map((s) => [s._id, "PRESENT"])));
  }, [students]);

  if (!catalog) return <Loading label="Preparing attendance session…" />;
  const subjects = catalog.subjects.filter(
    (subject) => subject.sectionId?._id === form.sectionId,
  );
  const selectedSubject = subjects.find((s) => s._id === form.subjectId);

  function toggleStudent(id) {
    setRecords((prev) => ({
      ...prev,
      [id]: prev[id] === "PRESENT" ? "ABSENT" : "PRESENT",
    }));
  }

  async function submit() {
    if (!selectedSubject || students.length === 0)
      return setToast({
        type: "error",
        message: "Choose a valid section with students and subject.",
      });
    setBusy(true);
    try {
      await api.post("/attendance/sessions", {
        ...form,
        records: students.map((s) => ({
          studentId: s._id,
          status: records[s._id] || "PRESENT",
        })),
      });
      setToast({ message: "Attendance finalized successfully." });
    } catch (err) {
      setToast({ type: "error", message: apiError(err) });
    } finally {
      setBusy(false);
    }
  }

  const presentCount = Object.values(records).filter(
    (x) => x === "PRESENT",
  ).length;
  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <div className="page-heading">
        <div>
          <p className="eyebrow">Faculty action</p>
          <h2>Mark attendance</h2>
          <p>
            Each unique subject + section + date + time can be finalized only
            once.
          </p>
        </div>
      </div>
      <div className="card p-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="field-label">Section</label>
            <select
              className="input"
              value={form.sectionId}
              onChange={(e) =>
                setForm({
                  ...form,
                  sectionId: e.target.value,
                  subjectId:
                    catalog.subjects.find(
                      (s) => s.sectionId?._id === e.target.value,
                    )?._id || "",
                })
              }
            >
              {catalog.sections.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} · Sem {s.semester}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Subject</label>
            <select
              className="input"
              value={form.subjectId}
              onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
            >
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} · {s.code}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Date</label>
            <input
              className="input"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Start time</label>
            <input
              className="input"
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2 xl:col-span-4">
            <label className="field-label">
              Class topic{" "}
              <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              className="input"
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              placeholder="Example: React hooks and state"
            />
          </div>
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold">{selectedSubject?.name || "Subject"}</p>
            <p className="text-xs text-slate-400">
              {students.length} students · {presentCount} present ·{" "}
              {students.length - presentCount} absent
            </p>
          </div>
          <button
            onClick={() =>
              setRecords(
                Object.fromEntries(students.map((s) => [s._id, "PRESENT"])),
              )
            }
            className="btn-secondary text-xs"
          >
            Mark all present
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {students.map((s) => (
            <button
              key={s._id}
              type="button"
              onClick={() => toggleStudent(s._id)}
              className="flex w-full items-center justify-between p-4 text-left transition hover:bg-slate-50"
            >
              <div>
                <p className="font-semibold text-slate-800">{s.userId?.name}</p>
                <p className="mt-0.5 text-xs text-slate-400">{s.rollNumber}</p>
              </div>
              <span
                className={
                  records[s._id] === "PRESENT"
                    ? "status-present"
                    : "status-absent"
                }
              >
                {records[s._id]}
              </span>
            </button>
          ))}
        </div>
        {students.length === 0 && (
          <EmptyState
            title="No students in this section"
            description="Add students to the selected section before recording attendance."
          />
        )}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">
            After finalization, changes should go through the correction
            workflow.
          </p>
          <button
            disabled={busy || students.length === 0}
            onClick={submit}
            className="btn-primary"
          >
            {busy ? "Saving…" : "Finalize attendance"}{" "}
            <CheckCircle2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function AttendanceHistoryPage() {
  const [sessions, setSessions] = useState(null);
  useEffect(() => {
    api.get("/attendance/sessions").then(({ data }) => setSessions(data));
  }, []);
  if (!sessions) return <Loading label="Loading attendance history…" />;
  return (
    <div className="space-y-6">
      <div className="page-heading">
        <div>
          <p className="eyebrow">History</p>
          <h2>Attendance sessions</h2>
          <p>Finalized class sessions from your assigned subjects.</p>
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Date / time</th>
                <th>Subject</th>
                <th>Section</th>
                <th>Marked by</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s._id}>
                  <td>
                    <div className="font-semibold">
                      {new Date(s.date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-slate-400">{s.startTime}</div>
                  </td>
                  <td>
                    <div className="font-semibold">{s.subjectId?.name}</div>
                    <div className="text-xs text-slate-400">
                      {s.subjectId?.code}
                    </div>
                  </td>
                  <td>{s.sectionId?.name}</td>
                  <td>{s.markedBy?.name}</td>
                  <td>
                    <span className="badge-green">{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sessions.length === 0 && (
          <EmptyState
            title="No sessions yet"
            description="Finalized attendance sessions will appear here."
          />
        )}
      </div>
    </div>
  );
}

export function MyAttendancePage() {
  const [records, setRecords] = useState([]);
  const [selected, setSelected] = useState(null);
  const [requestedStatus, setRequestedStatus] = useState("PRESENT");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await api.get("/attendance/student/records");
    setRecords(data);
  }
  useEffect(() => {
  load()
    .catch((err) => {
      setToast({ type: "error", message: apiError(err) });
    })
    .finally(() => {
      setLoading(false);
    });
}, []);
  

  const grouped = useMemo(() => {
  const map = new Map();

  for (const record of records) {
    const subject = record.sessionId?.subjectId?.name || "Unknown";

    if (!map.has(subject)) {
      map.set(subject, { present: 0, total: 0 });
    }

    const item = map.get(subject);

    item.total += 1;

    if (record.status === "PRESENT") {
      item.present += 1;
    }
  }

  return [...map.entries()].map(([subject, x]) => ({
    subject,
    percentage: x.total
      ? Math.round((x.present / x.total) * 100)
      : 0,
    ...x,
  }));
}, [records]);

  if (loading) {
  return <Loading label="Loading your attendance…" />;
}

  async function submitCorrection(e) {
    e.preventDefault();
    if (!selected) return;
    setBusy(true);
    try {
      await api.post("/attendance/student/corrections", {
        attendanceRecordId: selected._id,
        requestedStatus,
        reason,
      });
      setToast({ message: "Correction request submitted." });
      setSelected(null);
      setReason("");
      await load();
    } catch (err) {
      setToast({ type: "error", message: apiError(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <div className="page-heading">
        <div>
          <p className="eyebrow">Student workspace</p>
          <h2>My attendance</h2>
          <p>
            Review subject percentages and raise a correction with a reason when
            needed.
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {grouped.map((item) => (
          <div className="card p-5" key={item.subject}>
            <div className="flex items-start justify-between">
              <p className="font-semibold text-slate-800">{item.subject}</p>
              <p
                className={`text-2xl font-black ${item.percentage < 75 ? "text-rose-600" : "text-emerald-600"}`}
              >
                {item.percentage}%
              </p>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {item.present} present out of {item.total}
            </p>
            <div className="mt-4 h-2 rounded-full bg-slate-100">
              <div
                className={`h-2 rounded-full ${item.percentage < 75 ? "bg-rose-400" : "bg-indigo-500"}`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 p-5">
          <h3 className="font-bold">Recent records</h3>
          <p className="mt-1 text-xs text-slate-400">
            A correction does not directly edit the record; it creates a review
            request.
          </p>
        </div>
        <div className="divide-y divide-slate-100">
          {records.slice(0, 20).map((record) => (
            <div
              key={record._id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-slate-800">
                  {record.sessionId?.subjectId?.name}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {record.sessionId?.subjectId?.code} ·{" "}
                  {new Date(record.sessionId?.date).toLocaleDateString()} ·{" "}
                  {record.sessionId?.startTime}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={
                    record.status === "PRESENT"
                      ? "status-present"
                      : "status-absent"
                  }
                >
                  {record.status}
                </span>
                {
                  <button
                    onClick={() => {
                      setSelected(record);
                      setRequestedStatus("PRESENT");
                    }}
                    className="btn-secondary text-xs"
                  >
                    Request correction
                  </button>
                }
              </div>
            </div>
          ))}
        </div>
      </div>
      {selected && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/35 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h3 className="font-bold">Request correction</h3>
                <p className="mt-1 text-xs text-slate-400">
                  {selected.sessionId?.subjectId?.name} ·{" "}
                  {new Date(selected.sessionId?.date).toLocaleDateString()}
                </p>
              </div>
              <button onClick={() => setSelected(null)}>
                <X size={17} />
              </button>
            </div>
            <form onSubmit={submitCorrection} className="space-y-4 p-5">
              <div>
                <label className="field-label">Requested status</label>
                <select
                  className="input"
                  value={requestedStatus}
                  onChange={(e) => setRequestedStatus(e.target.value)}
                >
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                </select>
              </div>
              <div>
                <label className="field-label">Reason</label>
                <textarea
                  className="input min-h-28 resize-y"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why this record should be reviewed."
                  required
                  minLength={5}
                />
              </div>
              <div className="rounded-xl bg-indigo-50 p-3 text-xs leading-5 text-indigo-700">
                Your request is sent to an institution administrator. Approval
                updates the record and creates an audit event.
              </div>
              <button disabled={busy} className="btn-primary w-full">
                {busy ? "Submitting…" : "Submit request"}{" "}
                <ArrowRight size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function InstitutionsPage() {
  const [institutions, setInstitutions] = useState(null);
  useEffect(() => {
    api.get("/platform/institutions").then(({ data }) => setInstitutions(data));
  }, []);
  if (!institutions) return <Loading label="Loading institutions…" />;
  return (
    <div className="space-y-6">
      <div className="page-heading">
        <div>
          <p className="eyebrow">SaaS control plane</p>
          <h2>Institutions</h2>
          <p>Tenants registered with AttendX.</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {institutions.map((org) => (
          <div className="card p-5" key={org._id}>
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                <BuildingIcon />
              </div>
              <span
                className={
                  org.status === "ACTIVE" ? "badge-green" : "badge-red"
                }
              >
                {org.status}
              </span>
            </div>
            <h3 className="mt-5 font-bold">{org.name}</h3>
            <p className="mt-1 text-xs uppercase tracking-[0.08em] text-slate-400">
              {org.type}
            </p>
            <div className="mt-5 rounded-xl bg-slate-50 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Minimum attendance</span>
                <strong>{org.attendancePolicy?.minimumPercentage}%</strong>
              </div>
              <div className="mt-2 flex justify-between">
                <span className="text-slate-500">Created</span>
                <span>{new Date(org.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function BuildingIcon() {
  return <ShieldCheck size={18} />;
}
