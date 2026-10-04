import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Sparkles, Lock, Mail, User, AlertCircle, ArrowRight } from 'lucide-react';

const GOOGLE_CLIENT_ID = "714764553063-h90dh8tbbliildus181kd8qhic81cva9.apps.googleusercontent.com";

export const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('tab') !== 'register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, googleSignIn } = useAuth();
  const navigate = useNavigate();

  // Load Google Identity Services script
  useEffect(() => {
    const loadGoogleScript = () => {
      if (document.getElementById('google-client-script')) return;
      const script = document.createElement('script');
      script.id = 'google-client-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleAuth;
      document.body.appendChild(script);
    };

    const initializeGoogleAuth = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });
        const btnContainer = document.getElementById('google-btn-container');
        if (btnContainer) {
          window.google.accounts.id.renderButton(btnContainer, {
            theme: 'filled_black',
            size: 'large',
            shape: 'pill',
            text: 'continue_with',
            width: '100%',
          });
        }
      }
    };

    loadGoogleScript();
    if (window.google?.accounts?.id) {
      initializeGoogleAuth();
    }
  }, []);

  const handleGoogleResponse = async (response) => {
    if (!response.credential) return;
    setLoading(true);
    setError('');
    try {
      await googleSignIn(response.credential);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login('demo@noteforge.ai', 'demo123456');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="glass-panel p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center mx-auto mb-3 shadow-glow">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {isLogin ? 'Welcome to NoteForge AI' : 'Create your account'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Turn YouTube lectures into handwritten notes & PDF in seconds
            </p>
          </div>

          {/* Google Sign-In Button */}
          <div className="mb-6">
            <div id="google-btn-container" className="flex justify-center w-full min-h-[44px]" />
          </div>

          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#111726] px-3 text-[11px] text-slate-400 font-medium uppercase tracking-wider relative">
              Or with email
            </span>
            <div className="border-t border-white/10 w-full" />
          </div>

          {/* Tab Switcher */}
          <div className="flex rounded-lg bg-black/40 p-1 mb-6 border border-white/5">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                isLogin ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                !isLogin ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-400 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 shadow-glow transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Sign In to Dashboard' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Instant Demo One-Click Access */}
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Instant One-Click Demo Access</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
