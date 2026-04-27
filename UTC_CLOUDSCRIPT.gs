/**
 * Brain Tutorial Home Management System - CLOUD CORE ENGINE v2.0
 * 
 * INSTRUCTIONS:
 * 1. Create a Google Sheet.
 * 2. Extensions > Apps Script.
 * 3. Delete all code and paste THIS code.
 * 4. Deploy > New Deployment > Web App.
 * 5. Set "Execute as: Me" and "Access: Anyone".
 * 6. Copy the URL to your app.
 */

const CONFIG = {
  VERSION: "2.1.0",
  SHEETS: {
    STUDENTS_ALL: "Students_Master",
    STUDENTS_APPROVED: "Approved_Students",
    STUDENTS_PENDING: "Pending_Admissions",
    FEES: "Fees",
    EXPENSES: "Expenses",
    ATTENDANCE: "Attendance",
    TESTS: "Tests",
    RESULTS: "TestResults",
    MATERIALS: "Materials",
    NOTICES: "Notices",
    USERS: "Users",
    LOGS: "System_Logs",
    ACTIVITY: "UI_Activity_Logs"
  }
};

function doPost(e) {
  const logSheet = getOrCreateSheet(CONFIG.SHEETS.LOGS);
  
  try {
    const payload = JSON.parse(e.postData.contents);
    const { action, type, data } = payload;
    
    if (type === "BACKUP") {
      updateBackupSheets(data);
      return success({"message": "Full cloud backup successful"});
    }
    
    return error("Unknown gateway action: " + action);
    
  } catch (err) {
    logSheet.appendRow([new Date(), "POST_ERROR", err.toString()]);
    return error(err.toString());
  }
}

function updateBackupSheets(data) {
  const { students, approvedStudents, pendingAdmissions, fees, expenses, users, notices, materials, tests, testResults, attendance, logs } = data;
  
  const studentHeaders = ['ID', 'Name', 'Father Name', 'DOB', 'Gender', 'Subject', 'Class', 'Semester', 'Mobile', 'Address', 'Admission Date', 'Status', 'Roll Number'];
  const studentMapper = s => [s.id, s.name, s.fatherName, s.dob, s.gender, s.subject, s.class, s.semester, s.mobile, s.address, s.admissionDate, s.status, s.rollNumber || 'N/A'];

  // 1. Students Master
  syncSheet(CONFIG.SHEETS.STUDENTS_ALL, studentHeaders, students, studentMapper);
  
  // 1b. Approved Students
  syncSheet(CONFIG.SHEETS.STUDENTS_APPROVED, studentHeaders, approvedStudents, studentMapper);

  // 1c. Pending Admissions
  syncSheet(CONFIG.SHEETS.STUDENTS_PENDING, studentHeaders, pendingAdmissions, studentMapper);

  // 2. Fees (Enriched with Student Name)
  syncSheet(CONFIG.SHEETS.FEES, ['ID', 'Student ID', 'Student Name', 'Amount', 'Date', 'Status', 'Month'], 
    fees, f => [f.id, f.studentId, f.studentName || 'N/A', f.amount, f.date, f.status, f.month]);

  // 3. Expenses
  syncSheet(CONFIG.SHEETS.EXPENSES, ['ID', 'Title', 'Amount', 'Date', 'Category', 'Description'], 
    expenses, e => [e.id, e.title, e.amount, e.date, e.category, e.description || '']);

  // 4. Users
  syncSheet(CONFIG.SHEETS.USERS, ['ID', 'Username', 'Password', 'Role', 'Name'], 
    users, u => [u.id, u.username, u.password, u.role, u.name]);

  // 5. Notices
  syncSheet(CONFIG.SHEETS.NOTICES, ['ID', 'Title', 'Content', 'Date', 'Important'], 
    notices, n => [n.id, n.title, n.content, n.date, n.isImportant]);

  // 6. Materials
  syncSheet(CONFIG.SHEETS.MATERIALS, ['ID', 'Title', 'Type', 'URL', 'Upload Date', 'Description'], 
    materials, m => [m.id, m.title, m.type, m.url, m.uploadDate, m.description || '']);

  // 7. Tests
  syncSheet(CONFIG.SHEETS.TESTS, ['ID', 'Title', 'Description', 'Questions (JSON)', 'Duration'], 
    tests, t => [t.id, t.title, t.description, JSON.stringify(t.questions), t.durationMinutes]);

  // 8. Results
  syncSheet(CONFIG.SHEETS.RESULTS, ['ID', 'Test ID', 'Student ID', 'Student Name', 'Score', 'Total Questions', 'Date'], 
    testResults, tr => [tr.id, tr.testId, tr.studentId, tr.studentName || 'N/A', tr.score, tr.totalQuestions, tr.date]);

  // 9. Attendance (Enriched with Student Name)
  syncSheet(CONFIG.SHEETS.ATTENDANCE, ['ID', 'Date', 'Student ID', 'Student Name', 'Status'], 
    attendance, a => [a.id, a.date, a.studentId, a.studentName || 'N/A', a.status]);

  // 10. UI Activity Logs
  syncSheet(CONFIG.SHEETS.ACTIVITY, ['Timestamp', 'User', 'Action', 'Details'], 
    logs, l => [l.timestamp, l.user, l.action, l.details]);
}

function syncSheet(name, headers, items, mapFn) {
  const sheet = getOrCreateSheet(name);
  sheet.clear();
  sheet.appendRow(headers);
  if (items && items.length > 0) {
    const rows = items.map(mapFn);
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
}

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function addRow(sheetName, values) {
  const sheet = getOrCreateSheet(sheetName);
  sheet.appendRow(values);
}

function updateRow(sheetName, id, values) {
  const sheet = getOrCreateSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.getRange(i + 1, 1, 1, values.length).setValues([values]);
      return;
    }
  }
  sheet.appendRow(values); // Fallback to add if not found
}

function deleteRow(sheetName, id) {
  const sheet = getOrCreateSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
}

function doGet() {
  const output = {
    status: "online",
    version: CONFIG.VERSION,
    students: getSheetData(CONFIG.SHEETS.STUDENTS_ALL, ['id', 'name', 'fatherName', 'dob', 'gender', 'subject', 'class', 'semester', 'mobile', 'address', 'admissionDate', 'status', 'rollNumber']),
    fees: getSheetData(CONFIG.SHEETS.FEES, ['id', 'studentId', 'studentName', 'amount', 'date', 'status', 'month']),
    expenses: getSheetData(CONFIG.SHEETS.EXPENSES, ['id', 'title', 'amount', 'date', 'category', 'description']),
    users: getSheetData(CONFIG.SHEETS.USERS, ['id', 'username', 'password', 'role', 'name']),
    notices: getSheetData(CONFIG.SHEETS.NOTICES, ['id', 'title', 'content', 'date', 'isImportant']),
    materials: getSheetData(CONFIG.SHEETS.MATERIALS, ['id', 'title', 'type', 'url', 'uploadDate', 'description']),
    tests: getSheetData(CONFIG.SHEETS.TESTS, ['id', 'title', 'description', 'questions', 'durationMinutes']),
    testResults: getSheetData(CONFIG.SHEETS.RESULTS, ['id', 'testId', 'studentId', 'studentName', 'score', 'totalQuestions', 'date']),
    attendance: getSheetData(CONFIG.SHEETS.ATTENDANCE, ['id', 'date', 'studentId', 'studentName', 'status'])
  };
  
  // Parse JSON fields
  output.tests = output.tests.map(t => {
    try {
      return { ...t, questions: JSON.parse(t.questions) };
    } catch(e) {
      return { ...t, questions: [] };
    }
  });

  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheetData(name, keys) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
    if (!sheet) return [];
    const values = sheet.getDataRange().getValues();
    if (values.length <= 1) return [];
    
    return values.slice(1).map(row => {
      let obj = {};
      keys.forEach((key, i) => {
        obj[key] = row[i];
      });
      return obj;
    });
  } catch (e) {
    return [];
  }
}

function success(payload) {
  return ContentService.createTextOutput(JSON.stringify({"status": "success", ...payload}))
    .setMimeType(ContentService.MimeType.JSON);
}

function error(msg) {
  return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": msg}))
    .setMimeType(ContentService.MimeType.JSON);
}
