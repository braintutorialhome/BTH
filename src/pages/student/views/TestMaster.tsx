import React from 'react';
import { useStorage } from '../../../hooks/useStorage';
import { ExternalLink, Calendar, ClipboardList } from 'lucide-react';
import { motion } from 'motion/react';

const StudentTestMaster: React.FC = () => {
  const { externalTests } = useStorage();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-white/5 p-6 rounded-[32px] border border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-xl">
            <ClipboardList size={24} />
          </div>
          <div>
            <h3 className="font-black text-xl text-white tracking-tight">Exam Portal</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Attempt tests from external platforms</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {externalTests.length > 0 ? (
          externalTests.map((test, index) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-[32px] p-6 hover:bg-white/[0.03] transition-all duration-300 border border-white/5 group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-[20px]">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-lg tracking-tight">{test.title}</h3>
                    {test.description && (
                      <p className="text-slate-400 text-sm mt-1">{test.description}</p>
                    )}
                    <div className="flex items-center mt-3 text-slate-500 text-xs font-black uppercase tracking-widest">
                      <Calendar className="w-4 h-4 mr-1.5 text-indigo-400" />
                      Posted on {new Date(test.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <a
                  href={test.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="indigo-button px-6 py-3.5 text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-1.5"
                >
                  Start Test
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="glass rounded-[40px] p-12 text-center border border-white/5">
            <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ClipboardList size={40} className="text-indigo-400" />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">No Tests Available</h3>
            <p className="text-slate-500 text-xs uppercase tracking-widest">Check back later for new external test links.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentTestMaster;
