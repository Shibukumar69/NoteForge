import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, BookOpen, PlusCircle, LayoutDashboard, LogOut, User as UserIcon } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/10 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-cyan-400 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-300">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-brand-300 bg-clip-text text-transparent">
              NoteForge <span className="text-brand-400 font-black">AI</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">
              Vision 2.0
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-4">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden md:inline">Dashboard</span>
              </Link>

              <Link
                to="/create"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold shadow-glow transition-all ${
                  isActive('/create')
                    ? 'bg-gradient-to-r from-brand-500 to-cyan-500 text-white shadow-brand-500/30'
                    : 'bg-brand-600 hover:bg-brand-500 text-white hover:shadow-brand-500/20'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Notes</span>
              </Link>

              <div className="h-6 w-px bg-white/10 mx-1" />

              <div className="flex items-center gap-3 pl-1">
                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-xs font-semibold text-slate-200">{user.name}</span>
                  <span className="text-[10px] text-slate-400">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/auth"
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/auth?tab=register"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white shadow-glow transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Get Started Free</span>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
