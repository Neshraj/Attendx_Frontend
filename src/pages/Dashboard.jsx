import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api, { apiError } from "../lib/api";
import Loading from "../components/Loading";
import StatCard from "../components/StatCard";

function percentageClass(value, minimum = 75) {
  return value < minimum
    ? "text-rose-600"
    : value < minimum + 5
      ? "text-amber-600"
      : "text-emerald-600";
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [low, setLow] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/dashboard/summary"),
      user?.role === "INSTITUTION_ADMIN"
        ? api.get("/reports/low-attendance")
        : Promise.resolve({ data: [] }),
    ])
      .then(([summary, lowData]) => {
        setData(summary.data);
        setLow(lowData.data);
      })
      .catch((err) => setError(apiError(err)));
  }, [user?.role]);

  if (!data && !error) return <Loading label="Preparing your workspace…" />;
  if (error) return <div className="callout-danger">{error}</div>;

  if (user.role === "PLATFORM_ADMIN") return <PlatformDashboard data={data} />;
  if (user.role === "FACULTY")
    return <FacultyDashboard data={data} navigate={navigate} />;
  if (user.role === "STUDENT")
    return <StudentDashboard data={data} navigate={navigate} />;
  return <AdminDashboard data={data} low={low} navigate={navigate} />;
}

function SectionTitle({ eyebrow, title, description, action }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

function AdminDashboard({ data, low, navigate }) {
  return (
    <div className="space-y-7">
      <div className="hero-card">
        <div>
          <span className="hero-chip">Institution workspace</span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
            Keep attendance clean before it becomes a problem.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100/75">
            Manage your people, review exceptions and keep a traceable history
            of important attendance changes.
          </p>
        </div>
        <button
          className="btn-white mt-5 sm:mt-0"
          onClick={() => navigate("/students")}
        >
          Manage students <ArrowRight size={16} />
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active students"
          value={data.students}
          note="Across this institution"
          icon={GraduationCap}
          tone="indigo"
        />
        <StatCard
          label="Faculty"
          value={data.faculty}
          note="Active staff accounts"
          icon={Users}
          tone="cyan"
        />
        <StatCard
          label="Today's sessions"
          value={data.todaySessions}
          note="Finalized class sessions"
          icon={ClipboardCheck}
          tone="emerald"
        />
        <StatCard
          label="Pending corrections"
          value={data.corrections}
          note="Need admin review"
          icon={Activity}
          tone="amber"
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section>
          <SectionTitle
            eyebrow="Attention queue"
            title="Low attendance"
            description={`Students below your institution's ${data.minimumPercentage}% minimum.`}
            action={
              <button
                onClick={() => navigate("/reports")}
                className="btn-secondary"
              >
                Open report <ArrowRight size={15} />
              </button>
            }
          />
          <div className="card overflow-hidden">
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Subject</th>
                    <th>Attendance</th>
                    <th>Required</th>
                  </tr>
                </thead>
                <tbody>
                  {low.slice(0, 8).map((row) => (
                    <tr key={`${row.studentId}-${row.subject}`}>
                      <td>
                        <div className="font-semibold">{row.name}</div>
                        <div className="text-xs text-slate-400">
                          {row.rollNumber} · {row.section}
                        </div>
                      </td>
                      <td>{row.subject}</td>
                      <td>
                        <span
                          className={`font-bold ${percentageClass(row.percentage, row.minimum)}`}
                        >
                          {row.percentage}%
                        </span>
                      </td>
                      <td>{row.minimum}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {low.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-500">
                No students are currently below the configured minimum.
              </div>
            )}
          </div>
        </section>
        <section>
          <SectionTitle eyebrow="How it works" title="A simple control loop" />
          <div className="space-y-3">
            {[
              ["1", "Record", "Faculty marks the class session once."],
              [
                "2",
                "Review",
                "Students can request corrections with a reason.",
              ],
              ["3", "Approve", "Admins approve or reject changes."],
              ["4", "Audit", "Important changes stay traceable."],
            ].map(([n, t, d]) => (
              <div key={n} className="card flex gap-4 p-4">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600">
                  {n}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{t}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-500">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function FacultyDashboard({ data, navigate }) {
  return (
    <div className="space-y-7">
      <div className="hero-card">
        <div>
          <span className="hero-chip">Faculty workspace</span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
            Record the class, not the paperwork.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100/75">
            Open a session for one assigned subject and section, mark everyone
            once, and finalize it.
          </p>
        </div>
        <button
          className="btn-white mt-5 sm:mt-0"
          onClick={() => navigate("/attendance/mark")}
        >
          Mark attendance <ArrowRight size={16} />
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Students"
          value={data.students}
          note="Active institution total"
          icon={GraduationCap}
        />
        <StatCard
          label="My subjects"
          value={data.subjects?.length || 0}
          note="Assigned to you"
          icon={BookOpen}
          tone="cyan"
        />
        <StatCard
          label="Today's sessions"
          value={data.todaySessions}
          note="Finalized sessions"
          icon={ClipboardCheck}
          tone="emerald"
        />
        <StatCard
          label="Corrections"
          value={data.corrections}
          note="Institution pending"
          icon={Activity}
          tone="amber"
        />
      </div>
      <section>
        <SectionTitle
          eyebrow="Next action"
          title="Take attendance"
          description="Choose a subject and section, then record the current class."
          action={
            <button
              onClick={() => navigate("/attendance/history")}
              className="btn-secondary"
            >
              View history <ArrowRight size={15} />
            </button>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(data.subjects || []).map((subject) => (
            <div key={subject._id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                  <BookOpen size={18} />
                </div>
                <span className="badge-indigo">{subject.code}</span>
              </div>
              <h3 className="mt-5 font-bold text-slate-900">{subject.name}</h3>
              <p className="mt-1 text-sm text-slate-500">Assigned subject</p>
              <button
                onClick={() => navigate("/attendance/mark")}
                className="btn-secondary mt-5 w-full"
              >
                Open attendance
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StudentDashboard({ data, navigate }) {
  const average = data.attendance?.length
    ? Math.round(
        data.attendance.reduce((sum, x) => sum + x.percentage, 0) /
          data.attendance.length,
      )
    : 0;
  const minimum = data.minimumPercentage || 75;
  const low = data.attendance?.filter((x) => x.percentage < minimum) || [];
  return (
    <div className="space-y-7">
      <div className="hero-card">
        <div>
          <span className="hero-chip">Student workspace</span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
            Your attendance, at a glance.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100/75">
            See subject-wise attendance and request a correction when a record
            looks wrong.
          </p>
        </div>
        <button
          className="btn-white mt-5 sm:mt-0"
          onClick={() => navigate("/my-attendance")}
        >
          View attendance <ArrowRight size={16} />
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Overall average"
          value={`${average}%`}
          note="Across available subjects"
          icon={BarChart3}
          tone={average < 75 ? "rose" : "emerald"}
        />
        <StatCard
          label="Subjects tracked"
          value={data.attendance?.length || 0}
          note="Based on finalized sessions"
          icon={BookOpen}
        />
        <StatCard
          label="Needs attention"
          value={low.length}
          note={`Below ${minimum}% minimum`}
          icon={AlertTriangle}
          tone={low.length ? "rose" : "emerald"}
        />
      </div>
      <section>
        <SectionTitle
          eyebrow="Subject health"
          title="Where you stand"
          action={
            <button
              onClick={() => navigate("/corrections")}
              className="btn-secondary"
            >
              Corrections <ArrowRight size={15} />
            </button>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data.attendance || []).map((item) => (
            <div key={item.subject} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                  <BookOpen size={18} />
                </div>
                <span
                  className={`text-2xl font-black ${percentageClass(item.percentage, minimum)}`}
                >
                  {item.percentage}%
                </span>
              </div>
              <h3 className="mt-5 font-semibold text-slate-900">
                {item.subject}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {item.present} present · {item.total} classes
              </p>
              <div className="mt-4 h-2 rounded-full bg-slate-100">
                <div
                  className={`h-2 rounded-full ${item.percentage < minimum ? "bg-rose-400" : "bg-indigo-500"}`}
                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function PlatformDashboard({ data }) {
  return (
    <div className="space-y-7">
      <div className="hero-card">
        <div>
          <span className="hero-chip">Platform console</span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
            AttendX across institutions.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100/75">
            The platform layer sees tenant-level metadata and platform activity,
            while institution users remain isolated from each other.
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Institutions"
          value={data.institutions}
          icon={Building2}
        />
        <StatCard
          label="Students"
          value={data.students}
          icon={GraduationCap}
          tone="cyan"
        />
        <StatCard
          label="Faculty"
          value={data.faculty}
          icon={Users}
          tone="emerald"
        />
        <StatCard
          label="Sessions"
          value={data.sessions}
          icon={ClipboardCheck}
          tone="amber"
        />
      </div>
      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 p-5">
          <p className="eyebrow">Platform activity</p>
          <h2 className="mt-1 text-xl font-bold">Recent audit events</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {(data.audit || []).map((log) => (
            <div
              key={log._id}
              className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {log.action}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {log.actorId?.name || "System"} · {log.entityType}
                </p>
              </div>
              <span className="text-xs text-slate-400">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
