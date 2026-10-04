import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Video, Eye, FileText, Download, CheckCircle2, ArrowRight, Zap, BookOpen, Layers } from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="relative overflow-hidden pt-6 pb-16">
      {/* Background glowing orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto pt-8 pb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            AI-Powered Lecture to Handwritten Notes
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight sm:leading-tight">
            Stop Pausing Lectures. <br />
            <span className="bg-gradient-to-r from-brand-400 via-cyan-300 to-sky-200 bg-clip-text text-transparent">
              Generate Handwritten Notes Instantly.
            </span>
          </h1>

          <p className="mt-6 text-lg text-slate-300 font-normal leading-relaxed">
            NoteForge AI samples lecture video frames, eliminates duplicate slides with computer vision, synthesizes key concepts using Vision AI, and renders authentic ruled-notebook study notes into downloadable PDFs.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/create"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 shadow-glow transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              <span>Convert Lecture Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/auth"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-slate-200 glass-card hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-brand-400" />
              <span>Explore Demo Account</span>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-white/10 text-left">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-2xl font-black text-white">90%+</div>
              <div className="text-xs text-slate-400 mt-1">Duplicate Frames Eliminated</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-2xl font-black text-brand-400">300 DPI</div>
              <div className="text-xs text-slate-400 mt-1">Ultra-Clear Handwritten Output</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-2xl font-black text-cyan-400">4 Ink Styles</div>
              <div className="text-xs text-slate-400 mt-1">Royal Blue, Dark Charcoal, Sepia, Navy</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-2xl font-black text-emerald-400">1-Click</div>
              <div className="text-xs text-slate-400 mt-1">Compiled Study PDF & Flashcards</div>
            </div>
          </div>
        </div>

        {/* Live Handwritten Note Simulation Preview */}
        <div className="my-12 max-w-4xl mx-auto">
          <div className="rounded-2xl p-1 bg-gradient-to-r from-brand-500/40 via-cyan-500/40 to-purple-500/40 shadow-2xl">
            <div className="rounded-xl bg-[#0e1422] p-6 lg:p-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-mono text-slate-400 ml-2">DBMS_Normalization_Notes_Preview.png</span>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  Rendered Canvas
                </span>
              </div>

              {/* Simulated Paper Note */}
              <div className="notebook-page rounded-lg p-6 sm:p-10 text-slate-900 font-serif leading-relaxed shadow-notebook select-none">
                <div className="border-b-2 border-brand-900/30 pb-2 mb-4">
                  <h3 className="text-xl sm:text-2xl font-bold tracking-wide text-brand-900 uppercase">
                    DATABASE NORMALIZATION (1NF & 2NF)
                  </h3>
                </div>

                <div className="space-y-4 text-sm sm:text-base text-brand-950">
                  <div>
                    <h4 className="font-bold text-base text-brand-900">• First Normal Form (1NF)</h4>
                    <p className="pl-6 text-slate-800">→ Atomic values: Each column must contain single undivided values.</p>
                    <p className="pl-6 text-slate-800">→ No repeating groups or array elements in records.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-base text-brand-900">• Second Normal Form (2NF)</h4>
                    <p className="pl-6 text-slate-800">→ Must strictly satisfy 1NF prerequisites.</p>
                    <p className="pl-6 text-slate-800">→ Zero partial dependency: All non-key attributes fully dependent on primary key.</p>
                  </div>

                  <div className="bg-rose-50 border border-rose-300 p-2.5 rounded text-xs sm:text-sm text-rose-900 font-sans font-medium">
                    ★ <strong>Important Exam Point:</strong> Candidate key determines all transitive dependencies in BCNF.
                  </div>

                  <div className="border border-brand-800/40 p-2 rounded text-xs sm:text-sm font-mono bg-blue-50/50">
                    Formula: T(n) = a*T(n/b) + f(n) [Master Theorem Model]
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5-Step Pipeline Section */}
        <div className="py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-white">How NoteForge AI Works</h2>
            <p className="mt-3 text-slate-400 text-sm">
              Our 5-stage automated architecture transforms hours of video into crisp handwritten study summaries in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="glass-card p-5 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold mb-3">
                1
              </div>
              <h3 className="font-bold text-white text-base">Video Upload</h3>
              <p className="text-xs text-slate-400 mt-2">
                Upload your MP4/MKV educational lecture file or YouTube link.
              </p>
            </div>

            <div className="glass-card p-5 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold mb-3">
                2
              </div>
              <h3 className="font-bold text-white text-base">SSIM Slide Detector</h3>
              <p className="text-xs text-slate-400 mt-2">
                OpenCV samples frames and filters duplicate slides with Structural Similarity.
              </p>
            </div>

            <div className="glass-card p-5 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold mb-3">
                3
              </div>
              <h3 className="font-bold text-white text-base">Vision AI Analysis</h3>
              <p className="text-xs text-slate-400 mt-2">
                Gemini Vision extracts titles, key bullet points, formulas, and definitions.
              </p>
            </div>

            <div className="glass-card p-5 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold mb-3">
                4
              </div>
              <h3 className="font-bold text-white text-base">Handwriting Canvas</h3>
              <p className="text-xs text-slate-400 mt-2">
                Pillow renders realistic handwriting with natural organic jitter & ruled margins.
              </p>
            </div>

            <div className="glass-card p-5 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-3">
                5
              </div>
              <h3 className="font-bold text-white text-base">PDF & Quiz Study Set</h3>
              <p className="text-xs text-slate-400 mt-2">
                ReportLab compiles high-res PDF alongside AI flashcards and practice MCQs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
