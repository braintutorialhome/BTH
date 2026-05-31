import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, User, Lock, ArrowLeft, KeyRound, UserPlus, LogIn, Loader2 } from 'lucide-react';
import { useStorage } from '../../hooks/useStorage';

export default function Login() {
  const navigate = useNavigate();
  const { login, signup, isInitialSyncing, syncError } = useStorage();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'admin' | 'student'>('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const success = await login(username, password, role);
        if (success) {
          navigate(role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
        } else {
          setError('Invalid credentials or unauthorized access');
        }
      } else {
        await signup({
          username,
          password,
          name,
          role
        });
        setIsLogin(true);
        setError('Account created. Please log in.');
      }
    } catch (err: any) {
      setError(err.message || 'System communication failure');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />

      <Link to="/" className="mb-12 glass px-6 py-3 rounded-2xl flex items-center gap-3 border-white/5 text-slate-500 hover:text-white transition-all group relative z-10">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
        <span className="text-xs font-black uppercase tracking-widest leading-none">Abort & Return</span>
      </Link>
      
      <motion.div 
        layout
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-lg glass rounded-[60px] shadow-2xl border border-white/10 overflow-hidden relative z-10"
      >
        <div className="p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none"></div>
          
          <div className="inline-flex w-24 h-24 bg-white/5 rounded-[30px] items-center justify-center mb-10 border border-white/5 shadow-inner group relative">
            <div className="absolute inset-0 bg-indigo-600 opacity-20 blur-2xl group-hover:opacity-40 transition-opacity"></div>
            <Shield className="text-white relative z-10" size={40} />
          </div>
          
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none mb-3">
            Portal <span className="text-indigo-500">{isLogin ? 'Access' : 'Registry'}</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
            {isLogin ? 'Encrypted BTH educational servers' : 'Register new administrative or student node'}
          </p>
        </div>

        <div className="px-12 pb-16 space-y-10">
          <div className="flex glass p-2 rounded-[30px] border-white/5 relative overflow-hidden">
             <button 
                onClick={() => setRole('student')}
                className={`flex-1 py-4 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all relative z-10 ${
                  role === 'student' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-600 hover:text-slate-400'
                }`}
              >
                Student
              </button>
              <button 
                onClick={() => setRole('admin')}
                className={`flex-1 py-4 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all relative z-10 ${
                  role === 'admin' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-600 hover:text-slate-400'
                }`}
              >
                Root
              </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-2">Full Identity Name</label>
                  <input 
                    required
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-glass w-full py-5 rounded-3xl font-bold tracking-tight text-lg"
                    placeholder="ENTER FULL NAME"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-2">System UID / Username</label>
              <input 
                required
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-glass w-full py-5 rounded-3xl font-bold tracking-tight text-lg"
                placeholder="USERNAME"
              />
            </div>
            
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-2">Encryption Key / Password</label>
              <input 
                required
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-glass w-full py-5 rounded-3xl font-bold text-lg"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3"
              >
                <p className="text-rose-400 text-[9px] font-black uppercase tracking-widest">{error}</p>
              </motion.div>
            )}

            {isInitialSyncing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-5 bg-indigo-500/5 border border-white/5 rounded-2xl flex items-center justify-center gap-3"
              >
                <Loader2 className="animate-spin text-indigo-500" size={14} />
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Initial cloud sync in progress...</p>
              </motion.div>
            )}

            {syncError && !isInitialSyncing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex flex-col gap-2"
              >
                <p className="text-amber-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-2"> Cloud connectivity warning </p>
                <p className="text-slate-400 text-[8px] font-bold uppercase tracking-wider">{syncError}</p>
              </motion.div>
            )}

            <button 
              type="submit" 
              disabled={loading || isInitialSyncing}
              className="w-full py-6 text-xs font-black uppercase tracking-widest indigo-button shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
              <span>{isInitialSyncing ? 'Synchronizing...' : isLogin ? 'Login' : 'Sign Up'}</span>
            </button>
          </form>
          
          <div className="text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all underline decoration-white/0 hover:decoration-white/10 underline-offset-8"
            >
              {isLogin ? "Terminate session? Create new registry" : "Already registered? Restore session"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

