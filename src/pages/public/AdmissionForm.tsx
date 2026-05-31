import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, User, Phone, MapPin, Calendar, Book, Info, CheckCircle, Compass, Sparkles } from 'lucide-react';
import { useStorage } from '../../hooks/useStorage';

export default function AdmissionForm() {
  const navigate = useNavigate();
  const { addStudent } = useStorage();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    dob: '',
    gender: 'Male',
    subject: '',
    class: '',
    semester: '',
    dateOfJoining: '',
    mobile: '',
    address: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile) return;
    addStudent(formData);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full glass p-12 rounded-[50px] shadow-2xl text-center border border-white/10 relative z-10"
        >
          <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-10 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter mb-4 uppercase">Success Protocol</h2>
          <p className="text-slate-400 mb-10 leading-relaxed font-bold italic">
            Transmission received. Our operations team will initiate contact via established uplink shortly.
          </p>
          <Link to="/" className="indigo-button w-full py-5 text-xs font-black uppercase tracking-widest inline-block">
            Home Terminal
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-6 font-sans relative overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 rounded-full blur-[120px]" />

      <div className="max-w-4xl mx-auto mb-12 flex items-center gap-6 relative z-10">
        <button onClick={() => navigate(-1)} className="p-4 glass rounded-2xl hover:bg-white/10 transition-colors border-white/5 text-slate-400 hover:text-white group">
          <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="space-y-1">
           <p className="text-xs font-black uppercase tracking-widest text-indigo-500 flex items-center gap-3 mb-1">
             <span className="flex h-2 w-2 relative">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
             </span>
             Brain Tutorial Home
           </p>
           <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Admission Entry</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto glass rounded-[60px] shadow-2xl border border-white/10 overflow-hidden relative z-10">
        <div className="bg-white/[0.02] border-b border-white/5 p-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Admission <br/> Form</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">For Student's Profile</p>
          </div>
          <div className="w-20 h-20 bg-indigo-600 animate-pulse rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.3)]">
             <Sparkles className="text-white" size={32} />
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-12 space-y-12 bg-white/[0.01]">
          {/* Student Info */}
          <section className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
                 <User size={20} />
              </div>
              <h3 className="font-black text-white uppercase tracking-widest text-xs">Student Identity</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Full name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-glass w-full py-5 rounded-3xl font-bold"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Guardian Name</label>
                <input 
                   required
                  type="text" 
                  value={formData.fatherName}
                  onChange={(e) => setFormData({...formData, fatherName: e.target.value})}
                  className="input-glass w-full py-5 rounded-3xl font-bold font-italic"
                  placeholder="Legal guardian"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Date of Birth</label>
                <input 
                   required
                  type="date" 
                  value={formData.dob}
                  onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  className="input-glass w-full py-5 rounded-3xl font-bold text-white uppercase"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Gender</label>
                <select 
                   required
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="input-glass w-full py-5 px-8 rounded-3xl font-bold appearance-none cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </section>

          {/* Academic Info */}
          <section className="space-y-10 pt-12 border-t border-white/5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
                 <Book size={20} />
              </div>
              <h3 className="font-black text-white uppercase tracking-widest text-xs">Academic Directive</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Subject</label>
                <input 
                   required
                  type="text" 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="input-glass w-full py-5 rounded-3xl font-bold"
                  placeholder="e.g. Computer Science, Math"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Class/Level</label>
                <select 
                   required
                  value={formData.class}
                  onChange={(e) => setFormData({...formData, class: e.target.value})}
                  className="input-glass w-full py-5 px-8 rounded-3xl font-bold appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select Class</option>
                  <option value="Class-V">Class-V</option>
                  <option value="Class-VI">Class-VI</option>
                  <option value="Class-VII">Class-VII</option>
                  <option value="Class-VIII">Class-VIII</option>
                  <option value="Class-IX">Class-IX</option>
                  <option value="Class-X">Class-X</option>
                  <option value="Class-XI">Class-XI</option>
                  <option value="Class-XII">Class-XII</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Semester</label>
                <select 
                  value={formData.semester}
                  onChange={(e) => setFormData({...formData, semester: e.target.value})}
                  className="input-glass w-full py-5 px-8 rounded-3xl font-bold appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select Semester</option>
                  <option value="NA">NA</option>
                  <option value="No Semester">No Semester</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Date of Joining</label>
                <input 
                  type="date" 
                  value={formData.dateOfJoining}
                  onChange={(e) => setFormData({...formData, dateOfJoining: e.target.value})}
                  className="input-glass w-full py-5 rounded-3xl font-bold text-white uppercase"
                />
              </div>
            </div>
          </section>

          {/* Contact Info */}
          <section className="space-y-10 pt-12 border-t border-white/5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl">
                 <Phone size={20} />
              </div>
              <h3 className="font-black text-white uppercase tracking-widest text-xs">Contact Info</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Mobile</label>
                <input 
                   required
                  type="tel" 
                  value={formData.mobile}
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                  className="input-glass w-full py-5 rounded-3xl font-bold"
                  placeholder="+91..."
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Residential Address</label>
              <textarea 
                 required
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="input-glass w-full p-8 rounded-[40px] resize-none"
                placeholder="Full address details"
              ></textarea>
            </div>
          </section>

          <button 
            type="submit" 
            className="w-full py-8 text-xs font-black uppercase tracking-widest indigo-button shadow-2xl shadow-indigo-900/40 hover:scale-[1.01] transition-all"
          >
            Submit Form
          </button>
        </form>
      </div>

      <div className="max-w-4xl mx-auto mt-12 text-center">
        <p className="text-slate-600 font-black uppercase tracking-widest text-[9px]">
          By proceeding, you agree to Brain Tutorial Home's institutional protocols and data processing directives.
        </p>
      </div>
    </div>
  );
}
