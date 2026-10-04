import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('noteforge_token');
      if (token) {
        try {
          const res = await authAPI.getMe();
          if (res.data?.success) {
            setUser(res.data.user);
          }
        } catch {
          localStorage.removeItem('noteforge_token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.data?.success) {
      localStorage.setItem('noteforge_token', res.data.token);
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password });
    if (res.data?.success) {
      localStorage.setItem('noteforge_token', res.data.token);
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const googleSignIn = async (credential) => {
    const res = await authAPI.googleLogin(credential);
    if (res.data?.success) {
      localStorage.setItem('noteforge_token', res.data.token);
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data?.message || 'Google Sign-In failed');
  };

  const logout = () => {
    localStorage.removeItem('noteforge_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleSignIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
