import React from 'react';
import { useStorage } from '../../../hooks/useStorage';
import { ExternalLink, Calendar, FileText, Download } from 'lucide-react';
import { motion } from 'motion/react';

const StudentResults: React.FC = () => {
  const { resultLinks } = useStorage();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Exam Results</h2>
          <p className="text-gray-500 text-sm">Access your published exam reports and results</p>
        </div>
      </div>

      <div className="grid gap-4">
        {resultLinks.length > 0 ? (
          resultLinks.map((result, index) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 rounded-xl">
                    <FileText className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{result.title}</h3>
                    {result.description && (
                      <p className="text-gray-600 text-sm mt-1">{result.description}</p>
                    )}
                    <div className="flex items-center mt-3 text-gray-400 text-xs">
                      <Calendar className="w-4 h-4 mr-1.5" />
                      Published on {new Date(result.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-sm group-hover:scale-105"
                >
                  View / Download
                  <Download className="w-4 h-4 ml-2" />
                </a>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="bg-gray-50 border border-gray-100 rounded-3xl p-12 text-center">
             <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 opacity-40">
              <FileText size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Results Found</h3>
            <p className="text-gray-500">Wait for the administration to publish result links.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentResults;
