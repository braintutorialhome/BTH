import React from 'react';
import { useStorage } from '../../../hooks/useStorage';
import { ExternalLink, Calendar, ClipboardList } from 'lucide-react';
import { motion } from 'motion/react';

const StudentTestMaster: React.FC = () => {
  const { externalTests } = useStorage();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Exam Portal</h2>
          <p className="text-gray-500 text-sm">Attempt tests from external platforms</p>
        </div>
      </div>

      <div className="grid gap-4">
        {externalTests.length > 0 ? (
          externalTests.map((test, index) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-50 rounded-xl">
                    <ClipboardList className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{test.title}</h3>
                    {test.description && (
                      <p className="text-gray-600 text-sm mt-1">{test.description}</p>
                    )}
                    <div className="flex items-center mt-3 text-gray-400 text-xs">
                      <Calendar className="w-4 h-4 mr-1.5" />
                      Posted on {new Date(test.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <a
                  href={test.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-sm group-hover:scale-105"
                >
                  Start Test
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="bg-gray-50 border border-gray-100 rounded-3xl p-12 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Tests Available</h3>
            <p className="text-gray-500">Check back later for new external test links.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentTestMaster;
