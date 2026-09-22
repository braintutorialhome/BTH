import React, { useState, useRef } from 'react';
import { 
  GraduationCap, Phone, Mail, MapPin, Building2, Award, 
  BookOpen, Sparkles, MessageSquare, CheckCircle2, Copy, Check, 
  ExternalLink, Calendar, Users, ShieldCheck, HeartHandshake,
  UploadCloud, ImagePlus, Trash2, Camera, FileSpreadsheet, Loader2, 
  AlertCircle, Compass, Target, Clock, Star, Send, Layers, Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStorage } from '../hooks/useStorage';

interface AboutUsViewProps {
  userRole?: 'admin' | 'student';
}

type TabType = 'overview' | 'academics' | 'methodology' | 'contact';

export default function AboutUsView({ userRole = 'student' }: AboutUsViewProps) {
  const { teacherPhoto, updateTeacherPhoto, removeTeacherPhoto, currentUser } = useStorage();
  const isAdmin = userRole === 'admin' || currentUser?.role === 'admin';

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Inquiry message generator
  const [inquiryTopic, setInquiryTopic] = useState('Admission Information');
  const [inquiryStudentName, setInquiryStudentName] = useState('');
  const [inquiryClass, setInquiryClass] = useState('Class 10');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Process image for highest quality representation & Google Sheets backend compatibility
  const processAndUploadFile = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadStatus('error');
      setStatusMessage('Please select a valid image file (PNG, JPG, WEBP).');
      setTimeout(() => setUploadStatus('idle'), 4000);
      return;
    }

    setIsProcessing(true);
    setUploadStatus('idle');

    const reader = new FileReader();
    reader.onerror = () => {
      setIsProcessing(false);
      setUploadStatus('error');
      setStatusMessage('Failed to read image file.');
      setTimeout(() => setUploadStatus('idle'), 4000);
    };

    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      const img = new Image();
      img.onerror = () => {
        setIsProcessing(false);
        setUploadStatus('error');
        setStatusMessage('Corrupted or invalid image format.');
        setTimeout(() => setUploadStatus('idle'), 4000);
      };

      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Target 4:5 vertical portrait aspect ratio at High Definition (640x800)
          const targetWidth = 640;
          const targetHeight = 800;
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          const sourceWidth = img.width;
          const sourceHeight = img.height;
          const targetRatio = 4 / 5;
          const currentRatio = sourceWidth / sourceHeight;

          let sX = 0, sY = 0, sW = sourceWidth, sH = sourceHeight;
          if (currentRatio > targetRatio) {
            // Wider image: crop left & right to center on subject
            sW = sourceHeight * targetRatio;
            sX = (sourceWidth - sW) / 2;
          } else {
            // Taller image: anchor slightly towards upper third (15%) to preserve face & head space
            sH = sourceWidth / targetRatio;
            sY = Math.max(0, (sourceHeight - sH) * 0.15);
          }

          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, sX, sY, sW, sH, 0, 0, targetWidth, targetHeight);
          }

          // Highest quality encoding capable: WebP (with JPEG fallback)
          let highQualityDataUrl = canvas.toDataURL('image/webp', 0.92);
          if (!highQualityDataUrl.startsWith('data:image/webp')) {
            highQualityDataUrl = canvas.toDataURL('image/jpeg', 0.90);
          }

          await updateTeacherPhoto(highQualityDataUrl);
          setUploadStatus('success');
          setStatusMessage('Picture saved in high quality & synced to Google Sheets!');
          setTimeout(() => setUploadStatus('idle'), 4000);
        } catch (err: any) {
          setUploadStatus('error');
          setStatusMessage(err?.message || 'Error processing image.');
          setTimeout(() => setUploadStatus('idle'), 4000);
        } finally {
          setIsProcessing(false);
        }
      };

      img.src = rawDataUrl;
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndUploadFile(file);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isAdmin) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAndUploadFile(file);
    }
  };

  const handleRemovePhoto = async () => {
    if (window.confirm('Are you sure you want to remove the teacher profile picture? You can upload a new one anytime.')) {
      setIsProcessing(true);
      await removeTeacherPhoto();
      setIsProcessing(false);
      setUploadStatus('success');
      setStatusMessage('Picture removed. Upload a new photo anytime.');
      setTimeout(() => setUploadStatus('idle'), 3500);
    }
  };

  // Construct quick WhatsApp inquiry URL
  const getWhatsAppInquiryUrl = () => {
    const studentInfo = inquiryStudentName.trim() ? ` for student ${inquiryStudentName.trim()} (${inquiryClass})` : ` (${inquiryClass})`;
    const text = `Hello Sir, I would like to inquire about ${inquiryTopic}${studentInfo} at Brain Tutorial Home.`;
    return `https://wa.me/919647046334?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 animate-in fade-in duration-300 w-full overflow-x-hidden">
      
      {/* Advanced Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl glass p-6 sm:p-10 border border-cyan-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-gradient-to-bl from-cyan-500/20 via-indigo-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-black uppercase tracking-widest">
              <Sparkles size={14} className="text-cyan-400" />
              <span>Institutional Profile & Faculty Overview</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Brain <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400">Tutorial Home</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
              Premier academic mentoring center directed by Sir Afiur Rahaman (M.Sc., B.Ed.). Dedicated to foundational mastery, disciplined examination practice, and individualized student care.
            </p>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/10">
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
            <p className="text-2xl sm:text-3xl font-black text-cyan-400">10+</p>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mt-0.5">Years of Mentorship</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
            <p className="text-2xl sm:text-3xl font-black text-indigo-400">M.Sc., B.Ed.</p>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mt-0.5">Qualification</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
            <p className="text-2xl sm:text-3xl font-black text-teal-400">Class 5–12</p>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mt-0.5">Comprehensive Streams</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
            <p className="text-2xl sm:text-3xl font-black text-amber-400">100%</p>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mt-0.5">Dedicated Student Care</p>
          </div>
        </div>
      </div>

      {/* Advanced Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-white/10">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 shrink-0 ${
            activeTab === 'overview'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-950/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <Award size={15} />
          <span>Faculty & Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('academics')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 shrink-0 ${
            activeTab === 'academics'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-lg shadow-indigo-950/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <BookOpen size={15} />
          <span>Academic Batches & Subjects</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('methodology')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 shrink-0 ${
            activeTab === 'methodology'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-lg shadow-teal-950/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <Layers size={15} />
          <span>Teaching Methodology</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 shrink-0 ${
            activeTab === 'contact'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-950/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <Phone size={15} />
          <span>Direct Inquiries & Location</span>
        </button>
      </div>

      {/* Tab 1: Faculty & Profile (with Teacher Photo upload/change/remove and details) */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="glass-card p-6 sm:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
              
              {/* Teacher Photo & Upload Field Container */}
              <div className="md:col-span-5 flex flex-col items-center">
                <input 
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {/* Picture Container / Upload Field */}
                <div className="relative group w-full max-w-[280px] sm:max-w-[320px]">
                  <div className="absolute -inset-1 bg-gradient-to-tr from-cyan-500/30 to-indigo-500/30 rounded-3xl blur-md opacity-60 group-hover:opacity-90 transition duration-500 pointer-events-none" />

                  {teacherPhoto ? (
                    <div className="relative rounded-3xl overflow-hidden border-2 border-cyan-500/40 shadow-2xl bg-slate-900 ring-4 ring-cyan-500/10 aspect-[4/5] flex items-center justify-center">
                      <img 
                        src={teacherPhoto} 
                        alt="Afiur Rahaman, M.Sc., B.Ed." 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center block rounded-3xl"
                      />

                      {isProcessing && (
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-cyan-300 z-20">
                          <Loader2 size={32} className="animate-spin text-cyan-400" />
                          <span className="text-xs font-bold uppercase tracking-wider">Syncing to Google Sheets...</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    isAdmin ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        className={`relative rounded-3xl border-2 border-dashed aspect-[4/5] p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 overflow-hidden ${
                          isDragging 
                            ? 'border-cyan-400 bg-cyan-500/20 scale-[1.02]' 
                            : 'border-cyan-500/30 bg-slate-900/80 hover:border-cyan-400/70 hover:bg-slate-900/95 shadow-2xl'
                        }`}
                      >
                        <div className="absolute -top-12 -right-12 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
                        
                        {isProcessing ? (
                          <div className="flex flex-col items-center gap-3 text-cyan-300">
                            <Loader2 size={36} className="animate-spin text-cyan-400" />
                            <div className="space-y-1">
                              <p className="text-xs font-black uppercase tracking-wider">Processing High Quality</p>
                              <p className="text-[11px] text-slate-400">Saving to Google Sheets...</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3.5 flex flex-col items-center">
                            <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/25 transition-all shadow-lg">
                              <ImagePlus size={30} />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-black text-white tracking-wide">
                                Upload Teacher Picture
                              </p>
                              <p className="text-xs text-slate-400 font-medium">
                                Drag & drop or <span className="text-cyan-400 font-bold underline">browse file</span>
                              </p>
                            </div>

                            <div className="pt-2 flex flex-col gap-1.5 w-full">
                              <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 text-[10px] font-extrabold uppercase tracking-wider border border-cyan-500/20">
                                <Sparkles size={11} /> Highest Quality WebP/HD
                              </span>
                              <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-500/20">
                                <FileSpreadsheet size={11} /> Google Sheet Backend
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative rounded-3xl border-2 border-white/10 aspect-[4/5] p-6 flex flex-col items-center justify-center text-center bg-slate-900/80 shadow-2xl space-y-4">
                        <div className="w-20 h-20 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-xl">
                          <GraduationCap size={40} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-base font-black text-white">Faculty Profile</p>
                          <p className="text-xs text-indigo-300 font-bold">Brain Tutorial Home</p>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* Admin Management Controls (Change / Remove / Status) */}
                {isAdmin && (
                  <div className="mt-4 w-full max-w-[280px] sm:max-w-[320px] flex flex-col items-center space-y-2">
                    {teacherPhoto ? (
                      <div className="flex items-center gap-2 w-full">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isProcessing}
                          className="flex-1 py-2 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        >
                          <Camera size={13} />
                          <span>Change</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          disabled={isProcessing}
                          className="py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 hover:border-rose-400 text-rose-300 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                          title="Remove teacher picture"
                        >
                          <Trash2 size={13} />
                          <span>Remove</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing}
                        className="w-full py-2.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
                      >
                        <UploadCloud size={14} />
                        <span>Select Picture to Upload</span>
                      </button>
                    )}

                    <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-400 pt-1">
                      <FileSpreadsheet size={12} className="text-emerald-400" />
                      <span>Backend: Google Sheet Sync</span>
                    </div>
                  </div>
                )}

                {/* Status Message */}
                <AnimatePresence>
                  {uploadStatus !== 'idle' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className={`mt-3 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border w-full max-w-[280px] sm:max-w-[320px] ${
                        uploadStatus === 'success' 
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' 
                          : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                      }`}
                    >
                      {uploadStatus === 'success' ? <CheckCircle2 size={14} className="shrink-0" /> : <AlertCircle size={14} className="shrink-0" />}
                      <span className="text-[11px] leading-tight">{statusMessage}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Credential Tag Below Photo */}
                <div className="mt-4 flex flex-col items-center text-center space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-black uppercase tracking-wider">
                    <ShieldCheck size={14} className="text-cyan-400" />
                    <span>Founder & Lead Educator</span>
                  </span>
                </div>
              </div>

              {/* Teacher Details & Information */}
              <div className="md:col-span-7 space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-wider mb-2">
                    <Award size={14} />
                    <span>Academic Director</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    Afiur Rahaman
                  </h2>
                  <div className="flex flex-wrap items-center gap-2.5 mt-2">
                    <span className="px-3.5 py-1 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-extrabold text-sm tracking-wide">
                      M.Sc., B.Ed.
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 size={13} /> Verified Faculty
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                  <p>
                    Sir <strong>Afiur Rahaman</strong> brings a distinguished academic pedigree combining a rigorous Master of Science (<strong>M.Sc.</strong>) with professional pedagogical training via a Bachelor of Education (<strong>B.Ed.</strong>).
                  </p>
                  <p>
                    As the founder of <strong>Brain Tutorial Home</strong>, he spearheads a teaching methodology focused on conceptual foundations, analytical logic, and personalized exam readiness. His coaching empowers students across West Bengal and CBSE boards to transition from memorizing formulas to genuinely mastering subjects.
                  </p>
                </div>

                {/* Key Qualifications Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                      <GraduationCap size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white">Master of Science (M.Sc.)</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Deep subject matter depth & scientific analytical mastery.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white">Bachelor of Education (B.Ed.)</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Modern educational psychology, syllabus planning, & instructional pedagogy.</p>
                    </div>
                  </div>
                </div>

                {/* Direct Contact Cards */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Official Contact & Communications
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Mobile 1 */}
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                          <Phone size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Primary Mobile</p>
                          <a href="tel:9647046334" className="text-sm font-extrabold text-white hover:text-cyan-300 transition-colors">
                            9647046334
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <a 
                          href="https://wa.me/919647046334" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold transition-all"
                          title="Chat on WhatsApp"
                        >
                          <MessageSquare size={13} />
                        </a>
                        <button 
                          type="button"
                          onClick={() => handleCopy('9647046334', 'm1')}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs transition-all"
                          title="Copy Number"
                        >
                          {copiedKey === 'm1' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </div>

                    {/* Mobile 2 */}
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                          <Phone size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Secondary Mobile</p>
                          <a href="tel:9800811416" className="text-sm font-extrabold text-white hover:text-indigo-300 transition-colors">
                            9800811416
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <a 
                          href="https://wa.me/919800811416" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold transition-all"
                          title="Chat on WhatsApp"
                        >
                          <MessageSquare size={13} />
                        </a>
                        <button 
                          type="button"
                          onClick={() => handleCopy('9800811416', 'm2')}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs transition-all"
                          title="Copy Number"
                        >
                          {copiedKey === 'm2' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Email & Location Card */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                        <Mail size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Official E-Mail</p>
                        <a href="mailto:afiurrahaman@gmail.com" className="text-sm font-extrabold text-white hover:text-purple-300 transition-colors break-all">
                          afiurrahaman@gmail.com
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <a 
                        href="mailto:afiurrahaman@gmail.com" 
                        className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-bold transition-all"
                        title="Send Email"
                      >
                        <ExternalLink size={13} />
                      </a>
                      <button 
                        type="button"
                        onClick={() => handleCopy('afiurrahaman@gmail.com', 'email')}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs transition-all"
                        title="Copy Email"
                      >
                        {copiedKey === 'email' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Academic Batches & Subjects */}
      {activeTab === 'academics' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="glass p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-wider mb-2">
                <Compass size={14} />
                <span>Class Offerings & Academic Curricula</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Structured Batches & Programs
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Carefully segmented cohorts designed to maximize comprehension, regular assessments, and board examination preparedness.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Secondary Batch */}
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-cyan-500/20 hover:border-cyan-500/40 transition-all space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 font-extrabold text-xs uppercase tracking-wider border border-cyan-500/30">
                    Secondary Foundation
                  </span>
                  <span className="text-xs font-bold text-slate-400">Class 5 to 10</span>
                </div>
                <h3 className="text-xl font-black text-white">Madhyamik & Board Foundation</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Focusing on core conceptual building blocks in First Language (Bengali), Second Language (English), Mathematics, Physical Science, Life Science, History, and Geography. Thorough coverage of board syllabi with step-by-step problem walkthroughs.
                </p>
                <div className="pt-2 border-t border-white/5 flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 text-xs font-bold">First Language (Bengali)</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 text-xs font-bold">Second Language (English)</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 text-xs font-bold">Mathematics</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 text-xs font-bold">Physical Science</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 text-xs font-bold">Life Science</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 text-xs font-bold">History</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 text-xs font-bold">Geography</span>
                </div>
              </div>

              {/* Higher Secondary Batch */}
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-indigo-500/20 hover:border-indigo-500/40 transition-all space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 font-extrabold text-xs uppercase tracking-wider border border-indigo-500/30">
                    Higher Secondary
                  </span>
                  <span className="text-xs font-bold text-slate-400">Class 11 & 12</span>
                </div>
                <h3 className="text-xl font-black text-white">Board & Competitive Focus</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Comprehensive curriculum across Science and Arts streams, conceptual clarity, formula derivations, dedicated notes, and test series designed for high scores in HS board exams and competitive screenings.
                </p>
                <div className="pt-2 border-t border-white/5 flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 text-xs font-bold">Science</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 text-xs font-bold">Arts</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 text-xs font-bold">Mock Exams</span>
                </div>
              </div>
            </div>

            {/* Academic Features List */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-cyan-400 font-black text-sm">
                  <Clock size={16} />
                  <span>Flexible Timings</span>
                </div>
                <p className="text-xs text-slate-400">Morning and evening batches scheduled to prevent overlap with regular school hours.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-400 font-black text-sm">
                  <Target size={16} />
                  <span>Chapter-Wise Mock Exams</span>
                </div>
                <p className="text-xs text-slate-400">Periodic assessments with marks logged directly in this portal for student review.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                  <CheckCircle2 size={16} />
                  <span>Curated Study Material</span>
                </div>
                <p className="text-xs text-slate-400">Formula sheets, chapter summaries, and question banks accessible online 24/7.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Teaching Methodology & Digital Edge */}
      {activeTab === 'methodology' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="glass p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-black uppercase tracking-wider mb-2">
                <Layers size={14} />
                <span>Pedagogy & Digital Innovation</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                The Brain Tutorial Home Philosophy
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Combining classic disciplined chalk-and-board instruction with cutting-edge digital tracking.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Target size={24} />
                </div>
                <h3 className="text-lg font-black text-white">1. Conceptual First</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  We eliminate rote memorization. Every theorem, formula, and law is broken down into intuitive foundational concepts so students can tackle novel questions independently.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Calendar size={24} />
                </div>
                <h3 className="text-lg font-black text-white">2. Continuous Diagnostic Tests</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Regular weekly and monthly unit exams evaluate learning progression. Weak areas are flagged immediately with constructive feedback and remedial guidance.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  <HeartHandshake size={24} />
                </div>
                <h3 className="text-lg font-black text-white">3. Parent Collaboration</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Complete transparency with parents regarding attendance records, fees, and test performance via direct WhatsApp connectivity and periodic consultations.
                </p>
              </div>
            </div>

            {/* Portal Integration Features */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-slate-900 border border-cyan-500/20 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">Integrated Digital Ecosystem</h4>
                  <p className="text-xs text-slate-400">All students of Brain Tutorial Home enjoy secure login access to this dedicated portal.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                  <p className="text-xs font-black text-white">Digital Attendance</p>
                  <p className="text-[10px] text-slate-400">Tracked & recorded</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                  <p className="text-xs font-black text-white">Online Test Results</p>
                  <p className="text-[10px] text-slate-400">Instant score tracking</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                  <p className="text-xs font-black text-white">PDF Study Material</p>
                  <p className="text-[10px] text-slate-400">Curated question banks</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                  <p className="text-xs font-black text-white">Due Fee Transparency</p>
                  <p className="text-[10px] text-slate-400">Clean ledger history</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Direct Inquiries & Interactive Location */}
      {activeTab === 'contact' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Interactive WhatsApp Message Builder */}
            <div className="lg:col-span-6 glass p-6 sm:p-8 rounded-3xl border border-white/10 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider">
                  <MessageSquare size={14} />
                  <span>Instant WhatsApp Inquiry Builder</span>
                </div>
                <h3 className="text-2xl font-black text-white">Connect with Sir Afiur Rahaman</h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Select your inquiry topic below to instantly open WhatsApp with a formatted message sent directly to the teacher.
                </p>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                      Inquiry Topic
                    </label>
                    <select
                      value={inquiryTopic}
                      onChange={(e) => setInquiryTopic(e.target.value)}
                      className="w-full bg-slate-900/90 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Admission Information">Admission Information & Batch Availability</option>
                      <option value="Doubt Clearing & Guidance">Doubt Clearing & Personal Guidance</option>
                      <option value="Class Schedule & Timings">Class Schedule & Timings</option>
                      <option value="Fee Structure & Monthly Dues">Fee Structure & Monthly Dues</option>
                      <option value="Parent Teacher Consultation">Parent-Teacher Consultation Request</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                        Student Class
                      </label>
                      <select
                        value={inquiryClass}
                        onChange={(e) => setInquiryClass(e.target.value)}
                        className="w-full bg-slate-900/90 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                      >
                        <option value="Class 5">Class 5</option>
                        <option value="Class 6">Class 6</option>
                        <option value="Class 7">Class 7</option>
                        <option value="Class 8">Class 8</option>
                        <option value="Class 9">Class 9</option>
                        <option value="Class 10">Class 10 (Madhyamik)</option>
                        <option value="Class 11">Class 11 (Science)</option>
                        <option value="Class 12">Class 12 (Higher Secondary)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                        Student Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sen"
                        value={inquiryStudentName}
                        onChange={(e) => setInquiryStudentName(e.target.value)}
                        className="w-full bg-slate-900/90 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-3">
                <a
                  href={getWhatsAppInquiryUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-950/40 hover:scale-[1.02] active:scale-95"
                >
                  <MessageSquare size={16} />
                  <span>Send Message on WhatsApp</span>
                </a>
                <p className="text-[11px] text-center text-slate-500 font-bold">
                  Direct Line: +91 9647046334 (Mon–Sun, 8 AM – 8 PM)
                </p>
              </div>
            </div>

            {/* Location & Navigation Card */}
            <div className="lg:col-span-6 glass p-6 sm:p-8 rounded-3xl border border-white/10 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-wider">
                  <MapPin size={14} />
                  <span>Center Address & Navigation</span>
                </div>
                <h3 className="text-2xl font-black text-white">Brain Tutorial Home Campus</h3>
                
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Official Center Location</p>
                  <p className="text-base font-bold text-slate-100">
                    Nangla, Satbhaiya, Kashipur, West Bengal
                  </p>
                  <p className="text-xs font-semibold text-cyan-300">
                    PIN Code: 700135
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Conveniently situated in Kashipur, easily accessible for students traveling from surrounding local villages and towns.
                </p>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-xs text-slate-400 font-bold">Landmark & Area</span>
                    <span className="text-xs text-white font-black">Near Satbhaiya, Nangla</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-xs text-slate-400 font-bold">Operating Days</span>
                    <span className="text-xs text-white font-black">Monday to Sunday</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Nangla+Satbhaiya+Kashipur+West+Bengal+700135"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                >
                  <Navigation size={14} />
                  <span>Open in Google Maps</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleCopy('Nangla, Satbhaiya, Kashipur, West Bengal – 700135', 'address')}
                  className="py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                >
                  {copiedKey === 'address' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedKey === 'address' ? 'Copied' : 'Copy Address'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
