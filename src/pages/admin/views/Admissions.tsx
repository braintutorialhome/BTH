import React, { useState } from 'react';
import { useStorage } from '../../../hooks/useStorage';
import { Check, X, FileText, User, MapPin, Calendar, Edit2, Save, Phone, Info, Camera, Upload, Trash2 } from 'lucide-react';
import { safeFormat } from '../../../lib/utils';
import { Student } from '../../../types';

export default function AdmissionManagement() {
  const { students, approveStudent, rejectStudent, updateStudent } = useStorage();
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const pending = students.filter(s => s.status === 'pending');

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 120;
        const MAX_HEIGHT = 120;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          if (editingStudent) {
            setEditingStudent({ ...editingStudent, avatarUrl: dataUrl });
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      updateStudent(editingStudent);
      setEditingStudent(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {pending.length === 0 ? (
        <div className="glass p-20 rounded-[40px] text-center">
          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <FileText size={32} className="text-slate-600" />
          </div>
          <h3 className="text-2xl font-black text-white mb-2">Clean Slates</h3>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No pending student applications</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {pending.map(s => (
            <div key={s.id} className="glass p-8 rounded-[32px] flex flex-col md:flex-row justify-between items-start md:items-center gap-8 transition-all hover:bg-white/10 group">
              <div className="flex gap-6">
                <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center text-3xl font-black shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform overflow-hidden">
                  {s.avatarUrl ? (
                    <img 
                      src={s.avatarUrl} 
                      alt={s.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-3xl" 
                    />
                  ) : (
                    s.name.charAt(0)
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-black text-2xl tracking-tight text-white mb-1">{s.name}</h3>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                       <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                         <User size={14} className="text-indigo-400" /> {s.fatherName}
                       </span>
                       <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                         <MapPin size={14} className="text-indigo-400" /> {s.address}
                       </span>
                       {s.dateOfJoining && (
                         <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                           <Calendar size={14} className="text-indigo-400" /> Joined on {safeFormat(s.dateOfJoining, 'dd MMM yyyy')}
                         </span>
                       )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black tracking-widest text-indigo-100 uppercase">
                      Class {s.class}
                    </span>
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black tracking-widest text-indigo-100 uppercase">
                      {s.subject}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button 
                  onClick={() => setEditingStudent(s)}
                  className="flex-1 md:flex-none px-6 py-3 bg-white/5 border border-white/10 text-slate-300 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Edit2 size={12} /> Edit Details
                </button>
                <button 
                  onClick={() => approveStudent(s.id)}
                  className="flex-1 md:flex-none px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Approve
                </button>
                <button 
                   onClick={() => rejectStudent(s.id)}
                  className="flex-1 md:flex-none px-6 py-3 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-950/80">
          <div className="glass max-w-xl w-full p-10 rounded-[40px] border border-white/10 overflow-y-auto max-h-[90vh] custom-scrollbar">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
                  <Edit2 size={20} />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Edit Application Details</h3>
              </div>
              <button onClick={() => setEditingStudent(null)} className="p-2 hover:bg-white/10 rounded-xl text-slate-500 transition-all"><X size={20} /></button>
            </div>

            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-full flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-3xl gap-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block text-center">Student Picture</label>
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center overflow-hidden">
                    {editingStudent.avatarUrl ? (
                      <img 
                        src={editingStudent.avatarUrl} 
                        alt={editingStudent.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-black text-white/50">{editingStudent.name.charAt(0)}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-indigo-600/80 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-black uppercase tracking-widest gap-1 cursor-pointer"
                  >
                    <Camera size={18} />
                    Change
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                  >
                    <Upload size={12} /> Upload New
                  </button>
                  {editingStudent.avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setEditingStudent({ ...editingStudent, avatarUrl: '' })}
                      className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  )}
                </div>
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Full Name</label>
                <input 
                  type="text"
                  required
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})}
                  className="input-glass w-full px-6 py-4 rounded-2xl font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Guardian Name</label>
                <input 
                  type="text"
                  required
                  value={editingStudent.fatherName || ''}
                  onChange={(e) => setEditingStudent({...editingStudent, fatherName: e.target.value})}
                  className="input-glass w-full px-6 py-4 rounded-2xl font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Date of Birth</label>
                <input 
                  type="date"
                  required
                  value={editingStudent.dob || ''}
                  onChange={(e) => setEditingStudent({...editingStudent, dob: e.target.value})}
                  className="input-glass w-full px-6 py-4 rounded-2xl text-white uppercase font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Gender</label>
                <select 
                  value={editingStudent.gender || 'Male'}
                  onChange={(e) => setEditingStudent({...editingStudent, gender: e.target.value})}
                  className="input-glass w-full px-6 py-4 rounded-2xl font-bold appearance-none cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Class</label>
                <select 
                  value={editingStudent.class}
                  onChange={(e) => setEditingStudent({...editingStudent, class: e.target.value})}
                  className="input-glass w-full px-6 py-4 rounded-2xl font-bold appearance-none cursor-pointer"
                >
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

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Mobile</label>
                <input 
                  type="text"
                  required
                  value={editingStudent.mobile}
                  onChange={(e) => setEditingStudent({...editingStudent, mobile: e.target.value})}
                  className="input-glass w-full px-6 py-4 rounded-2xl font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Subject</label>
                <input 
                  type="text"
                  required
                  value={editingStudent.subject}
                  onChange={(e) => setEditingStudent({...editingStudent, subject: e.target.value})}
                  className="input-glass w-full px-6 py-4 rounded-2xl font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Semester</label>
                <select 
                  value={editingStudent.semester || 'NA'}
                  onChange={(e) => setEditingStudent({...editingStudent, semester: e.target.value})}
                  className="input-glass w-full px-6 py-4 rounded-2xl font-bold appearance-none cursor-pointer"
                >
                  <option value="NA">NA</option>
                  <option value="No Semester">No Semester</option>
                </select>
              </div>

              <div className="col-span-full">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Date of Joining</label>
                <input 
                  type="date"
                  value={editingStudent.dateOfJoining || ''}
                  onChange={(e) => setEditingStudent({...editingStudent, dateOfJoining: e.target.value})}
                  className="input-glass w-full px-6 py-4 rounded-2xl text-white uppercase font-bold"
                />
              </div>

              <div className="col-span-full">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Residential Address</label>
                <textarea 
                  rows={2}
                  required
                  value={editingStudent.address || ''}
                  onChange={(e) => setEditingStudent({...editingStudent, address: e.target.value})}
                  className="input-glass w-full p-6 rounded-2xl resize-none font-bold"
                />
              </div>

              <div className="col-span-full">
                <button type="submit" className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20">
                  <Save size={18} /> Update Application Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        .custom-scrollbar { scrollbar-width: none; }
      `}</style>
    </div>
  );
}
