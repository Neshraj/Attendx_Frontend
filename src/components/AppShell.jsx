import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity, AlertTriangle, BarChart3, BookOpen, Building2, ClipboardCheck,
  FileClock, LayoutDashboard, LogOut, Menu, School, Settings2, ShieldCheck,
  UserRound, Users, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api, { apiError } from '../lib/api';
import Toast from './Toast';

const navByRole = {
  PLATFORM_ADMIN: [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/institutions', label: 'Institutions', icon: Building2 },
    { to: '/audit', label: 'Audit log', icon: FileClock }
  ],
  INSTITUTION_ADMIN: [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/students', label: 'Students', icon: Users },
    { to: '/faculty', label: 'Faculty', icon: UserRound },
    { to: '/academics', label: 'Academics', icon: BookOpen },
    { to: '/corrections', label: 'Corrections', icon: Activity },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
    { to: '/audit', label: 'Audit log', icon: FileClock }
  ],
  FACULTY: [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/attendance/mark', label: 'Mark attendance', icon: ClipboardCheck },
    { to: '/attendance/history', label: 'Attendance history', icon: FileClock },
    { to: '/corrections', label: 'Corrections', icon: Activity }
  ],
  STUDENT: [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/my-attendance', label: 'My attendance', icon: ClipboardCheck },
    { to: '/corrections', label: 'Correction requests', icon: Activity }
  ]
};

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
}

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [institution, setInstitution] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!user?.organizationId) return;
    api.get('/institution/profile').then(({ data }) => setInstitution(data)).catch(() => {});
  }, [user?.organizationId]);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const items = useMemo(() => navByRole[user?.role] || [], [user?.role]);
  const current = items.find(item => item.to === location.pathname) || items[0];

  async function handleLogout() {
    try { await logout(); navigate('/login'); } catch (error) { setToast({ type: 'error', message: apiError(error) }); }
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      {mobileOpen && <div className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">
          <button onClick={() => navigate('/')} className="flex items-center gap-3 text-left">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200"><ClipboardCheck size={20} /></div>
            <div><div className="text-[17px] font-extrabold tracking-tight">Attend<span className="text-indigo-600">X</span></div><div className="text-[11px] text-slate-400">attendance cloud</div></div>
          </button>
          <button className="lg:hidden" onClick={() => setMobileOpen(false)}><X size={19} /></button>
        </div>

        <div className="mx-4 mt-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10"><School size={17} /></div>
            <div className="min-w-0"><p className="truncate text-sm font-semibold">{institution?.name || (user?.role === 'PLATFORM_ADMIN' ? 'Platform Console' : 'Your institution')}</p><p className="mt-0.5 text-[11px] text-white/60">{institution?.type || (user?.role === 'PLATFORM_ADMIN' ? 'SaaS administration' : 'Workspace')}</p></div>
          </div>
        </div>

        <nav className="mt-5 flex-1 space-y-1 px-3">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">Workspace</p>
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
              <Icon size={17} strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{initials(user?.name)}</div>
            <div className="min-w-0"><p className="truncate text-sm font-semibold">{user?.name}</p><p className="truncate text-[11px] text-slate-400">{user?.role?.replaceAll('_', ' ')}</p></div>
          </div>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600"><LogOut size={17} /> Sign out</button>
        </div>
      </aside>

      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur md:px-7">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => setMobileOpen(true)}><Menu size={21} /></button>
            <div><p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">{user?.role === 'PLATFORM_ADMIN' ? 'Platform' : institution?.name || 'Institution'}</p><h1 className="mt-0.5 text-lg font-bold tracking-tight text-slate-900">{current?.label || 'Overview'}</h1></div>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">{user?.role?.replaceAll('_', ' ')}</span>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">{initials(user?.name)}</div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1440px] p-4 md:p-7">{children}</main>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
