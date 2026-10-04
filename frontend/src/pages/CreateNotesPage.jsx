import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { lectureAPI } from '../services/api';
import { Youtube, Upload, Sparkles, Check, Palette, FileText, Globe, AlertCircle, PlayCircle, Loader2, ArrowRight, ExternalLink } from 'lucide-react';

export const CreateNotesPage = () => {
  const [mode, setMode] = useState('youtube'); // 'youtube' or 'upload'
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [ytLoading, setYtLoading] = useState(false);
  const [ytMeta, setYtMeta] = useState(null);

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('en');
  const [notesStyle, setNotesStyle] = useState('detailed');
  const [inkStyle, setInkStyle] = useState('royal_blue');

  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const curatedLectures = [
    {
      title: "Database Normalization (1NF, 2NF, 3NF)",
      url: "https://www.youtube.com/watch?v=GFQaEYEc8_8",
      channel: "Database Systems Lecture",
      tag: "Computer Science"
    },
    {
      title: "Neural Networks & Gradient Descent",
      url: "https://www.youtube.com/watch?v=aircAruvnKk",
      channel: "Machine Learning Concepts",
      tag: "AI & Data"
    },
    {
      title: "Operating Systems & CPU Scheduling",
      url: "https://www.youtube.com/watch?v=26QPDBe-NB8",
      channel: "Core CS Academy",
      tag: "OS & Arch"
    }
  ];

  const handleFetchYouTube = async (urlToFetch) => {
    const targetUrl = urlToFetch || youtubeUrl;
    if (!targetUrl.trim()) return;

    setError('');
    setYtLoading(true);

    try {
      const res = await lectureAPI.getYouTubeInfo(targetUrl);
      if (res.data?.success && res.data.info) {
        setYtMeta(res.data.info);
        setTitle(res.data.info.title || 'YouTube Lecture Notes');
      }
    } catch (err) {
      // Still allow submission even if metadata preview is restricted
      const fallbackTitle = "YouTube Educational Lecture";
      setTitle(fallbackTitle);
      setYtMeta({
        title: fallbackTitle,
        uploader: "Educational Channel",
        thumbnail: `https://img.youtube.com/vi/${extractYTId(targetUrl)}/hqdefault.jpg`
      });
    } finally {
      setYtLoading(false);
    }
  };

  const extractYTId = (url) => {
    const m = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    return m ? m[1] : 'default';
  };

  const handleSelectCurated = (lecture) => {
    setYoutubeUrl(lecture.url);
    handleFetchYouTube(lecture.url);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'youtube') {
      if (!youtubeUrl.trim()) {
        setError('Please paste a valid YouTube lecture URL.');
        return;
      }

      setSubmitting(true);
      try {
        const res = await lectureAPI.createLectureFromYouTube({
          youtubeUrl: youtubeUrl.trim(),
          title: title || ytMeta?.title || 'YouTube Lecture Notes',
          thumbnailUrl: ytMeta?.thumbnail || '',
          language,
          notesStyle,
          inkStyle,
        });

        if (res.data?.success && res.data.lecture) {
          navigate(`/processing/${res.data.lecture._id}`);
        } else {
          throw new Error(res.data?.message || 'Failed to initialize YouTube note generation');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'YouTube processing request failed');
        setSubmitting(false);
      }
    } else {
      // Local File Upload mode
      if (!file) {
        setError('Please select a lecture video file to upload.');
        return;
      }

      setSubmitting(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('video', file);
      formData.append('title', title || 'Lecture Notes');
      formData.append('language', language);
      formData.append('notesStyle', notesStyle);
      formData.append('inkStyle', inkStyle);

      try {
        const res = await lectureAPI.createLecture(formData, (progress) => {
          setUploadProgress(progress);
        });

        if (res.data?.success && res.data.lecture) {
          navigate(`/processing/${res.data.lecture._id}`);
        } else {
          throw new Error(res.data?.message || 'Failed to initialize processing job');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Video upload failed');
        setSubmitting(false);
      }
    }
  };

  const inkOptions = [
    { id: 'royal_blue', name: 'Royal Blue', color: '#1c3694', desc: 'Classic student ballpoint pen' },
    { id: 'dark_charcoal', name: 'Dark Charcoal', color: '#232328', desc: 'Crisp graphite gel pen' },
    { id: 'navy_blue', name: 'Navy Blue', color: '#0f1e50', desc: 'Deep fountain pen ink' },
    { id: 'sepia', name: 'Vintage Sepia', color: '#502d19', desc: 'Warm nostalgic study ink' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Youtube className="w-8 h-8 text-red-500" />
          <span>YouTube Lecture to Handwritten Notes</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Paste any YouTube lecture video link. Vision AI will automatically analyze the lecture slides and generate realistic handwritten study notes & PDF.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex rounded-xl bg-black/40 p-1 mb-8 border border-white/10 max-w-md">
        <button
          type="button"
          onClick={() => { setMode('youtube'); setError(''); }}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
            mode === 'youtube'
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Youtube className="w-4 h-4" />
          <span>YouTube Video Link</span>
        </button>

        <button
          type="button"
          onClick={() => { setMode('upload'); setError(''); }}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
            mode === 'upload'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Local Video File</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-300">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Video Input */}
        {mode === 'youtube' ? (
          <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>1. Enter YouTube Educational Lecture Link</span>
            </h2>

            {/* URL Input */}
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <div className="relative flex-1">
                <Youtube className="w-5 h-5 text-red-500 absolute left-3.5 top-3" />
                <input
                  type="url"
                  required
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  onBlur={() => handleFetchYouTube()}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={() => handleFetchYouTube()}
                disabled={ytLoading || !youtubeUrl}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {ytLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Fetch Video</span>}
              </button>
            </div>

            {/* Video Metadata Preview Card */}
            {ytMeta && (
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {ytMeta.thumbnail && (
                  <img
                    src={ytMeta.thumbnail}
                    alt={ytMeta.title}
                    className="w-36 h-20 object-cover rounded-lg border border-white/10 shrink-0"
                  />
                )}
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                    {ytMeta.uploader || 'YouTube Educational Video'}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5 line-clamp-2">
                    {ytMeta.title}
                  </h3>
                  <span className="text-xs text-emerald-400 font-medium mt-1 inline-flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Ready for slide extraction
                  </span>
                </div>
              </div>
            )}

            {/* Quick Demo Lectures */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-400 block mb-2">
                Or try with sample popular educational lectures:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {curatedLectures.map((lec, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectCurated(lec)}
                    className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-red-500/30 text-left transition-all group"
                  >
                    <span className="text-[10px] font-semibold text-brand-300 px-1.5 py-0.5 rounded bg-brand-500/10 border border-brand-500/20">
                      {lec.tag}
                    </span>
                    <h4 className="text-xs font-bold text-white mt-1.5 line-clamp-1 group-hover:text-red-300">
                      {lec.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{lec.channel}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Local File Upload Dropzone */
          <div className="glass-panel p-6 sm:p-8 rounded-2xl">
            <label className="block text-sm font-bold text-white mb-3">
              1. Local Lecture Video File
            </label>
            <div className="relative border-2 border-dashed border-white/15 hover:border-brand-400/50 rounded-2xl p-8 text-center transition-all bg-black/20 group">
              <input
                type="file"
                accept="video/*,.mp4,.mkv,.webm,.avi,.mov"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-brand-500/10 group-hover:bg-brand-500/20 text-brand-400 flex items-center justify-center mb-3 transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                {file ? (
                  <div>
                    <p className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4" /> {file.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB • Click to change
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Drag and drop lecture video, or <span className="text-brand-400 underline">browse</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Supports MP4, MKV, WebM, MOV</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Notes Style & Ink Customization */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
          <h2 className="text-sm font-bold text-white mb-2">2. Lecture Details & Ink Style</h2>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Lecture Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Database Normalization & BCNF"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-400 transition-colors"
            />
          </div>

          {/* Ink Palette */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-brand-400" />
              <span>Handwritten Pen Ink Style</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {inkOptions.map((ink) => (
                <button
                  key={ink.id}
                  type="button"
                  onClick={() => setInkStyle(ink.id)}
                  className={`p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                    inkStyle === ink.id
                      ? 'bg-brand-500/15 border-brand-400 shadow-glow'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className="w-5 h-5 rounded-full shadow-inner border border-white/20"
                      style={{ backgroundColor: ink.color }}
                    />
                    {inkStyle === ink.id && <Check className="w-4 h-4 text-brand-400" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{ink.name}</div>
                    <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{ink.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Style & Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Notes Synthesis Style</span>
              </label>
              <select
                value={notesStyle}
                onChange={(e) => setNotesStyle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#111726] border border-white/10 text-white text-xs focus:outline-none focus:border-brand-400"
              >
                <option value="detailed">Comprehensive Study Notes</option>
                <option value="summary">Quick Revision / Short Notes</option>
                <option value="exam_revision">Exam Focus & Key Questions</option>
                <option value="formula_sheet">Formulas & Definitions Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Lecture Language</span>
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#111726] border border-white/10 text-white text-xs focus:outline-none focus:border-brand-400"
              >
                <option value="en">English</option>
                <option value="hi">Hindi / Hinglish</option>
                <option value="es">Spanish</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 via-rose-600 to-brand-600 hover:from-red-500 hover:to-brand-500 shadow-glow transition-all flex items-center justify-center gap-2 text-base disabled:opacity-60"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Initializing Lecture Processing...</span>
              </div>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Handwritten Study Notes & PDF</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
