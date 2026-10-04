import React from 'react';
import { BookOpen, Github, Heart, Sparkles } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-[#070b13] py-8 px-4 text-center text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-brand-400" />
          <span className="font-semibold text-slate-300">NoteForge AI</span>
          <span>— Production Architecture Engine</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>for students & lifelong learners worldwide.</span>
        </div>
      </div>
    </footer>
  );
};
