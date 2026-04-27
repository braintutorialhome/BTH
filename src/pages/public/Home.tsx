import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Phone, MessageSquare, BookOpen, GraduationCap, ArrowRight, MapPin, PhoneCall } from 'lucide-react';

export default function PublicHome() {
  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="fixed top-0 w-full bg-slate-950/20 backdrop-blur-md border-b border-white/5 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <span className="text-white font-bold text-sm tracking-tighter">BTH</span>
            </div>
            <span className="font-black text-xl tracking-tighter uppercase whitespace-nowrap">Brain <span className="text-indigo-400">Tutorial Home</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-10 text-sm font-bold uppercase tracking-widest text-slate-400">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/admission" className="hover:text-white transition-colors">Admission</Link>
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
          </nav>
          <div className="flex items-center gap-4">
            <a href="tel:+919647046334" className="hidden sm:flex items-center gap-2 text-sm font-bold bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl hover:bg-white/10 transition-all">
              <Phone size={16} />
              <span>Call</span>
            </a>
            <Link to="/admission" className="indigo-button px-6 py-2.5 text-sm font-bold flex items-center gap-2">
              Apply <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-40 pb-32 px-4 relative overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full -z-10"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block px-4 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-black uppercase tracking-widest mb-8">
              Trusted Tuition for School Students
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] mb-8">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x">BTH</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
              Premium tuition for school students.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link to="/login" className="indigo-button px-10 py-5 font-black text-lg shadow-2xl shadow-indigo-600/40 hover:scale-105">
                Portal Login
              </Link>
              <Link to="/admission" className="glass bg-white/10 px-10 py-5 rounded-2xl font-black text-lg hover:bg-white/20 transition-all">
                Join Now
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          {[
            { icon: BookOpen, title: "Multi-Subject", desc: "Geography, History, Math, Science, English, Bengali, Computer.", color: "blue" },
            { icon: GraduationCap, title: "Classes 5-12", desc: "Helping students get the best grades.", color: "indigo" },
            { icon: MessageSquare, title: "Flexible Batches", desc: "Morning and Evening batches to suit your school schedule.", color: "purple" }
          ].map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="glass p-10 rounded-[40px] hover:scale-[1.02] hover:bg-white/10 transition-all group"
            >
              <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-indigo-600/20 transition-colors">
                <f.icon size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-black mb-4">{f.title}</h3>
              <p className="text-slate-400 leading-relaxed font-medium">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none">About Us</h2>
                <p className="text-lg text-slate-400 font-medium leading-relaxed">
                  We focus on building strong academic foundations and helping students achieve excellent results in school examinations. Our teaching approach is simple, clear, and student-friendly, ensuring that every student understands concepts deeply.
                </p>
                
                <div className="pt-2">
                  <h3 className="text-indigo-400 font-black tracking-widest uppercase text-xs mb-2">Our Mission</h3>
                  <p className="text-slate-300 font-bold leading-relaxed">
                    To provide affordable and high-quality education to students and help them succeed academically.
                  </p>
                </div>

                <ul className="grid gap-3 pt-2">
                  {[
                    "Limited students per batch for personal guidance",
                    "Regular tests and progress tracking",
                    "Special doubt-solving & exam-oriented practice",
                    "Safe, friendly & motivating environment",
                    "Experienced guidance & Study materials",
                    "Attendance tracking",
                    "Parent-friendly communication"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-slate-400 font-medium text-sm">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6 pt-4">
                <div className="glass p-6 rounded-3xl group">
                  <div className="flex items-center gap-4 text-white">
                    <MapPin className="text-indigo-400" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-0.5">Location</p>
                      <p className="font-bold text-sm">Nangla, Satbhaiya, Kashipur, West Bengal, Pin - 700135</p>
                    </div>
                  </div>
                </div>
                <div className="glass p-6 rounded-3xl group">
                  <div className="flex items-center gap-4 text-white">
                    <PhoneCall className="text-indigo-400" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-0.5">Contact</p>
                      <p className="font-bold text-sm">+91 9647046334</p>
                      <p className="font-bold text-sm">+91 9800811416</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-x-0 bottom-0 top-12 bg-indigo-600/20 blur-3xl rounded-full -z-10 group-hover:bg-indigo-600/30 transition-all"></div>
              <div className="glass-card aspect-square max-w-md mx-auto p-1 text-center flex flex-col items-center justify-center relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent"></div>
                 <h3 className="text-[12rem] font-black italic text-white/5 select-none leading-none absolute -top-8 uppercase tracking-tighter">BTH</h3>
                 <div className="relative z-10 px-8">
                   <h4 className="text-6xl font-black tracking-tighter mb-2 italic">BTH</h4>
                   <p className="text-sm font-black tracking-[0.4em] uppercase text-indigo-400">Brain Tutorial Home</p>
                   <div className="mt-8 pt-8 border-t border-white/5 space-y-1">
                      <p className="text-xs font-black tracking-widest uppercase text-slate-500">Teacher's name</p>
                      <p className="font-bold text-indigo-100 uppercase tracking-widest">Afiur Rahaman</p>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-black/40 border-t border-white/5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
              <span className="text-white font-bold">BT</span>
            </div>
            <span className="font-black text-2xl tracking-tighter text-white uppercase">Brain <span className="text-indigo-400">Tutorial Home</span></span>
          </div>
          <p className="text-slate-500 font-medium mb-10 max-w-2xl mx-auto text-sm leading-relaxed">
            Visit us or call us!
          </p>
          <div className="flex justify-center gap-4 mb-20">
            <a href="https://wa.me/919647046334" className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-green-500 text-white transition-all hover:-translate-y-1">
              <MessageSquare size={24} />
            </a>
            <a href="tel:+919647046334" className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-500 text-white transition-all hover:-translate-y-1">
              <Phone size={24} />
            </a>
          </div>
          <div className="text-xs font-black uppercase tracking-widest text-slate-600">
            © {new Date().getFullYear()} Brain Tutorial Home. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
