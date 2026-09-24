import { useEffect, useState } from 'react';
import { UserPlus, Users, Search, Mail, BadgeCheck, GraduationCap, BookOpen, Plus, X, ShieldCheck, Building2 } from 'lucide-react';
import api, { apiError } from '../lib/api';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';

function Modal({ title, onClose, children }) {
  return <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/35 p-4 backdrop-blur-[2px]"><div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-900">{title}</h2><button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={17} /></button></div><div className="p-5">{children}</div></div></div>;
}

function useToast() {
  const [toast, setToast] = useState(null);
  return { toast, setToast, node: <Toast toast={toast} onClose={() => setToast(null)} /> };
}

export function StudentsPage() {
  const [students, setStudents] = useState(null);
  const [catalog, setCatalog] = useState(null);
  const [query, setQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: 'Student@123', rollNumber: '', sectionId: '', admissionYear: 2026 });
  const { toast, setToast, node } = useToast();

  async function load() { const [s, c] = await Promise.all([api.get('/institution/students'), api.get('/institution/catalog')]); setStudents(s.data); setCatalog(c.data); if (!form.sectionId && c.data.sections[0]) setForm(x => ({ ...x, sectionId: c.data.sections[0]._id })); }
  useEffect(() => { load().catch(err => setToast({ type: 'error', message: apiError(err) })); }, []);

  async function submit(event) {
    event.preventDefault();
    try { await api.post('/institution/students', form); setShowAdd(false); setForm({ name: '', email: '', password: 'Student@123', rollNumber: '', sectionId: catalog.sections[0]?._id || '', admissionYear: 2026 }); setToast({ message: 'Student account created.' }); await load(); } catch (err) { setToast({ type: 'error', message: apiError(err) }); }
  }

  if (!students || !catalog) return <Loading label="Loading students…" />;
  const filtered = students.filter(s => `${s.userId?.name} ${s.rollNumber} ${s.userId?.email}`.toLowerCase().includes(query.toLowerCase()));

  return <div className="space-y-6">
    {node}
    <div className="page-heading"><div><p className="eyebrow">People</p><h2>Students</h2><p>Manage active student accounts within your institution.</p></div><button className="btn-primary" onClick={() => setShowAdd(true)}><UserPlus size={16} /> Add student</button></div>
    <div className="card overflow-hidden"><div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="field-icon max-w-md w-full"><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name, roll number or email" /></div><span className="text-xs font-semibold text-slate-400">{filtered.length} students</span></div><div className="table-scroll"><table className="table"><thead><tr><th>Student</th><th>Roll number</th><th>Section</th><th>Department</th><th>Status</th></tr></thead><tbody>{filtered.map(student => <tr key={student._id}><td><div className="font-semibold text-slate-800">{student.userId?.name}</div><div className="text-xs text-slate-400">{student.userId?.email}</div></td><td className="font-medium">{student.rollNumber}</td><td>{student.sectionId?.name}</td><td>{student.sectionId?.departmentId?.code || '—'}</td><td><span className="badge-green">{student.status}</span></td></tr>)}</tbody></table></div>{filtered.length === 0 && <EmptyState title="No matching students" description="Try a different search term." />}</div>
    {showAdd && <Modal title="Add student" onClose={() => setShowAdd(false)}><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><label className="field-label">Full name</label><input className="input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div><div><label className="field-label">Email</label><input className="input" required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div><div><label className="field-label">Roll number</label><input className="input" required value={form.rollNumber} onChange={e => setForm({ ...form, rollNumber: e.target.value })} /></div><div><label className="field-label">Section</label><select className="input" value={form.sectionId} onChange={e => setForm({ ...form, sectionId: e.target.value })}>{catalog.sections.map(s => <option key={s._id} value={s._id}>{s.name} · Sem {s.semester}</option>)}</select></div><div><label className="field-label">Admission year</label><input className="input" type="number" min="2000" max="2100" value={form.admissionYear} onChange={e => setForm({ ...form, admissionYear: e.target.value })} /></div><div className="sm:col-span-2"><label className="field-label">Initial password</label><input className="input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div><button className="btn-primary sm:col-span-2">Create student</button></form></Modal>}
  </div>;
}

export function FacultyPage() {
  const [faculty, setFaculty] = useState(null);
  const [catalog, setCatalog] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: 'Faculty@123', employeeId: '', departmentId: '' });
  const { setToast, node } = useToast();

  async function load() { const [f, c] = await Promise.all([api.get('/institution/faculty'), api.get('/institution/catalog')]); setFaculty(f.data); setCatalog(c.data); if (!form.departmentId && c.data.departments[0]) setForm(x => ({ ...x, departmentId: c.data.departments[0]._id })); }
  useEffect(() => { load().catch(err => setToast({ type: 'error', message: apiError(err) })); }, []);
  async function submit(e) { e.preventDefault(); try { await api.post('/institution/faculty', form); setShowAdd(false); setToast({ message: 'Faculty account created.' }); load(); } catch (err) { setToast({ type: 'error', message: apiError(err) }); } }
  if (!faculty || !catalog) return <Loading label="Loading faculty…" />;
  return <div className="space-y-6">{node}<div className="page-heading"><div><p className="eyebrow">People</p><h2>Faculty</h2><p>Active staff accounts and their departments.</p></div><button className="btn-primary" onClick={() => setShowAdd(true)}><UserPlus size={16} /> Add faculty</button></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{faculty.map(person => <div key={person._id} className="card p-5"><div className="flex items-start justify-between"><div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-50 text-cyan-600"><UserRoundIcon /></div><span className="badge-green">ACTIVE</span></div><h3 className="mt-5 font-bold text-slate-900">{person.name}</h3><p className="mt-1 text-xs text-slate-400">{person.employeeId}</p><div className="mt-4 flex items-center gap-2 text-sm text-slate-600"><Mail size={14} />{person.email}</div><div className="mt-2 flex items-center gap-2 text-sm text-slate-600"><BookOpen size={14} />{person.departmentId?.name || 'No department'}</div></div>)}</div>{showAdd && <Modal title="Add faculty" onClose={() => setShowAdd(false)}><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><label className="field-label">Full name</label><input className="input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div><div><label className="field-label">Email</label><input className="input" required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div><div><label className="field-label">Employee ID</label><input className="input" required value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} /></div><div><label className="field-label">Department</label><select className="input" value={form.departmentId} onChange={e => setForm({ ...form, departmentId: e.target.value })}>{catalog.departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}</select></div><div><label className="field-label">Initial password</label><input className="input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div><button className="btn-primary sm:col-span-2">Create faculty</button></form></Modal>}</div>;
}
function UserRoundIcon() { return <Users size={18} />; }

export function AcademicsPage() {
  const [catalog, setCatalog] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', departmentId: '', sectionId: '', semester: 1, academicYear: '2026-2027', periodsPerWeek: 3, facultyIds: [] });
  const [toast, setToast] = useState(null);
  async function load() { const { data } = await api.get('/institution/catalog'); setCatalog(data); }
  useEffect(() => { load().catch(err => setToast({ type: 'error', message: apiError(err) })); }, []);
  if (!catalog) return <Loading label="Loading academic structure…" />;

  function open(type) {
    setForm({ name: '', code: '', departmentId: catalog.departments[0]?._id || '', sectionId: catalog.sections[0]?._id || '', semester: 1, academicYear: '2026-2027', periodsPerWeek: 3, facultyIds: [] });
    setModal(type);
  }
  async function submit(e) {
    e.preventDefault();
    try {
      const payload = modal === 'department'
        ? { name: form.name, code: form.code }
        : modal === 'section'
          ? { departmentId: form.departmentId, name: form.name, semester: Number(form.semester), academicYear: form.academicYear }
          : { departmentId: form.departmentId, sectionId: form.sectionId, name: form.name, code: form.code, periodsPerWeek: Number(form.periodsPerWeek), facultyIds: form.facultyIds };
      await api.post(`/institution/${modal}s`, payload);
      setToast({ message: `${modal[0].toUpperCase() + modal.slice(1)} created.` });
      setModal(null);
      await load();
    } catch (err) { setToast({ type: 'error', message: apiError(err) }); }
  }

  return <div className="space-y-6"><Toast toast={toast} onClose={() => setToast(null)} /><div className="page-heading"><div><p className="eyebrow">Structure</p><h2>Academic setup</h2><p>Build the institution hierarchy used by attendance sessions.</p></div><div className="flex flex-wrap gap-2"><button className="btn-secondary" onClick={() => open('department')}><Plus size={15} /> Department</button><button className="btn-secondary" onClick={() => open('section')}><Plus size={15} /> Section</button><button className="btn-primary" onClick={() => open('subject')}><Plus size={15} /> Subject</button></div></div><div className="grid gap-4 lg:grid-cols-3"><AcademicBox title="Departments" icon={Building2}>{catalog.departments.map(d => <div className="list-line" key={d._id}><div><p className="font-semibold">{d.name}</p><p className="text-xs text-slate-400">{d.code}</p></div><BadgeCheck size={16} className="text-emerald-500" /></div>)}</AcademicBox><AcademicBox title="Sections" icon={Users}>{catalog.sections.map(s => <div className="list-line" key={s._id}><div><p className="font-semibold">{s.name}</p><p className="text-xs text-slate-400">Semester {s.semester} · {s.academicYear}</p></div><span className="text-xs font-semibold text-slate-400">{catalog.departments.find(d => d._id === s.departmentId)?.code || ''}</span></div>)}</AcademicBox><AcademicBox title="Subjects" icon={BookOpen}>{catalog.subjects.map(s => <div className="list-line" key={s._id}><div><p className="font-semibold">{s.name}</p><p className="text-xs text-slate-400">{s.code} · {s.sectionId?.name}</p></div><span className="text-xs font-semibold text-indigo-600">{s.facultyIds?.length || 0} faculty</span></div>)}</AcademicBox></div><div className="callout"><ShieldCheck size={18} /><div><p className="font-semibold">Tenant-safe academic data</p><p className="mt-1">All three entities are created through tenant-scoped server routes. The browser cannot create academic records for another institution.</p></div></div>
    {modal && <Modal title={`Add ${modal}`} onClose={() => setModal(null)}><form onSubmit={submit} className="space-y-4">{modal !== 'section' && <div><label className="field-label">Name</label><input className="input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={modal === 'department' ? 'Computer Science & Engineering' : 'Web Technology'} /></div>}{modal !== 'department' && <div><label className="field-label">Department</label><select className="input" value={form.departmentId} onChange={e => setForm({ ...form, departmentId: e.target.value })}>{catalog.departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}</select></div>}{modal !== 'section' && <div><label className="field-label">Code</label><input className="input" required value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder={modal === 'department' ? 'CSE' : 'WT801'} /></div>}{modal === 'section' && <><div><label className="field-label">Section name</label><input className="input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="CSE-A" /></div><div><label className="field-label">Semester</label><input className="input" type="number" min="1" max="12" value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} /></div><div><label className="field-label">Academic year</label><input className="input" value={form.academicYear} onChange={e => setForm({ ...form, academicYear: e.target.value })} /></div></>}{modal === 'subject' && <><div><label className="field-label">Section</label><select className="input" value={form.sectionId} onChange={e => setForm({ ...form, sectionId: e.target.value })}>{catalog.sections.filter(s => !form.departmentId || s.departmentId === form.departmentId).map(s => <option key={s._id} value={s._id}>{s.name} · Sem {s.semester}</option>)}</select></div><div><label className="field-label">Periods per week</label><input className="input" type="number" min="1" max="20" value={form.periodsPerWeek} onChange={e => setForm({ ...form, periodsPerWeek: e.target.value })} /></div><div><label className="field-label">Assigned faculty</label><select className="input" multiple value={form.facultyIds} onChange={e => setForm({ ...form, facultyIds: [...e.target.selectedOptions].map(o => o.value) })}>{catalog.faculty.filter(f => !form.departmentId || f.departmentId?._id === form.departmentId).map(f => <option key={f._id} value={f._id}>{f.name} · {f.employeeId}</option>)}</select><p className="mt-1 text-[11px] text-slate-400">Use Ctrl/Cmd to select more than one.</p></div></>}
      <button className="btn-primary w-full">Create {modal}</button></form></Modal>}
  </div>;
}

function AcademicBox({ title, icon: Icon, children }) { return <section className="card overflow-hidden"><div className="flex items-center gap-3 border-b border-slate-100 p-4"><div className="rounded-lg bg-indigo-50 p-2 text-indigo-600"><Icon size={16} /></div><h3 className="font-bold">{title}</h3></div><div className="p-4">{children}</div></section>; }
