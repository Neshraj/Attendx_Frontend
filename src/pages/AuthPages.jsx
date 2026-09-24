import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  School,
  ShieldCheck,
  Sparkles,
  Settings2,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiError } from "../lib/api";

const demos = [
  ["Institution Admin", "admin@svpcet.edu", "Admin@123"],
  ["Faculty", "faculty@svpcet.edu", "Faculty@123"],
  ["Student", "student@svpcet.edu", "Student@123"],
  ["Platform Admin", "platform@attendx.dev", "Admin@123"],
];

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-100">
        <ClipboardCheck size={21} />
      </div>
      <div>
        <div className="text-xl font-extrabold tracking-tight">
          Attend<span className="text-indigo-600">X</span>
        </div>
        <div className="text-[11px] text-slate-400">smart attendance cloud</div>
      </div>
    </div>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  function useDemo(email, password) {
    setForm({ email, password });
    setError("");
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hidden min-h-screen flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-800 p-10 text-white lg:flex xl:p-14">
        <div>
          <Brand />
        </div>
        <div className="max-w-xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-100">
            <Sparkles size={14} /> Built as a multi-tenant SaaS
          </div>
          <h1 className="text-5xl font-black leading-[1.05] tracking-tight xl:text-6xl">
            Attendance without the admin headache.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-indigo-100/75">
            A focused workspace for institutions to record attendance, control
            corrections, and spot low attendance before it becomes a problem.
          </p>
          <div className="mt-9 grid gap-3 text-sm text-white/80">
            {[
              "Separate institution data with server-side tenant isolation",
              "Role-based workflows for admins, faculty and students",
              "Audit-friendly corrections instead of silent edits",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 size={17} className="text-cyan-300" /> {item}
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs text-white/40">
          AttendX · Product Engineering Assessment Prototype
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Brand />
          </div>
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
              Welcome back
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
              Sign in to AttendX
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Use your institution account to continue.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="field-label">Email address</label>
              <div className="field-icon">
                <Mail size={17} />
                <input
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@institution.edu"
                  required
                />
              </div>
            </div>
            <div>
              <label className="field-label">Password</label>
              <div className="field-icon">
                <LockKeyhole size={17} />
                <input
                  autoComplete="current-password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((x) => !x)}
                  className="pr-3 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            {error && (
              <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}
            <button disabled={busy} className="btn-primary w-full py-3">
              {busy ? "Signing in…" : "Sign in"} <ArrowRight size={17} />
            </button>
          </form>
          <p className="mt-7 text-center text-sm text-slate-500">
            New institution?{" "}
            <Link
              className="font-semibold text-indigo-600 hover:underline"
              to="/register"
            >
              Create your workspace
            </Link>
          </p>

          <div className="my-7 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" /> Demo access{" "}
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {demos.map(([label, email, password]) => (
              <button
                key={label}
                type="button"
                onClick={() => useDemo(email, password)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-xs font-semibold text-slate-600 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <span className="block text-[10px] uppercase tracking-[0.08em] text-slate-400">
                  {label}
                </span>
                <span className="mt-0.5 block truncate">{email}</span>
              </button>
            ))}
          </div>
          <p className="mt-7 text-center text-sm text-slate-500">
            New institution?{" "}
            <Link
              className="font-semibold text-indigo-600 hover:underline"
              to="/register"
            >
              Create your workspace
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export function RegisterPage() {
  const { registerInstitution } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    institutionName: "",
    institutionType: "COLLEGE",
    adminName: "",
    adminEmail: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await registerInstitution(form);
      navigate("/");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] px-5 py-8 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 lg:gap-16">
        <div className="hidden flex-1 lg:block">
          <Brand />
          <div className="mt-14 max-w-lg">
            <div className="mb-5 inline-flex rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
              Institution onboarding
            </div>
            <h1 className="text-5xl font-black leading-tight tracking-tight text-slate-900">
              Create one workspace for your whole institution.
            </h1>
            <p className="mt-5 text-base leading-7 text-slate-500">
              Your organization becomes an isolated tenant. You can then
              configure academic structure, add faculty and students, and start
              recording attendance.
            </p>
          </div>
          <div className="mt-8 grid gap-3 text-sm text-slate-600">
            {[
              ["School or college", School],
              ["Role-based access", ShieldCheck],
              ["Configurable attendance policy", Settings2],
            ].map(([text, Icon]) => (
              <div key={text} className="flex items-center gap-3">
                <div className="rounded-lg bg-white p-2 shadow-sm ring-1 ring-slate-200">
                  <Icon size={16} className="text-indigo-600" />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>
        <div className="w-full max-w-xl">
          <div className="mb-7 lg:hidden">
            <Brand />
          </div>
          <div className="card p-6 sm:p-8">
            <div className="mb-7">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
                Get started
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight">
                Create your institution
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                The person creating the workspace becomes its institution admin.
              </p>
            </div>
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="field-label">Institution name</label>
                <input
                  className="input"
                  value={form.institutionName}
                  onChange={(e) =>
                    setForm({ ...form, institutionName: e.target.value })
                  }
                  placeholder="ABC Engineering College"
                  required
                />
              </div>
              <div>
                <label className="field-label">Institution type</label>
                <select
                  className="input"
                  value={form.institutionType}
                  onChange={(e) =>
                    setForm({ ...form, institutionType: e.target.value })
                  }
                >
                  <option value="COLLEGE">College</option>
                  <option value="SCHOOL">School</option>
                </select>
              </div>
              <div>
                <label className="field-label">Admin name</label>
                <input
                  className="input"
                  value={form.adminName}
                  onChange={(e) =>
                    setForm({ ...form, adminName: e.target.value })
                  }
                  placeholder="S Neshraj"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="field-label">Admin email</label>
                <input
                  className="input"
                  type="email"
                  value={form.adminEmail}
                  onChange={(e) =>
                    setForm({ ...form, adminEmail: e.target.value })
                  }
                  placeholder="admin@institution.edu"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="field-label">Password</label>
                <input
                  className="input"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                />
              </div>
              {error && (
                <div className="sm:col-span-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}
              <button
                disabled={busy}
                className="btn-primary sm:col-span-2 py-3"
              >
                {busy ? "Creating workspace…" : "Create institution"}{" "}
                <ArrowRight size={17} />
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                className="font-semibold text-indigo-600 hover:underline"
                to="/login"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
