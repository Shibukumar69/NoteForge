import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { notesAPI } from '../services/api';
import { Download, ChevronLeft, ChevronRight, BookOpen, ArrowLeft, Presentation, FileDown, ExternalLink } from 'lucide-react';

export const NotesViewerPage = () => {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('slides'); // 'slides', 'cheatsheet'

  useEffect(() => {
    loadNote();
  }, [id]);

  const loadNote = async () => {
    try {
      setLoading(true);
      const res = await notesAPI.getNoteById(id);
      if (res.data?.success && res.data.note) {
        setNote(res.data.note);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSelect = (qIdx, optIdx) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
    setShowExplanations((prev) => ({ ...prev, [qIdx]: true }));
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-300">Loading student cheat sheet & lecture slides...</p>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Study Notes Not Found</h2>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          This lecture might still be processing or has been removed.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  const pages = note.pages || [];
  const currentPage = pages[currentPageIndex] || pages[0];
  const slides = note.extractedSlides || [];
  const currentSlide = slides[currentSlideIndex] || slides[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Lectures</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {note.title}
          </h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>AKTU / Exam Cheat Sheet Style</span>
            <span>•</span>
            <span>{pages.length} Cheat Sheets</span>
            <span>•</span>
            <span>{slides.length} Raw Slides Extracted</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Cheat Sheet PDF Button */}
          <a
            href={note.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 shadow-glow transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Cheat Sheet PDF</span>
          </a>

          {/* All Slides PDF Button */}
          {note.slidesPdfUrl && (
            <a
              href={note.slidesPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-200 bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 transition-all"
            >
              <Presentation className="w-4 h-4 text-brand-400" />
              <span>Download Slides PDF</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Tabs: Only Original Lecture Slides & Exam Cheat Sheet Notes */}
      <div className="flex items-center gap-3 border-b border-white/10 my-6 pb-2">
        <button
          onClick={() => setActiveTab('slides')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'slides'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <Presentation className="w-4 h-4 text-cyan-400" />
          <span>Original Lecture Slides ({slides.length} Slides)</span>
        </button>

        <button
          onClick={() => setActiveTab('cheatsheet')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'cheatsheet'
              ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40 shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <BookOpen className="w-4 h-4 text-brand-400" />
          <span>Exam Cheat Sheet Notes ({pages.length} Pages)</span>
        </button>
      </div>

      {/* Tab 1: Exam Cheat Sheet Notes */}
      {activeTab === 'cheatsheet' && (
        <div className="space-y-6">
          {/* Page Navigation Toolbar */}
          <div className="flex items-center justify-between glass-panel p-3 px-6 rounded-2xl">
            <button
              disabled={currentPageIndex === 0}
              onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Sheet</span>
            </button>

            <span className="text-xs font-mono font-bold text-slate-300">
              Cheat Sheet {currentPageIndex + 1} of {pages.length}
            </span>

            <button
              disabled={currentPageIndex >= pages.length - 1}
              onClick={() => setCurrentPageIndex((prev) => Math.min(pages.length - 1, prev + 1))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <span>Next Sheet</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Rendered Cheat Sheet Display */}
          <div className="max-w-4xl mx-auto rounded-2xl p-1 bg-gradient-to-b from-white/10 via-white/5 to-transparent shadow-2xl">
            <div className="bg-[#101624] p-4 sm:p-8 rounded-xl flex justify-center">
              {currentPage?.imageUrl ? (
                <img
                  src={currentPage.imageUrl}
                  alt={`Exam Cheat Sheet ${currentPageIndex + 1}`}
                  className="rounded-lg shadow-2xl max-w-full h-auto border border-black/20"
                />
              ) : (
                /* Fallback Clean Grid */
                <div className="bg-white rounded-lg p-6 sm:p-10 text-slate-900 border-4 border-blue-900 w-full max-w-3xl font-sans">
                  <div className="bg-blue-50 border-2 border-blue-900 p-4 rounded-lg flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-black text-rose-700 uppercase tracking-tight">
                        {currentPage?.title || 'Exam Cheat Sheet'}
                      </h3>
                      <p className="text-xs font-semibold text-blue-900 mt-0.5">
                        {currentPage?.summary || 'Comprehensive High-Yield Revision'}
                      </p>
                    </div>
                    <div className="bg-amber-100 border border-amber-400 px-3 py-1.5 rounded-lg text-right">
                      <span className="text-[11px] font-bold text-amber-900 block">Quick Revision</span>
                      <span className="text-xs font-black text-rose-600 block">★ Score High!</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentPage?.topics?.map((topic, tIdx) => (
                      <div key={tIdx} className="border-2 border-blue-200 rounded-lg p-3.5 bg-slate-50">
                        <div className="bg-pink-100 border border-pink-400 px-2.5 py-1 rounded text-xs font-bold text-pink-900 mb-2.5">
                          {tIdx + 1}. {topic.heading}
                        </div>
                        <ul className="space-y-1.5 text-xs text-slate-800">
                          {topic.points?.map((pt, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-1.5">
                              <span className="text-blue-700 font-bold">•</span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Original Lecture Slides Section */}
      {activeTab === 'slides' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Presentation className="w-5 h-5 text-cyan-400" />
                <span>Original Lecture Slide Keyframes</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Extracted directly from the video by NoteForge Computer Vision SSIM deduplicator.
              </p>
            </div>

            {note.slidesPdfUrl && (
              <a
                href={note.slidesPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-glow"
              >
                <FileDown className="w-4 h-4" />
                <span>Download All Slides PDF</span>
              </a>
            )}
          </div>

          {slides.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {slides.map((slide, sIdx) => (
                <div key={sIdx} className="glass-card rounded-2xl p-4 flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                      <span className="text-brand-400">Slide #{slide.slideIndex || sIdx + 1}</span>
                      <span className="font-mono text-[11px] text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                        ⏱ {slide.timestamp || '00:00'}
                      </span>
                    </div>

                    <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40 aspect-video flex items-center justify-center relative">
                      {slide.imageUrl ? (
                        <img
                          src={slide.imageUrl}
                          alt={`Slide ${slide.slideIndex || sIdx + 1}`}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Presentation className="w-8 h-8 text-slate-600" />
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Clean keyframe</span>
                    <a
                      href={slide.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Full view</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl text-center">
              <Presentation className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">Slide Gallery</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Slides are compiled into the downloadable PDF available above.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
