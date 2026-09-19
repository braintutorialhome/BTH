import React, { useState } from 'react';
import { 
  X, Copy, Check, FileSpreadsheet, ExternalLink, RefreshCw, 
  CheckCircle2, AlertCircle, Code2, ArrowRight 
} from 'lucide-react';
import { useStorage } from '../hooks/useStorage';

interface AppsScriptSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const APPS_SCRIPT_CODE = `// ==========================================
// GOOGLE APPS SCRIPT FOR BRAIN TUTORIAL HOME
// Includes: Student Remarks, Fees, Attendance, Students & More
// ==========================================

const SHEETS = {
  LOGS: "UI Activity Logs",
  APPROVED: "Approved Students",
  PENDING: "Pending Admissions",
  DELETED: "Deleted Students",
  FEES: "Fees",
  EXPENSES: "Expenses",
  NOTICES: "Notice",
  MATERIALS: "Study Materials",
  ONLINE_TESTS: "Online Test",
  TEST_RESULTS: "Test Results",
  ATTENDANCE: "Attendance",
  DUE_FEES: "Due Fees",
  USERS: "User",
  RESULTS: "Results",
  EXAM_PORTAL: "Exam Portal",
  REMARKS: "Student Remarks",
  SYSTEM: "System Logs"
};

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === "get_all") {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const data = {};
    
    // Helper to get sheet data as array of objects
    const getSheetData = (sheetName) => {
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) return [];
      const values = sheet.getDataRange().getValues();
      if (values.length < 2) return [];
      
      const headers = values[0];
      return values.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, i) => {
          let val = row[i];
          if (val instanceof Date) val = val.toISOString();
          if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
             try { val = JSON.parse(val); } catch(e) {}
          }
          obj[header] = val;
        });
        return obj;
      });
    };

    const allStudents = [
      ...getSheetData(SHEETS.APPROVED).map(s => ({ ...s, status: 'approved' })),
      ...getSheetData(SHEETS.PENDING).map(s => ({ ...s, status: 'pending' })),
      ...getSheetData(SHEETS.DELETED).map(s => ({ ...s, status: 'deleted' }))
    ];

    data.students = allStudents;
    data.fees = getSheetData(SHEETS.FEES);
    data.expenses = getSheetData(SHEETS.EXPENSES);
    data.notices = getSheetData(SHEETS.NOTICES);
    data.dueFees = getSheetData(SHEETS.DUE_FEES);
    data.externalTests = getSheetData(SHEETS.EXAM_PORTAL);
    data.resultLinks = getSheetData(SHEETS.RESULTS);
    data.materials = getSheetData(SHEETS.MATERIALS);
    data.tests = getSheetData(SHEETS.ONLINE_TESTS);
    data.testResults = getSheetData(SHEETS.TEST_RESULTS);
    data.attendance = getSheetData(SHEETS.ATTENDANCE);
    data.users = getSheetData(SHEETS.USERS);
    data.remarks = getSheetData(SHEETS.REMARKS);
    data.logs = getSheetData(SHEETS.LOGS);

    return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput("BTH Backend Online").setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const data = payload.data;

    if ((action === "SYNC_ALL" || payload.type === "BACKUP") && data) {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      
      const writeToSheet = (sheetName, items) => {
        let sheet = ss.getSheetByName(sheetName);
        if (!sheet) {
          sheet = ss.insertSheet(sheetName);
        } else {
          sheet.clear();
        }
        
        if (!items || items.length === 0) {
          if (sheetName === SHEETS.REMARKS) {
            sheet.appendRow(['id', 'studentId', 'studentName', 'rollNumber', 'class', 'title', 'category', 'remark', 'addedBy', 'date', 'updatedAt']);
          }
          return;
        }
        
        const headers = Object.keys(items[0]);
        sheet.appendRow(headers);
        
        const rows = items.map(item => {
          return headers.map(header => {
            const val = item[header];
            if (val && typeof val === 'object') return JSON.stringify(val);
            return val !== undefined ? val : "";
          });
        });
        
        if (rows.length > 0) {
          sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
        }
      };

      writeToSheet(SHEETS.APPROVED, data.approvedStudents);
      writeToSheet(SHEETS.PENDING, data.pendingAdmissions);
      writeToSheet(SHEETS.DELETED, data.deletedStudents);
      writeToSheet(SHEETS.FEES, data.fees);
      writeToSheet(SHEETS.EXPENSES, data.expenses);
      writeToSheet(SHEETS.NOTICES, data.notices);
      writeToSheet(SHEETS.MATERIALS, data.materials);
      writeToSheet(SHEETS.ONLINE_TESTS, data.tests);
      writeToSheet(SHEETS.TEST_RESULTS, data.testResults);
      writeToSheet(SHEETS.ATTENDANCE, data.attendance);
      writeToSheet(SHEETS.DUE_FEES, data.dueFees);
      writeToSheet(SHEETS.USERS, data.users);
      writeToSheet(SHEETS.RESULTS, data.resultLinks);
      writeToSheet(SHEETS.EXAM_PORTAL, data.externalTests);
      writeToSheet(SHEETS.REMARKS, data.remarks);
      writeToSheet(SHEETS.LOGS, data.logs);
      
      writeToSheet(SHEETS.SYSTEM, [{ 
        timestamp: new Date().toISOString(), 
        event: "BULK_SYNC", 
        status: "SUCCESS" 
      }]);

      return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

export default function AppsScriptSetupModal({ isOpen, onClose }: AppsScriptSetupModalProps) {
  const { syncToCloud, refreshCloudData, scriptUrl, syncError } = useStorage();
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const ok = await syncToCloud();
      if (ok) {
        setSyncStatus('Sync succeeded! All remarks and data pushed to Google Sheets.');
      } else {
        setSyncStatus('Sync request transmitted.');
      }
    } catch {
      setSyncStatus('Sync finished with local persistence.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl bg-slate-950/85">
      <div 
        className="glass max-w-3xl w-full max-h-[90vh] flex flex-col rounded-[32px] sm:rounded-[40px] border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-white/10 flex items-center justify-between gap-4 bg-slate-900/40">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  Student Remarks Ready
                </span>
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mt-1">
                Google Sheets Backend Code & Setup
              </h3>
              <p className="text-xs text-slate-400">
                Update your Google Apps Script deployment to enable the <strong>Student Remarks</strong> sheet tab.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 custom-scrollbar text-left">
          {/* Quick Notice */}
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3">
            <CheckCircle2 size={18} className="text-indigo-400 mt-0.5 shrink-0" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong>Why update?</strong> The backend script now includes full persistence for the <span className="text-indigo-300 font-bold">"Student Remarks"</span> sheet. Once deployed, every academic note, behavioral remark, and teacher feedback note is backed up automatically with student names and classes.
            </div>
          </div>

          {/* Simple Step-by-Step Instructions */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
              <Code2 size={16} className="text-indigo-400" />
              <span>3-Step Quick Deployment Guide</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[11px] font-black flex items-center justify-center mb-2">1</div>
                <h5 className="text-xs font-bold text-white mb-1">Open Apps Script</h5>
                <p className="text-[11px] text-slate-400">
                  Open your connected Google Sheet and click <strong>Extensions &gt; Apps Script</strong>.
                </p>
              </div>

              <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[11px] font-black flex items-center justify-center mb-2">2</div>
                <h5 className="text-xs font-bold text-white mb-1">Replace &amp; Save</h5>
                <p className="text-[11px] text-slate-400">
                  Click <strong>Copy Script Code</strong> below, paste it into the editor, and click <strong>Save</strong>.
                </p>
              </div>

              <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[11px] font-black flex items-center justify-center mb-2">3</div>
                <h5 className="text-xs font-bold text-white mb-1">Deploy New Version</h5>
                <p className="text-[11px] text-slate-400">
                  Click <strong>Deploy &gt; Manage Deployments</strong>, click ✏️ <strong>Edit</strong>, select <strong>New version</strong>, and click <strong>Deploy</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Code Viewer Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Google Apps Script Code (Includes "Student Remarks")
              </span>
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95"
              >
                {copied ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Script Code'}</span>
              </button>
            </div>

            <div className="relative rounded-2xl bg-black/60 border border-white/10 p-4 max-h-56 overflow-y-auto font-mono text-[11px] text-emerald-400/90 leading-relaxed custom-scrollbar">
              <pre className="whitespace-pre">{APPS_SCRIPT_CODE}</pre>
            </div>
          </div>

          {/* Sync Trigger Action */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-white">Ready to push existing remarks to Google Sheet?</p>
              <p className="text-[11px] text-slate-400">
                After saving the script in Google Sheets, click to initialize the "Student Remarks" tab right now.
              </p>
              {syncStatus && (
                <p className="text-[11px] font-bold text-emerald-400 mt-1.5 flex items-center gap-1.5">
                  <CheckCircle2 size={13} />
                  <span>{syncStatus}</span>
                </p>
              )}
            </div>

            <button
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 shadow-lg shadow-emerald-600/20 active:scale-95"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Pushing Data...' : 'Push All Data to Cloud'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex items-center justify-between bg-slate-900/40">
          <div className="text-[11px] text-slate-400">
            Sheet tab name: <code className="text-indigo-400 font-mono font-bold bg-white/5 px-2 py-0.5 rounded">Student Remarks</code>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
