import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppShell from './components/AppShell';
import Loading from './components/Loading';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import Dashboard from './pages/Dashboard';
import { StudentsPage, FacultyPage, AcademicsPage } from './pages/AdminPages';
import { CorrectionsPage, ReportsPage, AuditPage, MarkAttendancePage, AttendanceHistoryPage, MyAttendancePage, InstitutionsPage } from './pages/OperationsPages';

function Protected({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading label="Checking session…" />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <AppShell>{children}</AppShell>;
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading label="Loading…" />;
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return <AuthProvider><BrowserRouter><Routes>
    <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
    <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />
    <Route path="/" element={<Protected><Dashboard /></Protected>} />
    <Route path="/students" element={<Protected roles={['INSTITUTION_ADMIN']}><StudentsPage /></Protected>} />
    <Route path="/faculty" element={<Protected roles={['INSTITUTION_ADMIN']}><FacultyPage /></Protected>} />
    <Route path="/academics" element={<Protected roles={['INSTITUTION_ADMIN']}><AcademicsPage /></Protected>} />
    <Route path="/corrections" element={<Protected roles={['INSTITUTION_ADMIN', 'FACULTY', 'STUDENT']}><CorrectionsPage /></Protected>} />
    <Route path="/reports" element={<Protected roles={['INSTITUTION_ADMIN']}><ReportsPage /></Protected>} />
    <Route path="/audit" element={<Protected roles={['INSTITUTION_ADMIN', 'PLATFORM_ADMIN']}><AuditPage /></Protected>} />
    <Route path="/attendance/mark" element={<Protected roles={['FACULTY']}><MarkAttendancePage /></Protected>} />
    <Route path="/attendance/history" element={<Protected roles={['FACULTY', 'INSTITUTION_ADMIN']}><AttendanceHistoryPage /></Protected>} />
    <Route path="/my-attendance" element={<Protected roles={['STUDENT']}><MyAttendancePage /></Protected>} />
    <Route path="/institutions" element={<Protected roles={['PLATFORM_ADMIN']}><InstitutionsPage /></Protected>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></BrowserRouter></AuthProvider>;
}
