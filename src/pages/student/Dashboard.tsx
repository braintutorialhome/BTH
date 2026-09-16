import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BarChart2, User, CreditCard, BookMarked, Bell, LogOut, Menu, X, ArrowRight, Phone, MessageSquare, Compass, AlertCircle, ExternalLink, FileCheck, Eye, CalendarX, MessageSquareQuote
} from 'lucide-react';
import { useStorage } from '../../hooks/useStorage';
import { motion, AnimatePresence } from 'motion/react';
import StudentHome from './views/Home';
import StudentOverview from './views/StudentOverview';
import StudentProfile from './views/Profile';
import StudentFees from './views/Fees';
import StudentAttendance from './views/Attendance';
import StudentTestMaster from './views/TestMaster';
import StudentResults from './views/Results';
import StudentMaterials from './views/Materials';
import StudentNotices from './views/Notices';
import StudentDueFees from '../../components/student/StudentDueFees';
import StudentRemarks from './views/Remarks';

interface NavGroup {
  title: string;
  items: {
    to: string;
    icon: any;
    label: string;
    badge?: string | number;
    badgeColor?: string;
  }[];
}

const NavItem = ({ to, icon: Icon, label, active, onClick, badge, badgeColor }: any) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all font-bold text-xs tracking-tight relative group ${
      active 
        ? 'text-white' 
        : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
    }`}
  >
    {active && (
      <motion.div 
        layoutId="student-nav-active"
        className="absolute inset-0 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/25"
        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
      />
    )}
    <div className="flex items-center gap-3 relative z-10 min-w-0">
      <Icon size={17} className={`relative z-10 transition-transform group-hover:scale-110 shrink-0 ${active ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`} />
      <span className="relative z-10 truncate">{label}</span>
    </div>
    {badge !== undefined && badge !== null && (
      <span className={`relative z-10 text-[10px] font-black px-2 py-0.5 rounded-full ${
        badgeColor || (active ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-300')
      }`}>
        {badge}
      </span>
    )}
  </Link>
);

export default function StudentDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { 
    students = [], 
    logout, 
    currentUser, 
    notices = [], 
    dueFees = [], 
    attendance = [], 
    remarks = [], 
    materials = [], 
    externalTests = [] 
  } = useStorage();
  
  const currentStudent = students.find(s => 
    s.status === 'approved' && 
    (s.rollNumber === currentUser?.username || s.id === currentUser?.id || s.name === currentUser?.name)
  );

  // Dynamic badges for student sidebar
  const myDuesCount = dueFees.filter(df => df.studentId === currentStudent?.id).length;
  const myAbsentCount = attendance.filter(a => 
    (a.studentId === currentStudent?.id || (currentStudent?.rollNumber && a.studentId === currentStudent.rollNumber)) &&
    a.status === 'absent'
  ).length;
  const myRemarksCount = remarks.filter(r => 
    r.studentId === currentStudent?.id || (currentStudent?.rollNumber && r.studentId === currentStudent.rollNumber)
  ).length;
  const myNoticesCount = notices.filter(n => {
    if (n.targetClass && n.targetClass !== 'All' && currentStudent?.class) {
      return n.targetClass.toLowerCase() === currentStudent.class.toLowerCase();
    }
    return true;
  }).length;

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

  const navGroups: NavGroup[] = [
    {
      title: 'Main Hub',
      items: [
        { to: '/student/dashboard', icon: BarChart2, label: 'Dashboard' },
        { to: '/student/overview', icon: Eye, label: 'My Overview' },
        { to: '/student/profile', icon: User, label: 'My Profile' }
      ]
    },
    {
      title: 'Fees & Accounts',
      items: [
        { to: '/student/fees', icon: CreditCard, label: 'Fees Status' },
        { to: '/student/due-fees', icon: AlertCircle, label: 'Due Fees', badge: myDuesCount > 0 ? myDuesCount : undefined, badgeColor: 'bg-rose-500 text-white animate-pulse' }
      ]
    },
    {
      title: 'Academics & Tests',
      items: [
        { to: '/student/test-master', icon: ExternalLink, label: 'Exam Portal', badge: externalTests.length > 0 ? externalTests.length : undefined, badgeColor: 'bg-amber-500/20 text-amber-300' },
        { to: '/student/results', icon: FileCheck, label: 'Exam Results' },
        { to: '/student/materials', icon: BookMarked, label: 'Study Materials', badge: materials.length > 0 ? materials.length : undefined, badgeColor: 'bg-cyan-500/20 text-cyan-300' },
        { to: '/student/attendance', icon: CalendarX, label: 'Attendance', badge: myAbsentCount > 0 ? `${myAbsentCount} Abs` : undefined, badgeColor: 'bg-rose-500/20 text-rose-300' }
      ]
    },
    {
      title: 'Communication',
      items: [
        { to: '/student/remarks', icon: MessageSquareQuote, label: 'Remarks & Notes', badge: myRemarksCount > 0 ? myRemarksCount : undefined, badgeColor: 'bg-purple-500/20 text-purple-300' },
        { to: '/student/notices', icon: Bell, label: 'Notices Board', badge: myNoticesCount > 0 ? myNoticesCount : undefined, badgeColor: 'bg-indigo-500/20 text-indigo-300' }
      ]
    }
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

          <nav className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-1">
            {navGroups.map((group, groupIdx) => (
              <div key={group.title || groupIdx} className="space-y-1.5">
                <div className="px-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    {group.title}
                  </p>
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <NavItem 
                      key={item.to} 
                      {...item} 
                      active={location.pathname === item.to}
                      onClick={() => setIsSidebarOpen(false)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-6 pt-6 border-t border-white/5 space-y-2.5 mb-4">
             <a 
               href="tel:+919647046334" 
               className="group flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/[0.02] hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 transition-all duration-300 shadow-sm"
             >
               <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 group-hover:bg-cyan-500/20 transition-all">
                 <Phone size={13} className="text-cyan-400" />
               </div>
               <span className="font-['Space_Grotesk'] font-bold text-[11px] uppercase tracking-[0.16em] text-slate-300 group-hover:text-white transition-colors">
                 Help Desk
               </span>
             </a>
             <a 
               href="https://wa.me/919647046334" 
               target="_blank"
               rel="noopener noreferrer"
               className="group flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/[0.02] hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 transition-all duration-300 shadow-sm"
             >
               <div className="flex items-center gap-3">
                 <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 group-hover:bg-emerald-500/20 transition-all">
                   <MessageSquare size={13} className="text-emerald-400" />
                 </div>
                 <span className="font-['Space_Grotesk'] font-bold text-[11px] uppercase tracking-[0.16em] text-slate-300 group-hover:text-emerald-300 transition-colors">
                   Instant Chat
                 </span>
               </div>
               <span className="flex h-2 w-2 relative">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </span>
             </a>
          </div>

          <button 
            onClick={handleLogout}
            className="group flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-rose-500/[0.06] hover:bg-rose-500/15 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 hover:text-rose-300 shadow-md shadow-rose-950/20 transition-all duration-300 active:scale-[0.98] w-full"
          >
            <LogOut size={15} className="text-rose-400 group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-['Space_Grotesk'] font-extrabold text-[11px] uppercase tracking-[0.2em] text-rose-400 group-hover:text-rose-300 transition-colors">
              Log Out
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col relative z-10">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 glass border-b border-white/5 lg:hidden px-6 h-20 flex items-center justify-between">
          <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-white/5 rounded-2xl text-slate-300">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <Compass className="text-indigo-500" size={24} />
            <span className="font-black text-white uppercase tracking-widest text-lg sm:text-xl">Brain Tutorial Home</span>
          </div>
          <Link to="/student/profile" className="w-11 h-11 bg-white/5 rounded-2xl flex items-center justify-center font-black overflow-hidden border border-white/10">
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
          </Link>
        </header>

        {/* Desktop Top Sub-Bar */}
        <div className="hidden lg:flex items-center justify-between px-12 py-5 border-b border-white/5 glass sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Student Portal</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              {location.pathname.replace('/student/', '').replace('/', '') || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              to="/student/notices" 
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-all border border-white/5"
            >
              <Bell size={14} className="text-indigo-400" />
              <span>Notices</span>
              {myNoticesCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              )}
            </Link>

            <Link 
              to="/student/overview" 
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-all border border-white/5"
            >
              <Eye size={14} className="text-cyan-400" />
              <span>My Overview</span>
            </Link>

            <div className="h-4 w-[1px] bg-white/10" />

            <Link 
              to="/student/profile" 
              className="flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5"
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center overflow-hidden">
                {currentStudent.avatarUrl ? (
                  <img src={currentStudent.avatarUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  currentStudent.name.charAt(0)
                )}
              </div>
              <span className="text-xs font-bold text-white">{currentStudent.name.split(' ')[0]}</span>
            </Link>
          </div>
        </div>

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
                  <Route path="overview" element={<StudentOverview student={currentStudent} />} />
                  <Route path="student-overview" element={<StudentOverview student={currentStudent} />} />
                  <Route path="profile" element={<StudentProfile student={currentStudent} />} />
                  <Route path="fees" element={<StudentFees student={currentStudent} />} />
                  <Route path="due-fees" element={<StudentDueFees />} />
                  <Route path="attendance" element={<StudentAttendance student={currentStudent} />} />
                  <Route path="test-master" element={<StudentTestMaster />} />
                  <Route path="results" element={<StudentResults />} />
                  <Route path="materials" element={<StudentMaterials />} />
                  <Route path="remarks" element={<StudentRemarks student={currentStudent} />} />
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
