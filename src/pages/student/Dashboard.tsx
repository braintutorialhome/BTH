import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BarChart2, User, CreditCard, BookMarked, Bell, LogOut, Menu, X, ArrowRight, Phone, MessageSquare, Compass, AlertCircle, ExternalLink, FileCheck
} from 'lucide-react';
import { useStorage } from '../../hooks/useStorage';
import { motion, AnimatePresence } from 'motion/react';
import StudentHome from './views/Home';
import StudentProfile from './views/Profile';
import StudentFees from './views/Fees';
import StudentTestMaster from './views/TestMaster';
import StudentResults from './views/Results';
import StudentMaterials from './views/Materials';
import StudentNotices from './views/Notices';
import StudentDueFees from '../../components/student/StudentDueFees';

const NavItem = ({ to, icon: Icon, label, active, onClick }: any) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all font-bold text-sm tracking-tight relative group ${
      active 
        ? 'text-white' 
        : 'text-slate-500 hover:text-white'
    }`}
  >
    {active && (
      <motion.div 
        layoutId="student-nav-active"
        className="absolute inset-0 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/20"
        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
      />
    )}
    <Icon size={18} className={`relative z-10 transition-transform group-hover:scale-110 ${active ? 'text-white' : 'text-slate-600 group-hover:text-indigo-400'}`} />
    <span className="relative z-10">{label}</span>
  </Link>
);

export default function StudentDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { students, logout, currentUser } = useStorage();
  
  const currentStudent = students.find(s => 
    s.status === 'approved' && 
    (s.rollNumber === currentUser?.username || s.id === currentUser?.id || s.name === currentUser?.name)
  );

  useEffect(() => {
    if (!currentUser && !currentStudent) {
      navigate('/login');
    }
  }, [currentUser, currentStudent, navigate]);

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentStudent) {
    return (
      <div className="min-h-screen text-slate-300 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-indigo-500/10 rounded-[40px] flex items-center justify-center mb-8 relative group">
           <Compass className="text-indigo-500 group-hover:rotate-180 transition-transform duration-1000" size={40} />
           <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-4">Admissions Pending</h1>
        <p className="max-w-md text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] leading-relaxed mb-10">
          Your node is currently in a "Pre-Approval" state. Please wait for an administrator to authorize your registry.
        </p>
        <button 
          onClick={handleLogout}
          className="px-10 py-5 bg-white/5 border border-white/10 rounded-3xl font-black text-[10px] uppercase tracking-[0.4em] text-white hover:bg-white/10 transition-all flex items-center gap-3"
        >
          <LogOut size={16} /> Close Connection
        </button>
      </div>
    );
  }

  const navItems = [
    { to: '/student/dashboard', icon: BarChart2, label: 'Dashboard' },
    { to: '/student/profile', icon: User, label: 'Profile' },
    { to: '/student/fees', icon: CreditCard, label: 'Fees Status' },
    { to: '/student/due-fees', icon: AlertCircle, label: 'Due Fees' },
    { to: '/student/test-master', icon: ExternalLink, label: 'Exam Portal' },
    { to: '/student/results', icon: FileCheck, label: 'Results' },
    { to: '/student/materials', icon: BookMarked, label: 'Study Material' },
    { to: '/student/notices', icon: Bell, label: 'Notice' },
  ];

  return (
    <div className="min-h-screen text-slate-300 flex overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background radial highlight */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Sidebar overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-80 glass border-r border-white/5 transform transition-transform duration-500 lg:translate-x-0 lg:static flex-shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 h-full flex flex-col relative z-10">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30 rotate-3">
                <Compass className="text-white" size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black leading-tight uppercase tracking-widest text-white">Brain Tutorial Home</span>
                <span className="text-xs text-slate-500 font-black uppercase tracking-widest mt-0.5">Student</span>
              </div>
            </div>
            <button className="lg:hidden p-2 text-slate-500 hover:text-white transition-colors" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="mb-10 p-6 glass rounded-3xl border border-white/5 flex items-center gap-4 group">
             <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-xl group-hover:-rotate-6 transition-transform overflow-hidden">
               {currentStudent.avatarUrl ? (
                 <img 
                   src={currentStudent.avatarUrl} 
                   alt={currentStudent.name} 
                   referrerPolicy="no-referrer"
                   className="w-full h-full object-cover rounded-2xl" 
                 />
               ) : (
                 currentStudent.name.charAt(0)
               )}
             </div>
             <div className="truncate">
               <p className="font-black text-white truncate group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{currentStudent.name}</p>
               <p className="text-xs font-black uppercase tracking-widest text-slate-600 mt-1">{currentStudent.rollNumber}</p>
             </div>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
            {navItems.map(item => (
              <NavItem 
                key={item.to} 
                {...item} 
                active={location.pathname === item.to}
                onClick={() => setIsSidebarOpen(false)}
              />
            ))}
          </nav>

          <div className="mt-8 pt-8 border-t border-white/5 space-y-4 mb-6">
             <a href="tel:+919647046334" className="flex items-center gap-4 px-6 py-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
               <Phone size={16} className="text-indigo-500" /> Admin Support
             </a>
             <a href="https://wa.me/919647046334" className="flex items-center gap-4 px-6 py-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-emerald-400 transition-colors">
               <MessageSquare size={16} className="text-emerald-500" /> Instant Chat
             </a>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 hover:text-rose-400"
          >
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col relative z-10">
        <header className="sticky top-0 z-30 glass border-b border-white/5 lg:hidden px-6 h-20 flex items-center justify-between">
          <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-white/5 rounded-2xl text-slate-300">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <Compass className="text-indigo-500" size={24} />
            <span className="font-black text-white uppercase tracking-widest text-xl">Brain Tutorial Home</span>
          </div>
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center font-black overflow-hidden">
            {currentStudent.avatarUrl ? (
              <img 
                src={currentStudent.avatarUrl} 
                alt={currentStudent.name} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-2xl" 
              />
            ) : (
              currentStudent.name.charAt(0)
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar">
          <AnimatePresence mode="wait">
             <motion.div
               key={location.pathname}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.3 }}
             >
                <Routes>
                  <Route path="dashboard" element={<StudentHome student={currentStudent} />} />
                  <Route path="profile" element={<StudentProfile student={currentStudent} />} />
                  <Route path="fees" element={<StudentFees student={currentStudent} />} />
                  <Route path="due-fees" element={<StudentDueFees />} />
                  <Route path="test-master" element={<StudentTestMaster />} />
                  <Route path="results" element={<StudentResults />} />
                  <Route path="materials" element={<StudentMaterials />} />
                  <Route path="notices" element={<StudentNotices student={currentStudent} />} />
                  <Route path="/" element={<StudentHome student={currentStudent} />} />
                </Routes>
             </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.05) transparent; }
      `}</style>
    </div>
  );
}
