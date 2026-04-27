import React, { useState } from 'react';
import { useStorage } from '../../../hooks/useStorage';
import { Shield, User as UserIcon, Key, Lock, X, Save, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { User } from '../../../types';

export default function SystemSettings() {
  const { students, users, updateUser, currentUser, refreshCloudData, isInitialSyncing, syncError } = useStorage();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [activeCategory, setActiveCategory] = useState<'admin' | 'student'>('admin');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(user => {
    const isCorrectRole = user.role === activeCategory;
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Ensure current admin always shows up in directory if role matches
    if (user.id === currentUser?.id && isCorrectRole) return true;

    if (activeCategory === 'student') {
      const student = students.find(s => s.id === user.id);
      return isCorrectRole && matchesSearch && student && student.status !== 'deleted';
    }
    
    return isCorrectRole && matchesSearch;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshCloudData();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUpdateAccount = () => {
    if (!editingUser) return;
    updateUser({
      ...editingUser,
      username: newUsername || editingUser.username,
      password: newPassword || editingUser.password
    });
    setEditingUser(null);
    setNewPassword('');
    setNewUsername('');
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Cloud Status Header */}
      <div className="glass p-6 rounded-[32px] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${syncError ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            {syncError ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          </div>
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest">
              Cloud System Status: {syncError ? 'Communication Issue' : 'Operational'}
            </h4>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mt-0.5">
              {syncError ? syncError : 'All data nodes are synchronized with Google Sheets'}
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing || isInitialSyncing}
          className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all flex items-center gap-3 border border-white/10 disabled:opacity-50"
        >
          <RefreshCw size={14} className={isRefreshing || isInitialSyncing ? 'animate-spin' : ''} />
          {isRefreshing || isInitialSyncing ? 'Synchronizing Nodes...' : 'Force Cloud Refresh'}
        </button>
      </div>

      {/* Primary Admin Quick Settings */}
      {currentUser && (
        <div className="glass p-10 rounded-[40px] border border-white/10 bg-indigo-500/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="p-5 bg-indigo-500 text-white rounded-[24px] shadow-xl shadow-indigo-500/20">
                <Shield size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Personal Access Profile</h3>
                <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Logged in as {currentUser.name}</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setEditingUser(currentUser);
                setNewUsername(currentUser.username);
              }}
              className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-3"
            >
              <Key size={18} /> Update My Credentials
            </button>
          </div>
        </div>
      )}

      {/* Account Type Selection */}
      <div className="flex gap-4">
        <button 
          onClick={() => setActiveCategory('admin')}
          className={`flex-1 p-8 rounded-[32px] border transition-all text-left group ${activeCategory === 'admin' ? 'bg-indigo-600/10 border-indigo-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-4 rounded-2xl ${activeCategory === 'admin' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-500'}`}>
              <Shield size={24} />
            </div>
            <div>
              <h3 className={`text-lg font-black uppercase tracking-tight ${activeCategory === 'admin' ? 'text-white' : 'text-slate-500'}`}>Admin Access</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Manage institutional control</p>
            </div>
          </div>
          {activeCategory === 'admin' && <div className="h-1 w-20 bg-indigo-500 rounded-full"></div>}
        </button>

        <button 
          onClick={() => setActiveCategory('student')}
          className={`flex-1 p-8 rounded-[32px] border transition-all text-left group ${activeCategory === 'student' ? 'bg-emerald-600/10 border-emerald-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-4 rounded-2xl ${activeCategory === 'student' ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-500'}`}>
              <UserIcon size={24} />
            </div>
            <div>
              <h3 className={`text-lg font-black uppercase tracking-tight ${activeCategory === 'student' ? 'text-white' : 'text-slate-500'}`}>Student Access</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Manage portal credentials</p>
            </div>
          </div>
          {activeCategory === 'student' && <div className="h-1 w-20 bg-emerald-500 rounded-full"></div>}
        </button>
      </div>

      {/* User Management Section */}
      <div className="glass p-10 rounded-[40px] border border-white/5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-3xl border ${activeCategory === 'admin' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
              {activeCategory === 'admin' ? <Shield size={24} /> : <UserIcon size={24} />}
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight uppercase">
                {activeCategory === 'admin' ? 'Administrator Directory' : 'Student Directory'}
              </h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                {activeCategory === 'admin' ? 'Authorized institutional managers' : 'Registered portal student users'}
              </p>
            </div>
          </div>

          <div className="relative group flex-1 max-w-md">
            <input 
              type="text"
              placeholder={`Search ${activeCategory}s...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/5 focus:border-white/20 rounded-2xl px-6 py-4 text-sm text-white placeholder-slate-600 outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user, i) => (
            <div key={`${user.id}-${i}`} className="glass p-6 rounded-3xl border border-white/5 group hover:bg-white/10 transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-2xl ${user.role === 'admin' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                  <UserIcon size={18} />
                </div>
                {user.id === currentUser?.id && (
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 px-2 py-1 bg-emerald-500/10 rounded-lg">YOU</span>
                )}
              </div>
              
              <h4 className="font-black text-white mb-1 uppercase tracking-tight">{user.name}</h4>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">@{user.username}</p>

              <button 
                onClick={() => setEditingUser(user)}
                className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 transition-all flex items-center justify-center gap-2 border border-white/5"
              >
                <Key size={12} /> Manage Credentials
              </button>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-slate-600 text-xs font-black uppercase tracking-[0.2em]">No {activeCategory} accounts detected in this node</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Password Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-950/80">
          <div className="glass max-w-md w-full p-10 rounded-[40px] border border-white/10 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
                  <Lock size={20} />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Security</h3>
              </div>
              <button 
                onClick={() => setEditingUser(null)}
                className="p-2 hover:bg-white/10 rounded-xl text-slate-500 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Update User ID (Username)</label>
                <input 
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder={editingUser.username}
                  className="input-glass w-full px-6 py-5 rounded-2xl mb-4"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">New Password</label>
                <input 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="ENHANCE_SECURITY_LEVEL"
                  className="input-glass w-full px-6 py-5 rounded-2xl"
                />
              </div>

              <button 
                onClick={handleUpdateAccount}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20"
              >
                <Save size={18} /> Update Access Credentials
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Logs removed */}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        .custom-scrollbar { scrollbar-width: none; }
      `}</style>
    </div>
  );
}
