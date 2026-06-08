import React from 'react';
import { useStorage } from '../../../hooks/useStorage';
import { Calendar, FileText, Download } from 'lucide-react';
import { motion } from 'motion/react';

const StudentResults: React.FC = () => {
  const { resultLinks } = useStorage();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-white/5 p-6 rounded-[32px] border border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="font-black text-xl text-white tracking-tight">Exam Results</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Access your published exam reports and results</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {resultLinks.length > 0 ? (
          resultLinks.map((result, index) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-[32px] p-6 hover:bg-white/[0.03] transition-all duration-300 border border-white/5 group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-[20px]">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-lg tracking-tight">{result.title}</h3>
                    {result.description && (
                      <p className="text-slate-400 text-sm mt-1">{result.description}</p>
                    )}
                    <div className="flex items-center mt-3 text-slate-500 text-xs font-black uppercase tracking-widest">
                      <Calendar className="w-4 h-4 mr-1.5 text-emerald-400" />
                      Published on {new Date(result.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-white font-black text-[10px] tracking-widest uppercase rounded-xl transition-all active:scale-95 px-6 py-3 flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10"
                >
                  View / Download
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="glass rounded-[40px] p-12 text-center border border-white/5">
             <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText size={40} className="text-emerald-400" />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">No Results Found</h3>
            <p className="text-slate-500 text-xs uppercase tracking-widest">Wait for the administration to publish result links.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentResults;
