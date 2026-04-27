import React from 'react';
import { useStorage } from '../../hooks/useStorage';
import { AlertCircle, IndianRupee, Calendar, ClipboardList } from 'lucide-react';
import { motion } from 'motion/react';

const StudentDueFees: React.FC = () => {
  const { currentUser, dueFees } = useStorage();
  
  const myDueFees = dueFees.filter(df => df.studentId === currentUser?.id);
  const totalDue = myDueFees.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Due Fees</h2>
          <p className="text-gray-500 text-sm">Please pay your pending dues to avoid any interruptions</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Total Pending</p>
          <div className="flex items-center text-3xl font-bold text-orange-600">
            <IndianRupee className="w-6 h-6 mr-1" />
            {totalDue.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {myDueFees.length > 0 ? (
          myDueFees.map((fee, index) => (
            <motion.div
              key={fee.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500" />
              
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-orange-50 rounded-xl">
                      <ClipboardList className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">
                        {fee.remarks}
                      </h3>
                      <div className="flex items-center mt-2 text-gray-500 text-sm space-x-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1.5" />
                          {new Date(fee.date).toLocaleDateString(undefined, { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium text-orange-600 uppercase tracking-widest mb-1">Amount Due</span>
                    <div className="text-2xl font-black text-gray-900">
                      ₹{fee.amount.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="bg-green-50 border border-green-100 rounded-3xl p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2">No Dues Found!</h3>
            <p className="text-green-700">You're all caught up with your payments. Keep it up!</p>
          </div>
        )}
      </div>

      {myDueFees.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start space-x-4">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 leading-relaxed">
            <p className="font-bold mb-1">Payment Instructions:</p>
            <p>Please contact the BTH office to clear your pending fees. You can also pay online using UPI. Kindly keep the payment receipt for future reference.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDueFees;
