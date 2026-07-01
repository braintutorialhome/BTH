import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Student, Fee, Expense, Attendance, Test, TestResult, StudyMaterial, Notice, User, UserRole, DueFee, ExternalTest, ResultLink } from '../types';

// Fallback for crypto.randomUUID
const uuid = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const shortId = () => {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
};

interface StorageContextType {
  students: Student[];
  fees: Fee[];
  expenses: Expense[];
  attendance: Attendance[];
  tests: Test[];
  testResults: TestResult[];
  materials: StudyMaterial[];
  notices: Notice[];
  dueFees: DueFee[];
  externalTests: ExternalTest[];
  users: User[];
  currentUser: User | null;
  
  login: (username: string, password: string, role: UserRole) => Promise<boolean>;
  signup: (user: Omit<User, 'id'>) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
  addLog: (action: string, details: string) => void;
  
  addStudent: (student: Omit<Student, 'id' | 'admissionDate' | 'status'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  removeStudentPermanently: (id: string) => void;
  approveStudent: (id: string) => void;
  rejectStudent: (id: string) => void;
  
  addFee: (fee: Omit<Fee, 'id'>) => void;
  updateFee: (fee: Fee) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  
  markAttendance: (date: string, studentId: string, status: 'present' | 'absent') => void;
  
  addTest: (test: Omit<Test, 'id'>) => void;
  submitTestResult: (result: Omit<TestResult, 'id'>) => void;
  
  addMaterial: (material: Omit<StudyMaterial, 'id' | 'uploadDate'>) => void;
  deleteMaterial: (id: string) => void;
  addNotice: (notice: Omit<Notice, 'id' | 'date'>) => void;
  deleteNotice: (id: string) => void;
  addDueFee: (dueFee: Omit<DueFee, 'id' | 'date'>) => void;
  updateDueFee: (dueFee: DueFee) => void;
  deleteDueFee: (id: string) => void;
  addExternalTest: (test: Omit<ExternalTest, 'id' | 'date'>) => void;
  deleteExternalTest: (id: string) => void;
  addResultLink: (result: Omit<ResultLink, 'id' | 'date'>) => void;
  deleteResultLink: (id: string) => void;
  deleteTest: (id: string) => void;
  deleteFee: (id: string) => void;
  clearAllData: () => void;
  scriptUrl: string;
  refreshCloudData: () => Promise<void>;
  syncError: string | null;
  isInitialSyncing: boolean;
}

// -------------------------------------------------------------------------
// CLOUD SYNC CONFIGURATION
// 1. Deploy your Google Apps Script as a Web App.
// 2. Paste the Web App URL here.
// -------------------------------------------------------------------------
const SCRIPT_URL: string = 'https://script.google.com/macros/s/AKfycbwUIvbJKdfJopEH2E2V5Kf84gltgu-FQUEksdJQ_gbIQEJHmSPOkEcnEJboexKbCpf8FA/exec';
// -------------------------------------------------------------------------

const StorageContext = createContext<StorageContextType | undefined>(undefined);

const loadLocal = <T,>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    console.error(`Failed to load ${key} from localStorage`, e);
    return defaultValue;
  }
};

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>(() => loadLocal('utc_students', []));
  const [fees, setFees] = useState<Fee[]>(() => loadLocal('utc_fees', []));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadLocal('utc_expenses', []));
  const [attendance, setAttendance] = useState<Attendance[]>(() => loadLocal('utc_attendance', []));
  const [tests, setTests] = useState<Test[]>(() => loadLocal('utc_tests', []));
  const [testResults, setTestResults] = useState<TestResult[]>(() => loadLocal('utc_testResults', []));
  const [materials, setMaterials] = useState<StudyMaterial[]>(() => loadLocal('utc_materials', []));
  const [notices, setNotices] = useState<Notice[]>(() => loadLocal('utc_notices', []));
  const [dueFees, setDueFees] = useState<DueFee[]>(() => loadLocal('utc_due_fees', []));
  const [externalTests, setExternalTests] = useState<ExternalTest[]>(() => loadLocal('utc_external_tests', []));
  const [resultLinks, setResultLinks] = useState<ResultLink[]>(() => loadLocal('utc_result_links', []));
  const [users, setUsers] = useState<User[]>(() => loadLocal('utc_users', []));
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('utc_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Failed to parse current user from local storage', e);
      return null;
    }
  });
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isInitialSyncing, setIsInitialSyncing] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => localStorage.getItem('utc_last_sync'));
  
  const scriptUrl = SCRIPT_URL;

  const syncToCloud = async () => {
    if (!scriptUrl || scriptUrl === 'YOUR_APPS_SCRIPT_URL_HERE') return;
    const cleanUrl = scriptUrl.trim();
    try {
      setSyncError(null);
      
      const enrichedFees = fees.map(f => ({
        ...f,
        studentName: students.find(s => s.id === f.studentId)?.name || 'Unknown'
      }));

      const enrichedAttendance = attendance.map(a => ({
        ...a,
        studentName: students.find(s => s.id === a.studentId)?.name || 'Unknown'
      }));

      const enrichedTestResults = testResults.map(tr => ({
        ...tr,
        studentName: students.find(s => s.id === tr.studentId)?.name || 'Unknown'
      }));

      // Strip avatarUrl from students sent to the cloud to prevent Google Sheets cell limit/size crashes
      const cleanStudents = students.map(({ avatarUrl, ...rest }) => rest);

      const payload = {
        type: 'BACKUP',
        action: 'SYNC_ALL',
        data: {
          students: cleanStudents, 
          approvedStudents: cleanStudents.filter(s => s.status === 'approved'),
          pendingAdmissions: cleanStudents.filter(s => s.status === 'pending'),
          deletedStudents: cleanStudents.filter(s => s.status === 'deleted'),
          fees: enrichedFees, 
          expenses, 
          attendance: enrichedAttendance, 
          tests, 
          testResults: enrichedTestResults, 
          materials, 
          notices, 
          dueFees,
          externalTests,
          resultLinks,
          users,
          logs: JSON.parse(localStorage.getItem('utc_activity_logs') || '[]')
        }
      };

      await fetch(cleanUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload)
      });
      console.log('Cloud Sync Triggered');
      setLastSyncTime(new Date().toISOString());
      localStorage.setItem('utc_last_sync', new Date().toISOString());
    } catch (e: any) {
      console.error('Cloud Sync Diagnostic:', e);
      let errorMsg = e.message || 'Sync failed';
      if (errorMsg === 'Failed to fetch') {
        errorMsg = 'CLOUD UPDATE BLOCKED: Ensure "Who has access" is set to "Anyone" and you have authorized all permissions in Apps Script.';
      }
      setSyncError(errorMsg);
    }
  };

  // Sync to cloud when data changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only sync if we have data and we're not in the middle of an initial load
      if (!isInitialSyncing && (students.length > 0 || users.length > 0)) {
        syncToCloud();
      }
    }, 2000); // 2 second debounce
    return () => clearTimeout(timer);
  }, [students, fees, expenses, attendance, tests, testResults, materials, notices, dueFees, externalTests, resultLinks, users]);

  const refreshCloudData = useCallback(async () => {
    const cleanUrl = scriptUrl.trim();
    if (!cleanUrl || cleanUrl.includes('YOUR_APPS_SCRIPT_URL_HERE')) {
      setIsInitialSyncing(false);
      return;
    }

    setIsInitialSyncing(true);
    try {
      setSyncError(null);
      
      if (!cleanUrl.startsWith('https://script.google.com')) {
        throw new Error('INVALID SCRIPT URL: Ensure you are using the Web App URL from Apps Script.');
      }

      const url = new URL(cleanUrl);
      url.searchParams.set('action', 'get_all');
      url.searchParams.set('_t', Date.now().toString());

      console.log('Attempting Cloud Handshake:', url.toString());
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        redirect: 'follow'
      });
      
      if (!response.ok) {
        throw new Error(`Cloud Connection Error: ${response.status} ${response.statusText}`);
      }
      
      const text = await response.text();
      if (!text || text.trim().length === 0) {
        throw new Error('Cloud response was empty. Check if your script logic is correct.');
      }
      
      try {
        const data = JSON.parse(text);
        if (data) {
          if (data.students) {
            setStudents(prevStudents => {
              return data.students.map((newStudent: Student) => {
                const existing = prevStudents.find(s => s.id === newStudent.id);
                return {
                  ...newStudent,
                  avatarUrl: existing?.avatarUrl || newStudent.avatarUrl || ''
                };
              });
            });
          }
          if (data.fees) setFees(data.fees);
          if (data.expenses) setExpenses(data.expenses);
          if (data.users) setUsers(data.users);
          if (data.notices) setNotices(data.notices);
          if (data.dueFees) setDueFees(data.dueFees);
          if (data.externalTests) setExternalTests(data.externalTests);
          if (data.resultLinks) setResultLinks(data.resultLinks);
          if (data.materials) setMaterials(data.materials);
          if (data.tests) setTests(data.tests);
          if (data.testResults) setTestResults(data.testResults);
          if (data.attendance) setAttendance(data.attendance);
          
          if (data.logs) {
            localStorage.setItem('utc_activity_logs', JSON.stringify(data.logs.slice(0, 100)));
          }
          
          setLastSyncTime(new Date().toISOString());
          localStorage.setItem('utc_last_sync', new Date().toISOString());
          console.log('✓ Cloud Data Synchronized');
        }
      } catch (parseError) {
        console.error('JSON Parse Error. Raw response:', text.substring(0, 200));
        if (text.includes("<!DOCTYPE html>") || text.includes("<html")) {
          setSyncError("AUTHENTICATION REQUIRED: The script returned a login page. In Apps Script, go to Deploy > Manage Deployments and set 'Who has access' to 'Anyone'.");
          throw new Error("Target returned HTML (likely a login page). Check deployment settings.");
        }
        setSyncError('Data format mismatch from cloud');
        throw new Error("Invalid Cloud Data: The script is not returning JSON.");
      }
    } catch (e: any) {
      console.error('Fetch Diagnostic:', e);
      let errorMsg = e.message || 'Unknown sync error';
      if (errorMsg === 'Failed to fetch') {
        errorMsg = 'ACCESS DENIED: Browser blocked the request. Ensure "Who has access" is set to "Anyone" in your Apps Script deployment and you have authorized permissions.';
      }
      setSyncError(errorMsg);
    } finally {
      setIsInitialSyncing(false);
    }
  }, [scriptUrl]);

  // Initial data load from cloud
  useEffect(() => {
    if (scriptUrl) {
      refreshCloudData().catch(e => console.error("Initial sync error:", e));
    } else {
      setIsInitialSyncing(false);
    }
  }, [scriptUrl, refreshCloudData]);

  // Auth logic
  const login = async (username: string, password: string, role: UserRole) => {
    try {
      const cleanUsername = username.trim();
      const cleanPassword = password.trim();

      if (!cleanUsername || !cleanPassword) return false;

      // 1. Try matching a registered account first
      const user = users.find(u => 
        u && 
        u.username && 
        u.username.trim() === cleanUsername && 
        u.password === cleanPassword && 
        u.role === role
      );
      
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('utc_current_user', JSON.stringify(user));
        return true;
      }

      // 2. Emergency Fallback: Only allow if NO admins exist in the registered users list
      const hasRegisteredAdmin = users.some(u => u.role === 'admin');
      if (!hasRegisteredAdmin && role === 'admin' && cleanUsername === 'admin' && (cleanPassword === 'admin123' || cleanPassword === '123')) {
        const fallbackAdmin: User = { 
          id: 'sys-admin', 
          username: 'admin', 
          password: cleanPassword,
          name: 'System Administrator', 
          role: 'admin' 
        };
        setCurrentUser(fallbackAdmin);
        localStorage.setItem('utc_current_user', JSON.stringify(fallbackAdmin));
        return true;
      }

      return false;
    } catch (e) {
      console.error("Login logic error:", e);
      throw new Error("Local security check failed. Please refresh.");
    }
  };

  const signup = async (u: Omit<User, 'id'>) => {
    const newUser: User = { ...u, id: uuid() };
    setUsers([...users, newUser]);
    // syncToCloud is triggered by useEffect on users change
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('utc_current_user');
  };

  const updateUser = (u: User) => {
    setUsers(prev => {
      const exists = prev.some(user => user.id === u.id);
      if (exists) {
        return prev.map(user => user.id === u.id ? u : user);
      }
      return [...prev, u];
    });
    
    if (currentUser?.id === u.id) {
       setCurrentUser(u);
       localStorage.setItem('utc_current_user', JSON.stringify(u));
    }
    addLog('USER_UPDATE', `Updated user credentials for ${u.username}`);
  };

  const addLog = (action: string, details: string) => {
    const newLog = {
      timestamp: new Date().toISOString(),
      user: currentUser ? `${currentUser.name} (${currentUser.role})` : 'System',
      action,
      details
    };
    const currentLogs = JSON.parse(localStorage.getItem('utc_activity_logs') || '[]');
    const updatedLogs = [newLog, ...currentLogs].slice(0, 100); // Keep last 100
    localStorage.setItem('utc_activity_logs', JSON.stringify(updatedLogs));
  };

  // Persistence
  useEffect(() => { localStorage.setItem('utc_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('utc_fees', JSON.stringify(fees)); }, [fees]);
  useEffect(() => { localStorage.setItem('utc_expenses', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('utc_attendance', JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { localStorage.setItem('utc_tests', JSON.stringify(tests)); }, [tests]);
  useEffect(() => { localStorage.setItem('utc_testResults', JSON.stringify(testResults)); }, [testResults]);
  useEffect(() => { localStorage.setItem('utc_materials', JSON.stringify(materials)); }, [materials]);
  useEffect(() => { localStorage.setItem('utc_notices', JSON.stringify(notices)); }, [notices]);
  useEffect(() => { localStorage.setItem('utc_due_fees', JSON.stringify(dueFees)); }, [dueFees]);
  useEffect(() => { localStorage.setItem('utc_external_tests', JSON.stringify(externalTests)); }, [externalTests]);
  useEffect(() => { localStorage.setItem('utc_result_links', JSON.stringify(resultLinks)); }, [resultLinks]);
  useEffect(() => { localStorage.setItem('utc_users', JSON.stringify(users)); }, [users]);

  const clearAllData = () => {
    const keys = ['students', 'fees', 'expenses', 'attendance', 'tests', 'testResults', 'materials', 'notices', 'due_fees', 'external_tests', 'result_links', 'users'];
    keys.forEach(k => localStorage.removeItem(`utc_${k}`));
    setStudents([]); setFees([]); setExpenses([]); setAttendance([]); setTests([]); setTestResults([]); setMaterials([]); setNotices([]); setDueFees([]); setExternalTests([]); setResultLinks([]); setUsers([]);
  };

  const addStudent = (s: Omit<Student, 'id' | 'admissionDate' | 'status'>) => {
    const newStudent: Student = { 
      ...s, 
      id: shortId(), 
      admissionDate: new Date().toISOString(), 
      status: 'pending',
      rollNumber: 'N/A'
    };
    setStudents([...students, newStudent]);
    addLog('ADMISSION_REQUEST', `New admission request from ${s.name} for class ${s.class}`);
  };

  const updateStudent = (s: Student) => {
    setStudents(prev => prev.map(st => st.id === s.id ? s : st));
    addLog('STUDENT_UPDATE', `Updated profile/roll number for student: ${s.name}`);
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.map(st => st.id === id ? { ...st, status: 'deleted' } : st));
    setUsers(prev => prev.filter(u => u.id !== id));
    addLog('STUDENT_TRASH', `Moved student record ${id} to trash and revoked system access`);
  };

  const removeStudentPermanently = (id: string) => {
    setStudents(prev => prev.filter(st => st.id !== id));
    setUsers(prev => prev.filter(u => u.id !== id));
    addLog('STUDENT_DELETE', `Permanently deleted student record ${id}`);
  };
  
  const approveStudent = (id: string) => {
    setStudents(prev => prev.map(student => {
      if (student.id === id) {
        const rollNumber = `BTH-${Math.floor(1000 + Math.random() * 9000)}`;
        addLog('ADMISSION_APPROVED', `Approved ${student.name}. Assigned Roll No: ${rollNumber}`);
        
        // Create user account for student
        const studentUser: User = {
          id: student.id,
          username: rollNumber,
          password: rollNumber, // Default password same as roll number
          name: student.name,
          role: 'student'
        };
        setUsers(prevUsers => [...prevUsers, studentUser]);
        
        return { ...student, status: 'approved' as const, rollNumber };
      }
      return student;
    }));
  };
  
  const rejectStudent = (id: string) => {
    setStudents(prev => prev.map(student => {
      if (student.id === id) {
        addLog('ADMISSION_REJECTED', `Rejected admission for ${student.name}`);
        return { ...student, status: 'rejected' as const };
      }
      return student;
    }));
  };

  const addFee = (f: Omit<Fee, 'id'>) => {
    const newFee = { ...f, id: uuid() };
    setFees([...fees, newFee]);
    const studentName = students.find(s => s.id === f.studentId)?.name || 'Unknown';
    addLog('FEE_COLLECTION', `Collected ₹${f.amount} from ${studentName} for ${f.month}`);
  };

  const addExpense = (e: Omit<Expense, 'id'>) => {
    const newExpense = { ...e, id: uuid() };
    setExpenses([...expenses, newExpense]);
  };

  const deleteFee = (id: string) => {
    setFees(prev => prev.filter(f => f.id !== id));
    addLog('FEE_DELETE', `Removed fee record ${id}`);
  };

  const updateFee = (f: Fee) => {
    setFees(prev => prev.map(fe => fe.id === f.id ? f : fe));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(ex => ex.id !== id));
    addLog('EXPENSE_DELETE', `Removed expense record ${id}`);
  };

  const updateExpense = (e: Expense) => {
    setExpenses(prev => prev.map(ex => ex.id === e.id ? e : ex));
  };

  const markAttendance = (date: string, studentId: string, status: 'present' | 'absent') => {
    const existing = attendance.find(a => a.date === date && a.studentId === studentId);
    if (existing) {
      const updated = { ...existing, status };
      setAttendance(attendance.map(a => a.id === existing.id ? updated : a));
    } else {
      const newItem = { id: uuid(), date, studentId, status };
      setAttendance([...attendance, newItem]);
    }
  };

  const addTest = (t: Omit<Test, 'id'>) => {
    const newTest = { ...t, id: uuid() };
    setTests([...tests, newTest]);
  };
  
  const submitTestResult = (r: Omit<TestResult, 'id'>) => {
    const newResult = { ...r, id: uuid() };
    setTestResults([...testResults, newResult]);
  };

  const addMaterial = (m: Omit<StudyMaterial, 'id' | 'uploadDate'>) => {
    const newItem = { ...m, id: uuid(), uploadDate: new Date().toISOString() };
    setMaterials([...materials, newItem]);
  };

  const deleteMaterial = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
  };

  const deleteNotice = (id: string) => {
    setNotices(prev => prev.filter(n => n.id !== id));
  };

  const deleteTest = (id: string) => {
    setTests(prev => prev.filter(t => t.id !== id));
  };

  const addNotice = (n: Omit<Notice, 'id' | 'date'>) => {
    const newNotice = { ...n, id: uuid(), date: new Date().toISOString() };
    setNotices([...notices, newNotice]);
  };

  const addDueFee = (df: Omit<DueFee, 'id' | 'date'>) => {
    const newDueFee = { ...df, id: uuid(), date: new Date().toISOString() };
    setDueFees([...dueFees, newDueFee]);
    const studentName = students.find(s => s.id === df.studentId)?.name || 'Unknown';
    addLog('DUE_FEE_ADDED', `Added due amount of ₹${df.amount} for ${studentName}: ${df.remarks}`);
  };

  const updateDueFee = (df: DueFee) => {
    setDueFees(prev => prev.map(item => item.id === df.id ? df : item));
    addLog('DUE_FEE_UPDATE', `Updated due amount for student ${df.id}`);
  };

  const deleteDueFee = (id: string) => {
    setDueFees(prev => prev.filter(item => item.id !== id));
    addLog('DUE_FEE_DELETE', `Removed due record ${id}`);
  };

  const addExternalTest = (t: Omit<ExternalTest, 'id' | 'date'>) => {
    const newTest = { ...t, id: uuid(), date: new Date().toISOString() };
    setExternalTests([...externalTests, newTest]);
    addLog('EXTERNAL_TEST_ADDED', `Added new external test link: ${t.title}`);
  };

  const deleteExternalTest = (id: string) => {
    setExternalTests(prev => prev.filter(item => item.id !== id));
    addLog('EXTERNAL_TEST_DELETED', `Deleted external test link ${id}`);
  };

  const addResultLink = (t: Omit<ResultLink, 'id' | 'date'>) => {
    const newResult = { ...t, id: uuid(), date: new Date().toISOString() };
    setResultLinks([...resultLinks, newResult]);
    addLog('RESULT_ADDED', `Added new result link: ${t.title}`);
  };

  const deleteResultLink = (id: string) => {
    setResultLinks(prev => prev.filter(item => item.id !== id));
    addLog('RESULT_DELETED', `Deleted result link ${id}`);
  };

  return (
    <StorageContext.Provider value={{
      students, fees, expenses, attendance, tests, testResults, materials, notices, dueFees, externalTests, resultLinks, users, currentUser,
      login, signup, logout, refreshCloudData, updateUser,
      scriptUrl, syncError, isInitialSyncing,
      addStudent, updateStudent, deleteStudent, removeStudentPermanently, approveStudent, rejectStudent,
      addFee, updateFee, deleteFee, addExpense, updateExpense, deleteExpense, markAttendance,
      addTest, deleteTest, submitTestResult, addMaterial, deleteMaterial, addNotice, deleteNotice, 
      addDueFee, updateDueFee, deleteDueFee, addExternalTest, deleteExternalTest, addResultLink, deleteResultLink, clearAllData, addLog
    }}>
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = () => {
  const context = useContext(StorageContext);
  if (!context) throw new Error('useStorage must be used within StorageProvider');
  return context;
};
