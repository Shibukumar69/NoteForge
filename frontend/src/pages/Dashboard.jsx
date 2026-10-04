import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { lectureAPI, notesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  PlusCircle,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ArrowRight,
  Tag,
  Plus,
  X,
  Presentation,
  Filter,
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const [lectures, setLectures] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Delete state
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Tag input state for inline addition
  const [activeTagInputId, setActiveTagInputId] = useState(null);
  const [newTagText, setNewTagText] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [lecRes, noteRes] = await Promise.all([
        lectureAPI.getLectures().catch(() => ({ data: { lectures: [] } })),
        notesAPI.getNotes().catch(() => ({ data: { notes: [] } })),
      ]);
      setLectures(lecRes.data?.lectures || []);
      setNotes(noteRes.data?.notes || []);
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete Lecture
  const handleDeleteLecture = async (lectureId) => {
    try {
      setIsDeleting(true);
      await lectureAPI.deleteLecture(lectureId);
      setLectures((prev) => prev.filter((l) => l._id !== lectureId));
      setNotes((prev) => prev.filter((n) => n.lectureId !== lectureId && n._id !== lectureId));
      setConfirmDeleteId(null);
    } catch (err) {
      console.error('Failed to delete lecture:', err);
      alert('Could not delete lecture. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Add Tag to Lecture
  const handleAddTag = async (lectureId) => {
    if (!newTagText.trim()) {
      setActiveTagInputId(null);
      return;
    }
    const cleanTag = newTagText.trim().replace(/^#/, '');
    const currentLecture = lectures.find((l) => l._id === lectureId);
    if (!currentLecture) return;

    const existingTags = currentLecture.tags || [];
    if (existingTags.includes(cleanTag)) {
      setNewTagText('');
      setActiveTagInputId(null);
      return;
    }

    const updatedTags = [...existingTags, cleanTag];
    // Optimistic update
    setLectures((prev) =>
      prev.map((l) => (l._id === lectureId ? { ...l, tags: updatedTags } : l))
    );
    setNewTagText('');
    setActiveTagInputId(null);

    try {
      await lectureAPI.updateLectureTags(lectureId, updatedTags);
    } catch (err) {
      console.error('Failed to save tag:', err);
    }
  };

  // Handle Remove Tag
  const handleRemoveTag = async (lectureId, tagToRemove) => {
    const currentLecture = lectures.find((l) => l._id === lectureId);
    if (!currentLecture) return;

    const updatedTags = (currentLecture.tags || []).filter((t) => t !== tagToRemove);
    setLectures((prev) =>
      prev.map((l) => (l._id === lectureId ? { ...l, tags: updatedTags } : l))
    );

    try {
      await lectureAPI.updateLectureTags(lectureId, updatedTags);
    } catch (err) {
      console.error('Failed to remove tag:', err);
    }
  };

  // Collect all unique tags from lectures
  const allUniqueTags = useMemo(() => {
    const set = new Set();
    lectures.forEach((l) => {
      (l.tags || []).forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [lectures]);

  // Filter lectures by search term, status, and tag
  const filteredLectures = useMemo(() => {
    return lectures.filter((l) => {
      // 1. Search filter
      const matchesSearch =
        l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.tags || []).some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

      // 2. Status filter
      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'ready' && l.status === 'completed') ||
        (selectedStatus === 'failed' && l.status === 'failed') ||
        (selectedStatus === 'processing' && l.status !== 'completed' && l.status !== 'failed');

      // 3. Tag filter
      const matchesTag =
        selectedTag === 'all' || (l.tags || []).includes(selectedTag);

      return matchesSearch && matchesStatus && matchesTag;
    });
  }, [lectures, searchTerm, selectedStatus, selectedTag]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Ready
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3 h-3" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20 animate-pulse">
            <Clock className="w-3 h-3" /> Processing...
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome back, {user?.name || 'Student'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your AI-transcribed lectures, original slides, and study notes library.
          </p>
        </div>

        <Link
          to="/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 shadow-glow transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Lecture Video</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-8">
        <div className="glass-card p-5 rounded-2xl">
          <div className="text-slate-400 text-xs font-semibold">Total Lectures</div>
          <div className="text-2xl font-black text-white mt-1">{lectures.length}</div>
          <div className="text-[10px] text-brand-400 mt-2">Recorded & uploaded</div>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="text-slate-400 text-xs font-semibold">Handwritten Sheets</div>
          <div className="text-2xl font-black text-brand-400 mt-1">{notes.length}</div>
          <div className="text-[10px] text-slate-400 mt-2">Compiled booklets</div>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="text-slate-400 text-xs font-semibold">Pages Generated</div>
          <div className="text-2xl font-black text-cyan-400 mt-1">
            {notes.reduce((acc, n) => acc + (n.totalPages || 1), 0)}
          </div>
          <div className="text-[10px] text-slate-400 mt-2">300 DPI high-res sheets</div>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="text-slate-400 text-xs font-semibold">Lecture Slides</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {notes.reduce((acc, n) => acc + (n.extractedSlides?.length || 0), 0)}
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-2">Clean keyframes</div>
        </div>
      </div>

      {/* Search & Filter Controls Header */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-400" />
            <span>Your Lecture Archive</span>
            <span className="text-xs font-normal text-slate-400 ml-1">
              ({filteredLectures.length} of {lectures.length})
            </span>
          </h2>

          <div className="flex items-center gap-3">
            {/* Status Filter Buttons */}
            <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  selectedStatus === 'all'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedStatus('ready')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  selectedStatus === 'ready'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Ready
              </button>
              <button
                onClick={() => setSelectedStatus('failed')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  selectedStatus === 'failed'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Failed
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or tag..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-400 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Tag Pills Filter Bar */}
        {allUniqueTags.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0 mr-1">
              <Tag className="w-3.5 h-3.5 text-brand-400" />
              <span>Tags:</span>
            </div>

            <button
              onClick={() => setSelectedTag('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
                selectedTag === 'all'
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40 shadow-sm'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              All Tags
            </button>

            {allUniqueTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? 'all' : tag)}
                className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all flex items-center gap-1 ${
                  selectedTag === tag
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                <span>#{tag}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lectures Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading your lecture library...</p>
        </div>
      ) : filteredLectures.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-2xl border-dashed border-white/10">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No lectures match your filter</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-6">
            {lectures.length === 0
              ? 'Upload your first lecture video to generate structured study sheets.'
              : 'Try clearing your search query or selecting "All Tags".'}
          </p>
          {lectures.length === 0 ? (
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-glow"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Upload Lecture Video</span>
            </Link>
          ) : (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedTag('all');
                setSelectedStatus('all');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20"
            >
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLectures.map((lecture) => {
            const isConfirming = confirmDeleteId === lecture._id;

            return (
              <div
                key={lecture._id}
                className="glass-card rounded-2xl p-6 flex flex-col justify-between group relative transition-all duration-200 hover:border-white/20"
              >
                <div>
                  {/* Top Bar: Date, Badges & Delete Button */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(lecture.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(lecture.status)}

                      {/* Delete Trigger Button */}
                      <button
                        title="Delete Lecture & Notes"
                        onClick={() => setConfirmDeleteId(lecture._id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-white line-clamp-2 mb-3">
                    {lecture.title}
                  </h3>

                  {/* Tags Section */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-6">
                    {/* Default style pill */}
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] text-slate-400 capitalize">
                      {lecture.notesStyle?.replace('_', ' ') || 'Detailed'}
                    </span>

                    {/* Custom Lecture Tags */}
                    {(lecture.tags || []).map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-medium text-cyan-300"
                      >
                        <span>#{tag}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveTag(lecture._id, tag);
                          }}
                          className="hover:text-rose-400 transition-colors ml-0.5"
                          title="Remove Tag"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}

                    {/* Add Tag Inline Form */}
                    {activeTagInputId === lecture._id ? (
                      <div className="inline-flex items-center gap-1 bg-brand-500/10 border border-brand-500/30 rounded-md px-1.5 py-0.5">
                        <input
                          type="text"
                          value={newTagText}
                          onChange={(e) => setNewTagText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddTag(lecture._id);
                            if (e.key === 'Escape') setActiveTagInputId(null);
                          }}
                          placeholder="Tag name..."
                          autoFocus
                          className="w-20 bg-transparent text-[10px] text-white focus:outline-none"
                        />
                        <button
                          onClick={() => handleAddTag(lecture._id)}
                          className="text-brand-400 hover:text-brand-300"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setActiveTagInputId(null)}
                          className="text-slate-500 hover:text-slate-300"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveTagInputId(lecture._id);
                          setNewTagText('');
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.03] hover:bg-white/10 border border-dashed border-white/10 hover:border-white/20 text-[10px] text-slate-400 hover:text-white transition-all"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>Tag</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons or Delete Confirmation */}
                <div className="pt-4 border-t border-white/5">
                  {isConfirming ? (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex flex-col gap-2">
                      <div className="text-[11px] font-semibold text-rose-300 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Delete this lecture & all notes?</span>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          disabled={isDeleting}
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          disabled={isDeleting}
                          onClick={() => handleDeleteLecture(lecture._id)}
                          className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-sm transition-colors"
                        >
                          {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                        </button>
                      </div>
                    </div>
                  ) : lecture.status === 'completed' ? (
                    <Link
                      to={`/notes/${lecture._id}`}
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-colors shadow-sm"
                    >
                      <span>View Notes & PDF</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : lecture.status === 'failed' ? (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-rose-400">Processing failed</span>
                      <button
                        onClick={() => setConfirmDeleteId(lecture._id)}
                        className="text-rose-400 hover:text-rose-300 font-semibold underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  ) : (
                    <Link
                      to={`/processing/${lecture._id}`}
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 transition-colors"
                    >
                      <span>View Live Progress</span>
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
