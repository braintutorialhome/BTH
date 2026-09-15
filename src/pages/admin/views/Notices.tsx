import React, { useState, useMemo } from 'react';
import { useStorage } from '../../../hooks/useStorage';
import { Notice } from '../../../types';
import { 
  Plus, Bell, Trash2, Megaphone, CheckCircle2, AlertCircle, X, 
  Pencil, Pin, Search, Filter, Share2, Copy, Check, FileText, 
  Calendar, Eye, BookOpen, Clock, AlertTriangle, Sparkles, Send
} from 'lucide-react';
import { safeFormat } from '../../../lib/utils';
import { FormattedNoticeContent } from '../../../components/notice/FormattedNoticeContent';
import { exportNoticeToPdf } from '../../../utils/noticePdfExport';
import { showExportToast } from '../../../utils/mobileExportHelper';

const NOTICE_CATEGORIES = [
  { id: 'General', label: 'General Announcement', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  { id: 'Urgent', label: 'Urgent / Important', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  { id: 'Exam', label: 'Exams & Tests', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  { id: 'Holiday', label: 'Holidays & Vacations', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { id: 'Fee', label: 'Fees & Accounts', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { id: 'Schedule', label: 'Timetable & Classes', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { id: 'Academic', label: 'Academic & Syllabus', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { id: 'Event', label: 'Events & Functions', color: 'bg-pink-500/10 text-pink-400 border-pink-500/20' }
];

export default function NoticeManagement() {
  const { notices, addNotice, updateNotice, deleteNotice, students } = useStorage();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [classFilter, setClassFilter] = useState('All');

  // Modal State for Create & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write');

  // Form State
  const [formState, setFormState] = useState<{
    title: string;
    content: string;
    category: string;
    targetClass: string;
    isImportant: boolean;
    isPinned: boolean;
  }>({
    title: '',
    content: '',
    category: 'General',
    targetClass: 'All',
    isImportant: false,
    isPinned: false
  });

  // Action states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [exportingPdfId, setExportingPdfId] = useState<string | null>(null);
  const [deleteConfirmNotice, setDeleteConfirmNotice] = useState<Notice | null>(null);

  // Available classes derived from student enrollment
  const availableClasses = useMemo(() => {
    const defaultClasses = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
    const studentClasses = students.map(s => s.class).filter(Boolean) as string[];
    const combined = Array.from(new Set([...defaultClasses, ...studentClasses])).sort();
    return ['All', ...combined];
  }, [students]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingNotice(null);
    setFormState({
      title: '',
      content: '',
      category: 'General',
      targetClass: 'All',
      isImportant: false,
      isPinned: false
    });
    setEditorTab('write');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setFormState({
      title: notice.title || '',
      content: notice.content || '',
      category: notice.category || 'General',
      targetClass: notice.targetClass || 'All',
      isImportant: Boolean(notice.isImportant),
      isPinned: Boolean(notice.isPinned)
    });
    setEditorTab('write');
    setIsModalOpen(true);
  };

  // Quick insertion helpers for editor
  const insertText = (snippet: string) => {
    setFormState(prev => {
      const current = prev.content;
      // If current content doesn't end with newline, add one first
      const separator = current && !current.endsWith('\n') ? '\n' : '';
      return { ...prev, content: current + separator + snippet };
    });
  };

  // Save (Create or Update)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title.trim() || !formState.content.trim()) return;

    if (editingNotice) {
      // Update existing notice
      updateNotice({
        ...editingNotice,
        title: formState.title.trim(),
        content: formState.content.trim(),
        category: formState.category,
        targetClass: formState.targetClass,
        isImportant: formState.isImportant,
        isPinned: formState.isPinned
      });
      showExportToast('Notice updated successfully!');
    } else {
      // Add new notice
      addNotice({
        title: formState.title.trim(),
        content: formState.content.trim(),
        category: formState.category,
        targetClass: formState.targetClass,
        isImportant: formState.isImportant,
        isPinned: formState.isPinned
      });
      showExportToast('Notice published successfully!');
    }

    setIsModalOpen(false);
  };

  // Quick toggle pin status
  const handleTogglePin = (notice: Notice) => {
    updateNotice({
      ...notice,
      isPinned: !notice.isPinned
    });
    showExportToast(notice.isPinned ? 'Notice unpinned' : 'Notice pinned to top');
  };

  // Copy Formatted Notice Text
  const handleCopyNotice = (notice: Notice) => {
    const formattedText = `📢 *${notice.title.toUpperCase()}*\n📅 Date: ${safeFormat(notice.date, 'dd MMM yyyy, hh:mm a')}${notice.targetClass ? `\n👥 For: ${notice.targetClass}` : ''}\n\n${notice.content}\n\n— Brain Tutorial Home Bulletin`;
    navigator.clipboard.writeText(formattedText).then(() => {
      setCopiedId(notice.id);
      showExportToast('Formatted notice copied to clipboard!');
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  // Share to WhatsApp
  const handleShareWhatsApp = (notice: Notice) => {
    const text = `📢 *${notice.title.toUpperCase()}*\n📅 Date: ${safeFormat(notice.date, 'dd MMM yyyy, hh:mm a')}${notice.targetClass ? `\n👥 For: ${notice.targetClass}` : ''}\n\n${notice.content}\n\n— Brain Tutorial Home`;
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // Export PDF Notice
  const handleExportPdf = async (notice: Notice) => {
    setExportingPdfId(notice.id);
    try {
      await exportNoticeToPdf(notice);
      showExportToast('Official Notice PDF downloaded!');
    } catch (err: any) {
      console.error('PDF export failed:', err);
      showExportToast(err?.message || 'Failed to download PDF', false);
    } finally {
      setExportingPdfId(null);
    }
  };

  // Filtered & Sorted Notices
  const filteredNotices = useMemo(() => {
    return notices
      .filter(notice => {
        // Search query
        if (searchTerm) {
          const q = searchTerm.toLowerCase();
          const matchTitle = (notice.title || '').toLowerCase().includes(q);
          const matchContent = (notice.content || '').toLowerCase().includes(q);
          if (!matchTitle && !matchContent) return false;
        }

        // Category filter
        if (categoryFilter !== 'All') {
          if (categoryFilter === 'Urgent') {
            if (!notice.isImportant && notice.category !== 'Urgent') return false;
          } else if (notice.category !== categoryFilter) {
            return false;
          }
        }

        // Class filter
        if (classFilter !== 'All') {
          if (notice.targetClass && notice.targetClass !== 'All' && notice.targetClass !== classFilter) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // Pinned notices first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        // Then newest by date
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [notices, searchTerm, categoryFilter, classFilter]);

  // Key Metrics
  const totalCount = notices.length;
  const priorityCount = notices.filter(n => n.isImportant).length;
  const pinnedCount = notices.filter(n => n.isPinned).length;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner & Main Action */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/5 p-6 md:p-8 rounded-[36px] border border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-orange-500/20 text-orange-400 rounded-2xl shadow-lg border border-orange-500/20">
            <Megaphone size={30} />
          </div>
          <div>
            <h1 className="font-black text-2xl md:text-3xl text-white tracking-tight">Notice Board</h1>
            <p className="text-xs font-semibold text-slate-400 mt-1">
              Official circulars, student announcements, schedules, and administrative notifications
            </p>
          </div>
        </div>

        <button 
          id="post-new-notice-btn"
          onClick={handleOpenCreate}
          className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={18} />
          <span>Post New Notice</span>
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass p-4 rounded-2xl border border-white/5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Bell size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Notices</p>
            <p className="text-xl font-black text-white">{totalCount}</p>
          </div>
        </div>

        <div className="glass p-4 rounded-2xl border border-white/5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">High Priority</p>
            <p className="text-xl font-black text-rose-400">{priorityCount}</p>
          </div>
        </div>

        <div className="glass p-4 rounded-2xl border border-white/5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <Pin size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pinned</p>
            <p className="text-xl font-black text-amber-400">{pinnedCount}</p>
          </div>
        </div>

        <div className="glass p-4 rounded-2xl border border-white/5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Filter size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Showing</p>
            <p className="text-xl font-black text-emerald-400">{filteredNotices.length}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="glass p-5 rounded-3xl border border-white/5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notices by headline or content paragraphs..."
              className="input-glass w-full pl-11 pr-4 py-3 rounded-2xl text-xs font-semibold"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Class Filter Dropdown */}
          <div className="w-full md:w-56">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="input-glass w-full py-3 px-4 rounded-2xl text-xs font-bold cursor-pointer"
            >
              <option value="All" className="bg-slate-900">👥 All Target Classes</option>
              {availableClasses.filter(c => c !== 'All').map(c => (
                <option key={c} value={c} className="bg-slate-900">{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setCategoryFilter('All')}
            className={`px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider text-[10px] transition-all whitespace-nowrap ${
              categoryFilter === 'All'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            All Categories
          </button>
          {NOTICE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider text-[10px] transition-all whitespace-nowrap border ${
                categoryFilter === cat.id
                  ? 'bg-white/20 text-white border-white/30 shadow-md'
                  : 'bg-white/5 text-slate-400 border-white/5 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-6">
        {filteredNotices.map(notice => {
          const catInfo = NOTICE_CATEGORIES.find(c => c.id === notice.category) || NOTICE_CATEGORIES[0];
          return (
            <article 
              key={notice.id}
              className={`glass p-6 md:p-8 rounded-[32px] border relative transition-all duration-300 hover:border-white/20 ${
                notice.isPinned
                  ? 'border-amber-500/40 bg-gradient-to-r from-amber-500/5 to-transparent shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/20'
                  : notice.isImportant 
                  ? 'border-rose-500/30 bg-gradient-to-r from-rose-500/5 to-transparent' 
                  : 'border-white/5'
              }`}
            >
              {/* Header Badges & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-white/5">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Pinned Tag */}
                  {notice.isPinned && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Pin size={11} className="rotate-45" /> Pinned
                    </span>
                  )}

                  {/* Priority Tag */}
                  {notice.isImportant && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                      <AlertCircle size={11} /> High Priority
                    </span>
                  )}

                  {/* Category Badge */}
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${catInfo.color}`}>
                    {catInfo.label}
                  </span>

                  {/* Target Class */}
                  {notice.targetClass && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-slate-300 border border-white/10">
                      👥 {notice.targetClass === 'All' ? 'All Classes' : notice.targetClass}
                    </span>
                  )}
                </div>

                {/* Timestamps */}
                <div className="text-[11px] font-bold text-slate-400">
                  <span>{safeFormat(notice.date, 'MMM dd, yyyy • hh:mm a')}</span>
                  {notice.updatedAt && (
                    <span className="text-cyan-400/80 ml-2 italic">
                      (Edited {safeFormat(notice.updatedAt, 'MMM dd, hh:mm a')})
                    </span>
                  )}
                </div>
              </div>

              {/* Title / Headline */}
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight mb-4">
                {notice.title}
              </h2>

              {/* Paragraphs Arranged faithfully as provided */}
              <div className="mb-6 max-w-5xl">
                <FormattedNoticeContent content={notice.content} />
              </div>

              {/* Card Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/5">
                {/* Secondary Quick Share Options */}
                <div className="flex items-center gap-2">
                  {/* Copy Notice */}
                  <button
                    onClick={() => handleCopyNotice(notice)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all border border-white/5"
                    title="Copy formatted notice to clipboard"
                  >
                    {copiedId === notice.id ? (
                      <>
                        <Check size={14} className="text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>

                  {/* Share to WhatsApp */}
                  <button
                    onClick={() => handleShareWhatsApp(notice)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold transition-all border border-emerald-500/20"
                    title="Share notice text directly on WhatsApp"
                  >
                    <Send size={14} />
                    <span>WhatsApp</span>
                  </button>

                  {/* Download Official Notice PDF */}
                  <button
                    onClick={() => handleExportPdf(notice)}
                    disabled={exportingPdfId === notice.id}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold transition-all border border-cyan-500/20 disabled:opacity-50"
                    title="Generate official printable Notice PDF circular"
                  >
                    <FileText size={14} />
                    <span>{exportingPdfId === notice.id ? 'Exporting...' : 'Export PDF'}</span>
                  </button>
                </div>

                {/* Primary Admin Controls: Edit, Pin, Delete */}
                <div className="flex items-center gap-2">
                  {/* Pin / Unpin Button */}
                  <button
                    onClick={() => handleTogglePin(notice)}
                    className={`p-2 rounded-xl text-xs font-bold transition-all border ${
                      notice.isPinned
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
                        : 'bg-white/5 text-slate-400 border-white/5 hover:text-amber-300 hover:bg-white/10'
                    }`}
                    title={notice.isPinned ? 'Unpin from top' : 'Pin to top of bulletin'}
                  >
                    <Pin size={16} className={notice.isPinned ? 'rotate-45' : ''} />
                  </button>

                  {/* Edit Notice Button (Admin editable) */}
                  <button
                    id={`edit-notice-${notice.id}`}
                    onClick={() => handleOpenEdit(notice)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all"
                  >
                    <Pencil size={14} />
                    <span>Edit</span>
                  </button>

                  {/* Delete Notice Button */}
                  <button
                    onClick={() => setDeleteConfirmNotice(notice)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/5 hover:border-rose-500/30 transition-all"
                    title="Delete notice"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}

        {filteredNotices.length === 0 && (
          <div className="py-24 text-center glass rounded-[40px] border-2 border-dashed border-white/5">
            <Bell size={44} className="mx-auto mb-3 text-slate-700" />
            <p className="text-white font-bold text-base">No notices found</p>
            <p className="text-slate-500 text-xs mt-1">
              {searchTerm || categoryFilter !== 'All' || classFilter !== 'All' 
                ? 'Try adjusting your search or category filter criteria'
                : 'No announcements posted in the bulletin center yet'}
            </p>
            <button
              onClick={handleOpenCreate}
              className="mt-5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider"
            >
              Post First Notice
            </button>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[70] flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass rounded-[32px] shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/10 my-8">
            {/* Modal Header */}
            <div className="p-6 md:p-8 bg-gradient-to-r from-indigo-900/60 via-slate-900/90 to-slate-900 text-white flex justify-between items-center border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
                  {editingNotice ? <Pencil size={22} /> : <Megaphone size={22} />}
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase">
                    {editingNotice ? 'Edit Notice' : 'Post New Notice'}
                  </h2>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    {editingNotice ? 'Modify notice details and retain exact paragraph structure' : 'Create and publish an official notice for students and parents'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Notice Headline */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Notice Headline / Subject *
                </label>
                <input 
                  required
                  type="text" 
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  className="input-glass w-full py-3.5 px-4 rounded-2xl font-bold text-sm"
                  placeholder="e.g. Schedule of Term-1 Mathematics Examination"
                />
              </div>

              {/* Category & Target Class Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Category Tag
                  </label>
                  <select
                    value={formState.category}
                    onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                    className="input-glass w-full py-3 px-4 rounded-2xl text-xs font-bold cursor-pointer"
                  >
                    {NOTICE_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id} className="bg-slate-900">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Target Audience / Class
                  </label>
                  <select
                    value={formState.targetClass}
                    onChange={(e) => setFormState({ ...formState, targetClass: e.target.value })}
                    className="input-glass w-full py-3 px-4 rounded-2xl text-xs font-bold cursor-pointer"
                  >
                    <option value="All" className="bg-slate-900">All Students (Universal)</option>
                    {availableClasses.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c} className="bg-slate-900">{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Content Description with Dual Tabs (Write vs Live Preview) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Paragraph Content (Arranged same as provided) *
                  </label>
                  
                  {/* Editor Tab Toggle */}
                  <div className="flex items-center p-1 bg-white/5 rounded-xl border border-white/5 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setEditorTab('write')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        editorTab === 'write' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Write Editor
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorTab('preview')}
                      className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                        editorTab === 'preview' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Eye size={12} /> Live Preview
                    </button>
                  </div>
                </div>

                {/* Quick formatting toolbar */}
                {editorTab === 'write' && (
                  <div className="flex flex-wrap items-center gap-1.5 p-2 bg-white/5 rounded-xl border border-white/5 text-xs text-slate-300">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mr-1">Quick Tools:</span>
                    <button
                      type="button"
                      onClick={() => insertText('• ')}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-all text-xs font-semibold"
                    >
                      + Bullet (•)
                    </button>
                    <button
                      type="button"
                      onClick={() => insertText('1. ')}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-all text-xs font-semibold"
                    >
                      + Numbered (1.)
                    </button>
                    <button
                      type="button"
                      onClick={() => insertText('**Important note:** ')}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-all text-xs font-semibold"
                    >
                      **Bold text**
                    </button>
                    <button
                      type="button"
                      onClick={() => insertText(`[Date: ${safeFormat(new Date().toISOString(), 'dd MMM yyyy')}]`)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-all text-xs font-semibold"
                    >
                      + Today's Date
                    </button>
                    <button
                      type="button"
                      onClick={() => insertText('\n— Issued by Office Administration, Brain Tutorial Home')}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-all text-xs font-semibold"
                    >
                      + Signatory
                    </button>
                  </div>
                )}

                {/* Textarea for Write Mode */}
                {editorTab === 'write' ? (
                  <textarea 
                    required
                    rows={8}
                    value={formState.content}
                    onChange={(e) => setFormState({ ...formState, content: e.target.value })}
                    className="input-glass w-full p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap font-sans"
                    placeholder="Enter paragraphs here. Press Enter twice for separate paragraphs. Linebreaks and indentations will be preserved exactly as provided..."
                  />
                ) : (
                  /* Live Preview Tab */
                  <div className="p-5 rounded-2xl bg-black/40 border border-white/10 min-h-[220px]">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 mb-3 flex items-center gap-1.5">
                      <Sparkles size={12} /> Paragraph Layout Live Preview
                    </div>
                    {formState.content.trim() ? (
                      <FormattedNoticeContent content={formState.content} />
                    ) : (
                      <p className="text-slate-500 italic text-sm">No text entered yet. Switch to Write Editor to compose paragraphs.</p>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 px-1">
                  <span>Double Enter creates clean distinct paragraphs. Exact line spacing is preserved.</span>
                  <span>{formState.content.length} characters</span>
                </div>
              </div>

              {/* Toggles: High Priority & Pin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* High Priority Toggle */}
                <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-all">
                  <input 
                    type="checkbox" 
                    checked={formState.isImportant}
                    onChange={(e) => setFormState({ ...formState, isImportant: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500/30"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Mark as High Priority / Urgent</span>
                    <span className="text-[10px] text-slate-400">Highlights card with urgent badge</span>
                  </div>
                </label>

                {/* Pin to Top Toggle */}
                <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-all">
                  <input 
                    type="checkbox" 
                    checked={formState.isPinned}
                    onChange={(e) => setFormState({ ...formState, isPinned: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500/30"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Pin Notice to Top</span>
                    <span className="text-[10px] text-slate-400">Keeps notice at top of bulletin board</span>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-slate-300 font-black text-xs uppercase tracking-widest rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-2 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20"
                >
                  {editingNotice ? 'Save Changes' : 'Publish Notice Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmNotice && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
          <div className="glass p-6 md:p-8 rounded-3xl max-w-md w-full border border-rose-500/30 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 bg-rose-500/20 rounded-2xl">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Delete Notice?</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5 line-clamp-2 font-semibold">
              "{deleteConfirmNotice.title}"
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmNotice(null)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase rounded-xl transition-all"
              >
                Keep Notice
              </button>
              <button
                onClick={() => {
                  deleteNotice(deleteConfirmNotice.id);
                  setDeleteConfirmNotice(null);
                  showExportToast('Notice deleted');
                }}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase rounded-xl transition-all shadow-lg shadow-rose-600/20"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
