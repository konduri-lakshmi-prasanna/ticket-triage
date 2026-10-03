import { createContext, useContext, useEffect, useState } from 'react';
import {
  AUTH_EXPIRED_EVENT,
  getSession,
  loginAdmin,
  loginUser,
  registerUser,
  setSession,
} from '../lib';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // { token, id, name, email, role } or null when logged out
  const [user, setUser] = useState(getSession);

  // lib.js fires this when the server rejects the token (expired or invalid)
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  const finish = (data) => {
    setSession(data);
    setUser(data);
    return data;
  };

  const value = {
    user,
    isAdmin: user?.role === 'ADMIN',
    login: async (email, password) => finish(await loginUser({ email, password })),
    adminLogin: async (email, password) => finish(await loginAdmin({ email, password })),
    register: async (name, email, password) =>
      finish(await registerUser({ name, email, password })),
    logout: () => {
      setSession(null);
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}