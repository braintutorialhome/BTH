import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BarChart2, Users, FileCheck, CreditCard, Wallet, Calendar, BookMarked, Bell, LogOut, Menu, X, Plus, Trash2, Edit2, TrendingUp, TrendingDown, DollarSign, Settings, AlertCircle, ExternalLink
} from 'lucide-react';
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

const NavItem = ({ to, icon: Icon, label, active, onClick }: any) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all font-bold text-sm tracking-tight ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/20' 
        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5'
    }`}
  >
    <Icon size={18} />
    <span>{label}</span>
  </Link>
);

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, currentUser, syncError, isInitialSyncing, refreshCloudData, scriptUrl } = useStorage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());

  React.useEffect(() => {
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

  const navItems = [
    { to: '/admin/dashboard', icon: BarChart2, label: 'Dashboard' },
    { to: '/admin/admissions', icon: FileCheck, label: 'Admissions' },
    { to: '/admin/students', icon: Users, label: 'Students' },
    { to: '/admin/fees', icon: CreditCard, label: 'Fees' },
    { to: '/admin/expenses', icon: Wallet, label: 'Expenses' },
    { to: '/admin/accounts', icon: DollarSign, label: 'Accounts' },
    { to: '/admin/attendance', icon: Calendar, label: 'Attendance' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
    { to: '/admin/test-master', icon: ExternalLink, label: 'Exam Portal' },
    { to: '/admin/results', icon: FileCheck, label: 'Results' },
    { to: '/admin/materials', icon: BookMarked, label: 'Materials' },
    { to: '/admin/due-fees', icon: AlertCircle, label: 'Due Fees' },
    { to: '/admin/notices', icon: Bell, label: 'Notices' },
  ];

  const viewNames: Record<string, string> = {
    '/admin/dashboard': 'System Dashboard',
    '/admin/admissions': 'Admission Panel',
    '/admin/students': 'Student Records',
    '/admin/fees': 'Fees & Collections',
    '/admin/expenses': 'Expense Tracker',
    '/admin/accounts': 'Institutional Accounts',
    '/admin/attendance': 'Attendance System',
    '/admin/settings': 'System Settings',
    '/admin/test-master': 'Exam Portal (External)',
    '/admin/results': 'Result Management',
    '/admin/materials': 'Study Materials',
    '/admin/due-fees': 'Due Fees Management',
    '/admin/notices': 'Notice Board',
  };

  return (
    <div className="min-h-screen bg-transparent flex font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 h-full bg-white/5 backdrop-blur-3xl border-r border-white/10 flex flex-col p-6 transform transition-transform duration-300 lg:translate-x-0 lg:static
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-600/30">
              <span className="text-white tracking-tighter">BTH</span>
            </div>
            <div>
              <h1 className="text-lg font-black leading-tight uppercase tracking-widest text-white">Brain Tutorial Home</h1>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Admin Portal</p>
            </div>
            <button className="ml-auto lg:hidden text-slate-400" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>
          
          <nav className="flex-1 space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
            {navItems.map(item => (
              <NavItem 
                key={item.to} 
                {...item} 
                active={location.pathname === item.to}
                onClick={() => setIsSidebarOpen(false)}
              />
            ))}
          </nav>

          <div className="mt-8 pt-6 border-t border-white/5">
             <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-white/10 mb-4">
                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-1">Support</p>
                <p className="text-xs text-slate-400 font-medium">+91 9647046334</p>
             </div>
             <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all font-bold text-sm text-rose-400 hover:bg-rose-400/10 hover:text-rose-300"
              >
                <LogOut size={18} />
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
                   Brain Tutorial Home • {kolkataTime}
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
              <Link to="/admin/attendance" className="glass-button px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-300">
                Attendance
              </Link>
              <Link to="/admin/expenses" className="indigo-button px-6 py-2.5 text-xs font-black uppercase tracking-widest">
                Add Expense 💸
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
