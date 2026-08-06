import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, LogIn, UserPlus, Loader2, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Return to Home link */}
      <Link 
        to="/" 
        className="mb-8 glass px-5 py-2.5 rounded-full flex items-center gap-2.5 border-white/10 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30 transition-all group relative z-10 shadow-lg"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform text-cyan-400" /> 
        <span className="text-[11px] font-black uppercase tracking-widest leading-none">Abort & Return</span>
      </Link>
      
      {/* Glowing Circular Card Frame */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[460px] relative z-10"
      >
        <div className="relative rounded-[48px] sm:rounded-full border-2 border-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.35),inset_0_0_25px_rgba(34,211,238,0.12)] bg-[#030d1d]/85 backdrop-blur-2xl p-8 sm:p-11 flex flex-col items-center justify-center text-center overflow-hidden">
          
          {/* Subtle inner top glow overlay */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-28 bg-cyan-400/10 blur-2xl pointer-events-none rounded-full" />

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-black text-cyan-300 tracking-wider uppercase mb-6 drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]">
            {isLogin ? 'LOGIN' : 'REGISTER'}
          </h1>

          <form onSubmit={handleSubmit} className="w-full space-y-4 sm:space-y-5">
            {/* Role Toggle Pill */}
            <div className="bg-[#020914]/90 border border-cyan-500/25 p-1 rounded-full flex items-center justify-between shadow-inner">
              <button 
                type="button"
                onClick={() => setRole('student')}
                className={`flex-1 py-2 sm:py-2.5 px-4 rounded-full text-[11px] font-black uppercase tracking-wider transition-all duration-300 ${
                  role === 'student' 
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.4)] font-extrabold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                STUDENT
              </button>
              <button 
                type="button"
                onClick={() => setRole('admin')}
                className={`flex-1 py-2 sm:py-2.5 px-4 rounded-full text-[11px] font-black uppercase tracking-wider transition-all duration-300 ${
                  role === 'admin' 
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.4)] font-extrabold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ROOT/ADMIN
              </button>
            </div>

            {/* Inputs */}
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <input 
                    required
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#020914]/80 border border-cyan-500/20 text-cyan-100 placeholder:text-slate-500/70 text-center text-sm font-semibold py-3 px-5 rounded-full focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40 focus:shadow-[0_0_15px_rgba(34,211,238,0.25)] transition-all"
                    placeholder="Full Name"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <input 
                required
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#020914]/80 border border-cyan-500/20 text-cyan-100 placeholder:text-slate-500/70 text-center text-sm font-semibold py-3 sm:py-3.5 px-5 rounded-full focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40 focus:shadow-[0_0_15px_rgba(34,211,238,0.25)] transition-all"
                placeholder="Username"
              />
            </div>

            <div>
              <input 
                required
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#020914]/80 border border-cyan-500/20 text-cyan-100 placeholder:text-slate-500/70 text-center text-sm font-semibold py-3 sm:py-3.5 px-5 rounded-full focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40 focus:shadow-[0_0_15px_rgba(34,211,238,0.25)] transition-all"
                placeholder="Password"
              />
            </div>

            {/* Error or Sync Info */}
            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-rose-400 text-[10px] font-black uppercase tracking-wider py-1 px-3 bg-rose-500/10 rounded-full border border-rose-500/20"
              >
                {error}
              </motion.p>
            )}

            {isInitialSyncing && (
              <div className="flex items-center justify-center gap-2 py-1 text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
                <Loader2 size={12} className="animate-spin" />
                <span>Synchronizing database...</span>
              </div>
            )}

            {syncError && !isInitialSyncing && (
              <p className="text-amber-400 text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl">
                ⚠️ {syncError}
              </p>
            )}

            {/* Sign In / Sign Up Button */}
            <button 
              type="submit" 
              disabled={loading || isInitialSyncing}
              className="w-full py-3.5 sm:py-4 px-6 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:brightness-110 active:scale-95 text-slate-950 font-black tracking-widest uppercase text-xs sm:text-sm shadow-[0_0_25px_rgba(34,211,238,0.4)] flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <ArrowRight size={18} strokeWidth={3} />
              )}
              <span>{isInitialSyncing ? 'SYNCHRONIZING...' : isLogin ? 'SIGN IN' : 'REGISTER NOW'}</span>
            </button>
          </form>

          {/* Switch Mode Toggle */}
          <div className="mt-5">
            <button 
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-[11px] font-bold text-slate-400 hover:text-cyan-300 transition-colors underline decoration-cyan-500/30 underline-offset-4 cursor-pointer"
            >
              {isLogin ? "Need an account? Register" : "Already registered? Sign in"}
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
}


