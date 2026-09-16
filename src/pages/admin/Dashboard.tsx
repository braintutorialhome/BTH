import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BarChart2, Users, FileCheck, CreditCard, Wallet, Calendar, BookMarked, Bell, LogOut, Menu, X, Plus, Trash2, Edit2, TrendingUp, TrendingDown, DollarSign, Settings, AlertCircle, ExternalLink, Eye, MessageSquareQuote
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStorage } from '../../hooks/useStorage';
import AdminHome from './views/Home';
import StudentManagement from './views/Students';
import AdmissionManagement from './views/Admissions';
import FeeManagement from './views/Fees';
import ExpenseManagement from './views/Expenses';
import AccountManagement from './views/Accounts';
import SystemSettings from './views/Settings';
import AttendanceManagement from './views/Attendance';
import AdminTestMaster from './views/TestMaster';
import AdminResults from './views/Results';
import StudyMaterialManagement from './views/Materials';
import NoticeManagement from './views/Notices';
import AdminDueFees from '../../components/admin/AdminDueFees';
import StudentFeeTracker from './views/StudentFeeTracker';
import StudentOverview from './views/StudentOverview';
import StudentRemarksManagement from './views/StudentRemarks';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  badge?: string | number;
  badgeColor?: string;
  active?: boolean;
  onClick?: () => void;
  key?: string;
}

interface NavGroup {
  title: string;
  items: Omit<NavItemProps, 'active' | 'onClick'>[];
}

const NavItem = ({ to, icon: Icon, label, active, onClick, badge, badgeColor }: NavItemProps) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center justify-between px-4 py-2.5 rounded-2xl transition-all font-bold text-xs tracking-tight relative group ${
      active 
        ? 'text-white' 
        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
    }`}
  >
    {active && (
      <motion.div 
        layoutId="admin-nav-active"
        className="absolute inset-0 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/30 border border-indigo-400/20"
        transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
      />
    )}
    <div className="flex items-center gap-3 relative z-10 min-w-0">
      <Icon size={16} className={`relative z-10 transition-transform group-hover:scale-110 shrink-0 ${active ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`} />
      <span className="relative z-10 truncate">{label}</span>
    </div>
    {badge !== undefined && badge !== null && (
      <span className={`relative z-10 text-[9px] font-black px-2 py-0.5 rounded-full ${
        badgeColor || (active ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-300')
      }`}>
        {badge}
      </span>
    )}
  </Link>
);

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    logout, 
    currentUser, 
    syncError, 
    isInitialSyncing, 
    refreshCloudData, 
    scriptUrl,
    students,
    dueFees,
    notices,
    materials,
    externalTests
  } = useStorage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const kolkataTime = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(currentTime);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const pendingAdmissions = students.filter(s => s.status === 'pending').length;
  const duesCount = dueFees.length;
  const noticesCount = notices.length;
  const materialsCount = materials.length;
  const externalTestsCount = externalTests.length;

  const navGroups: NavGroup[] = [
    {
      title: 'Main Hub',
      items: [
        { to: '/admin/dashboard', icon: BarChart2, label: 'Dashboard' },
        { to: '/admin/student-fee-tracker', icon: Users, label: 'Student Fee Tracker' },
        { to: '/admin/student-overview', icon: Eye, label: 'Student Overview' },
        { to: '/admin/students', icon: Users, label: 'Students' },
        { 
          to: '/admin/admissions', 
          icon: FileCheck, 
          label: 'Admissions',
          badge: pendingAdmissions > 0 ? pendingAdmissions : undefined,
          badgeColor: 'bg-amber-500 text-slate-950 font-black'
        }
      ]
    },
    {
      title: 'Fees & Accounts',
      items: [
        { to: '/admin/fees', icon: CreditCard, label: 'Fees & Collections' },
        { 
          to: '/admin/due-fees', 
          icon: AlertCircle, 
          label: 'Due Fees',
          badge: duesCount > 0 ? duesCount : undefined,
          badgeColor: 'bg-rose-500 text-white animate-pulse'
        },
        { to: '/admin/expenses', icon: Wallet, label: 'Expenses' },
        { to: '/admin/accounts', icon: DollarSign, label: 'Accounts' }
      ]
    },
    {
      title: 'Academics & Tests',
      items: [
        { 
          to: '/admin/test-master', 
          icon: ExternalLink, 
          label: 'Exam Portal',
          badge: externalTestsCount > 0 ? externalTestsCount : undefined,
          badgeColor: 'bg-amber-500/20 text-amber-300'
        },
        { to: '/admin/results', icon: FileCheck, label: 'Exam Results' },
        { 
          to: '/admin/materials', 
          icon: BookMarked, 
          label: 'Study Materials',
          badge: materialsCount > 0 ? materialsCount : undefined,
          badgeColor: 'bg-cyan-500/20 text-cyan-300'
        },
        { to: '/admin/attendance', icon: Calendar, label: 'Attendance' }
      ]
    },
    {
      title: 'Communication',
      items: [
        { to: '/admin/student-remarks', icon: MessageSquareQuote, label: 'Student Remarks' },
        { 
          to: '/admin/notices', 
          icon: Bell, 
          label: 'Notices Board',
          badge: noticesCount > 0 ? noticesCount : undefined,
          badgeColor: 'bg-indigo-500/20 text-indigo-300'
        }
      ]
    },
    {
      title: 'System & Settings',
      items: [
        { to: '/admin/settings', icon: Settings, label: 'Settings' }
      ]
    }
  ];

  const viewNames: Record<string, string> = {
    '/admin/dashboard': 'System Dashboard',
    '/admin/student-fee-tracker': 'Student Fee Tracker',
    '/admin/student-overview': 'Student Overview (Read-Only)',
    '/admin/admissions': 'Admission Panel',
    '/admin/students': 'Students',
    '/admin/fees': 'Fees & Collections',
    '/admin/expenses': 'Expense Tracker',
    '/admin/accounts': 'Institutional Accounts',
    '/admin/attendance': 'Attendance System',
    '/admin/settings': 'Settings',
    '/admin/test-master': 'Exam Portal (External)',
    '/admin/results': 'Result Management',
    '/admin/materials': 'Study Materials',
    '/admin/due-fees': 'Due Fees Management',
    '/admin/student-remarks': 'Student Remarks',
    '/admin/notices': 'Notice Board',
  };

  return (
    <div className="min-h-screen bg-transparent flex font-sans overflow-hidden">
      {/* Sidebar overlay for mobile */}
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

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-80 h-full bg-slate-900/60 backdrop-blur-3xl border-r border-white/10 flex flex-col p-6 transform transition-transform duration-300 lg:translate-x-0 lg:static flex-shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-600/30 shrink-0">
              <span className="text-white tracking-tighter">BTH</span>
            </div>
            <div className="truncate">
              <h1 className="text-sm font-black leading-tight uppercase tracking-widest text-white truncate">Brain Tutorial Home</h1>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] truncate">Admin Portal</p>
            </div>
            <button className="ml-auto lg:hidden text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </button>
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

          <div className="mt-6 pt-5 border-t border-white/5 space-y-3">
             <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-0.5">Admin Support</p>
                <p className="text-xs text-slate-400 font-medium">+91 9647046334</p>
             </div>
             <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-rose-500/[0.08] hover:bg-rose-500/15 border border-rose-500/20 text-rose-400 hover:text-rose-300 font-bold text-xs uppercase tracking-widest transition-all"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-8 bg-slate-950/20 backdrop-blur-md">
           <div className="flex items-center gap-4">
             <button className="lg:hidden p-2 bg-white/5 rounded-xl border border-white/10 text-white" onClick={() => setIsSidebarOpen(true)}>
               <Menu size={24} />
             </button>
             <div>
               <h2 className="text-2xl font-black text-white tracking-tight leading-none mb-1">
                 {viewNames[location.pathname] || 'Admin Panel'}
               </h2>
               <div className="flex items-center gap-2">
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">
                   Brain Tutorial Home • {kolkataTime} (IST)
                 </p>
                 {isInitialSyncing && (
                   <span className="flex items-center gap-1.5 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                     <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                     Syncing with Cloud...
                   </span>
                 )}
               </div>
             </div>
           </div>
           
           <div className="hidden sm:flex gap-4 items-center">
              {syncError && (
                <div className="flex flex-col gap-1 items-end">
                  <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 max-w-sm animate-in slide-in-from-top duration-500">
                    <AlertCircle size={14} className="shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-widest line-clamp-1">{syncError}</span>
                    <button onClick={() => refreshCloudData()} className="ml-2 px-2 py-1 bg-rose-500 text-white rounded text-[8px] font-black hover:bg-rose-600 transition-colors shrink-0">RETRY</button>
                  </div>
                  <div className="flex gap-4 px-2">
                    <a 
                      href={scriptUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[8px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400"
                    >
                      1. Check Script URL ↗
                    </a>
                    <button 
                      onClick={() => alert("TROUBLESHOOTING:\n1. Click 'Run' in the Apps Script Editor to authorize permissions.\n2. Ensure 'Who has access' is set to 'Anyone'.\n3. Try Incognito mode if you use multiple Google accounts.")}
                      className="text-[8px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 underline underline-offset-2"
                    >
                      2. Common Fixes
                    </button>
                  </div>
                </div>
              )}
              <Link 
                id="admin-header-fee-tracker-btn"
                to="/admin/student-fee-tracker" 
                className="hidden xl:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-white border border-emerald-500/20 text-xs font-black uppercase tracking-wider transition-all"
              >
                <CreditCard size={13} className="text-emerald-400" />
                <span>Fee Tracker</span>
              </Link>
              <Link 
                id="admin-header-student-overview-btn"
                to="/admin/student-overview" 
                className="hidden xl:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white border border-indigo-500/20 text-xs font-black uppercase tracking-wider transition-all"
              >
                <Eye size={13} className="text-indigo-400" />
                <span>Student Overview</span>
              </Link>
              <Link 
                id="admin-header-attendance-btn"
                to="/admin/attendance" 
                className="glass-button px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-300"
              >
                Attendance
              </Link>
              <Link 
                id="admin-header-settings-btn"
                to="/admin/settings" 
                className="indigo-button px-6 py-2.5 text-xs font-black uppercase tracking-widest flex items-center gap-2"
              >
                <Settings size={14} />
                <span>Settings</span>
              </Link>
           </div>
        </header>

        {/* Sync Error Banner for Mobile/All */}
        {syncError && (
          <div className="sm:hidden bg-rose-600 px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <AlertCircle size={14} />
              <p className="text-[10px] font-black uppercase tracking-wider">Sync Error: {syncError}</p>
            </div>
            <button onClick={() => refreshCloudData()} className="px-3 py-1 bg-white text-rose-600 rounded text-[10px] font-black">RETRY</button>
          </div>
        )}

        {/* Scrollable content */}
        <div className="p-8 flex-1 overflow-auto custom-scrollbar">
          <Routes>
            <Route path="dashboard" element={<AdminHome />} />
            <Route path="student-fee-tracker" element={<StudentFeeTracker />} />
            <Route path="student-overview" element={<StudentOverview />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="admissions" element={<AdmissionManagement />} />
            <Route path="fees" element={<FeeManagement />} />
            <Route path="expenses" element={<ExpenseManagement />} />
            <Route path="accounts" element={<AccountManagement />} />
            <Route path="attendance" element={<AttendanceManagement />} />
            <Route path="settings" element={<SystemSettings />} />
            <Route path="test-master" element={<AdminTestMaster />} />
            <Route path="results" element={<AdminResults />} />
            <Route path="materials" element={<StudyMaterialManagement />} />
            <Route path="due-fees" element={<AdminDueFees />} />
            <Route path="student-remarks" element={<StudentRemarksManagement />} />
            <Route path="notices" element={<NoticeManagement />} />
            <Route path="/" element={<AdminHome />} />
          </Routes>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
        }
        .custom-scrollbar {
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
