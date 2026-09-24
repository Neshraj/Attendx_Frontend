import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadSession() {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadSession(); }, []);

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data.user);
    return data.user;
  }

  async function registerInstitution(payload) {
    const { data } = await api.post('/auth/register-institution', payload);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    try { await api.post('/auth/logout'); } finally { setUser(null); }
  }

  const value = useMemo(() => ({ user, loading, login, logout, registerInstitution }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
