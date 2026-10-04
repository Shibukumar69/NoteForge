import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { lectureAPI } from '../services/api';
import { Sparkles, Video, Eye, FileText, CheckCircle2, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

export const ProcessingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lecture, setLecture] = useState(null);
  const [note, setNote] = useState(null);
  const [error, setError] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(15);

  const pipelineSteps = [
    { title: 'Video Decoding & Fast Frame Sampling', desc: 'Sampling lecture video stream at adaptive intervals using OpenCV' },
    { title: 'SSIM Slide Deduplication (60% Change)', desc: 'Detecting unique slide keyframes with zero duplicates & least teacher occlusion' },
    { title: 'Parallel Vision AI Conceptual Extraction', desc: 'Gemini Vision AI extracting titles, formulas, points, and exam markers in parallel' },
    { title: 'High-Yield Cheat Sheet Layout Rendering', desc: 'Synthesizing dense 4-5 page revision cards with pastel styling' },
    { title: 'PDF Compilation (Cheat Sheet & Slides PDF)', desc: 'Compiling exam cheat sheet notes PDF and original lecture slides PDF' },
  ];

  useEffect(() => {
    let intervalId = null;

    const pollStatus = async () => {
      try {
        const res = await lectureAPI.getStatus(id);
        if (res.data?.success) {
          const lec = res.data.lecture;
          const nt = res.data.note;
          setLecture(lec);
          setNote(nt);

          // Update animated step and progress percentage
          if (lec.status === 'completed' || nt) {
            setCurrentStepIndex(4);
            setProgressPercent(100);
            clearInterval(intervalId);
            setTimeout(() => {
              navigate(`/notes/${id}`);
            }, 600);
          } else if (lec.status === 'failed') {
            clearInterval(intervalId);
            setError('Processing pipeline encountered an issue. Please try again with a clear video.');
          }
        }
      } catch (err) {
        console.error('Error polling status:', err);
      }
    };

    pollStatus();
    intervalId = setInterval(pollStatus, 2000);

    return () => clearInterval(intervalId);
  }, [id, navigate]);

  // Smooth realistic progress increment & dynamic step advancement
  useEffect(() => {
    if (lecture?.status === 'completed' || error) return;
    const timer = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev < 99) {
          const increment = prev < 40 ? 3 : prev < 75 ? 1.5 : prev < 92 ? 0.8 : 0.3;
          const next = Number((prev + increment).toFixed(0));
          if (next < 20) setCurrentStepIndex(0);
          else if (next < 45) setCurrentStepIndex(1);
          else if (next < 70) setCurrentStepIndex(2);
          else if (next < 90) setCurrentStepIndex(3);
          else setCurrentStepIndex(4);
          return Math.min(99, next);
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lecture?.status, error]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="glass-panel p-8 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mx-auto mb-4">
            {lecture?.status === 'completed' ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
            ) : (
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {lecture?.status === 'completed'
              ? 'Handwritten Notes & Slides Ready!'
              : 'Synthesizing Your Lecture Notes...'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto font-medium">
            {lecture?.title || 'Lecture Processing'}
          </p>
        </div>

        {/* Live Percentage Progress Bar */}
        <div className="mb-8 p-5 rounded-2xl bg-white/[0.03] border border-white/10 shadow-inner">
          <div className="flex items-center justify-between text-xs font-semibold mb-3">
            <span className="text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Overall Processing Progress</span>
            </span>
            <span className="text-sm font-black font-mono text-cyan-300 bg-cyan-500/15 px-3.5 py-1 rounded-xl border border-cyan-500/30 shadow-sm">
              {progressPercent}%
            </span>
          </div>

          {/* Animated Gradient Bar */}
          <div className="w-full h-3.5 rounded-full bg-black/40 overflow-hidden p-0.5 border border-white/10 relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 via-cyan-400 to-emerald-400 transition-all duration-700 ease-out shadow-glow"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
            <span>Fast AI Pipeline Active</span>
            <span>{progressPercent === 100 ? 'Finalizing...' : 'Generating 4-5 Page Cheat Sheet & Slides PDF'}</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-300">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <Link
              to="/create"
              className="px-4 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold text-center transition-colors shrink-0"
            >
              Try Another Video
            </Link>
          </div>
        )}

        {/* Pipeline Step-by-Step Tracker */}
        <div className="space-y-4 my-8">
          {pipelineSteps.map((step, idx) => {
            const isDone = currentStepIndex > idx || lecture?.status === 'completed';
            const isCurrent = currentStepIndex === idx && lecture?.status !== 'completed';

            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                  isDone
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-200'
                    : isCurrent
                    ? 'bg-cyan-500/15 border-cyan-400 shadow-glow text-white'
                    : 'bg-white/[0.01] border-white/5 text-slate-500'
                }`}
              >
                <div className="mt-0.5">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-white/10 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="text-sm font-bold flex items-center justify-between">
                    <span>{step.title}</span>
                    {isCurrent && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-300 px-2 py-0.5 rounded bg-cyan-500/20">
                        In Progress
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {lecture?.status === 'completed' && (
          <div className="mt-8 text-center">
            <Link
              to={`/notes/${id}`}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-glow transition-all"
            >
              <span>Open Handwritten Study Notes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
