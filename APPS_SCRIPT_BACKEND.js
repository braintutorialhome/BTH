/**
 * Brain Tutorial Home Management System - Apps Script BACKEND
 * 
 * This script allows your App to send data directly to this sheet.
 */

function doPost(e) {
  const logSheet = getOrCreateSheet("System_Logs");
  
  try {
    const payload = JSON.parse(e.postData.contents);
    const { action, type, data } = payload;
    
    // Support both real-time actions and full backups
    if (action === "ADD_STUDENT") {
      addRow("Students", [data.id, data.name, data.fatherName, data.dob, data.gender, data.subject, data.class, data.semester, data.mobile, data.address, data.admissionDate, data.status, data.rollNumber || 'N/A']);
      return success({"message": "Student synced"});
    }

    if (action === "UPDATE_STUDENT") {
      updateRow("Students", data.id, [data.id, data.name, data.fatherName, data.dob, data.gender, data.subject, data.class, data.semester, data.mobile, data.address, data.admissionDate, data.status, data.rollNumber || 'N/A']);
      return success({"message": "Student updated"});
    }

    if (action === "DELETE_STUDENT") {
      deleteRow("Students", data.id);
      return success({"message": "Student deleted"});
    }
    
    if (action === "ADD_FEE") {
      addRow("Fees", [data.id, data.studentId, data.amount, data.date, data.status, data.month]);
      return success({"message": "Fee synced"});
    }

    if (action === "UPDATE_FEE") {
      updateRow("Fees", data.id, [data.id, data.studentId, data.amount, data.date, data.status, data.month]);
      return success({"message": "Fee updated"});
    }

    if (action === "DELETE_FEE") {
      deleteRow("Fees", data.id);
      return success({"message": "Fee deleted"});
    }
    
    if (action === "ADD_EXPENSE") {
      addRow("Expenses", [data.id, data.title, data.amount, data.date, data.category, data.description || '']);
      return success({"message": "Expense synced"});
    }

    if (action === "UPDATE_EXPENSE") {
      updateRow("Expenses", data.id, [data.id, data.title, data.amount, data.date, data.category, data.description || '']);
      return success({"message": "Expense updated"});
    }

    if (action === "DELETE_EXPENSE") {
      deleteRow("Expenses", data.id);
      return success({"message": "Expense deleted"});
    }

    if (action === "ADD_USER") {
      addRow("Users", [data.id, data.username, data.password, data.role, data.name]);
      return success({"message": "User registered"});
    }

    if (action === "ADD_NOTICE") {
      addRow("Notices", [data.id, data.title, data.content, data.date, data.isImportant]);
      return success({"message": "Notice added"});
    }

    if (action === "DELETE_NOTICE") {
      deleteRow("Notices", data.id);
      return success({"message": "Notice deleted"});
    }

    if (action === "ADD_MATERIAL") {
      addRow("Materials", [data.id, data.title, data.type, data.url, data.uploadDate, data.description || '']);
      return success({"message": "Material added"});
    }

    if (action === "DELETE_MATERIAL") {
      deleteRow("Materials", data.id);
      return success({"message": "Material deleted"});
    }

    if (action === "ADD_TEST") {
      addRow("Tests", [data.id, data.title, data.description, JSON.stringify(data.questions), data.durationMinutes]);
      return success({"message": "Test added"});
    }

    if (action === "DELETE_TEST") {
      deleteRow("Tests", data.id);
      return success({"message": "Test deleted"});
    }

    if (action === "ADD_TEST_RESULT") {
      addRow("TestResults", [data.id, data.testId, data.studentId, data.score, data.totalQuestions, data.date]);
      return success({"message": "Test Result added"});
    }

    if (action === "MARK_ATTENDANCE") {
      addRow("Attendance", [data.id, data.date, data.studentId, data.status]);
      return success({"message": "Attendance marked"});
    }
    
    if (type === "BACKUP") {
      updateBackupSheets(data);
      return success({"message": "Full backup synchronized"});
    }
    
    return error("Unknown action: " + action);
    
  } catch (err) {
    logSheet.appendRow([new Date(), "ERROR", err.toString()]);
    return error(err.toString());
  }
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
      break;
    }
  }
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

function updateBackupSheets(data) {
  const { students, fees, expenses, users, notices, materials, tests, testResults, attendance } = data;
  
  // 1. Update Students
  const sSheet = getOrCreateSheet("Students");
  sSheet.clear();
  sSheet.appendRow(['ID', 'Name', 'Father Name', 'DOB', 'Gender', 'Subject', 'Class', 'Semester', 'Mobile', 'Address', 'Admission Date', 'Status', 'Roll Number']);
  if (students && students.length > 0) {
    const rows = students.map(s => [s.id, s.name, s.fatherName, s.dob, s.gender, s.subject, s.class, s.semester, s.mobile, s.address, s.admissionDate, s.status, s.rollNumber || 'N/A']);
    sSheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
  
  // 2. Update Fees
  const fSheet = getOrCreateSheet("Fees");
  fSheet.clear();
  fSheet.appendRow(['ID', 'Student ID', 'Amount', 'Date', 'Status', 'Month']);
  if (fees && fees.length > 0) {
    const rows = fees.map(f => [f.id, f.studentId, f.amount, f.date, f.status, f.month]);
    fSheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }

  // 3. Update Expenses
  const eSheet = getOrCreateSheet("Expenses");
  eSheet.clear();
  eSheet.appendRow(['ID', 'Title', 'Amount', 'Date', 'Category', 'Description']);
  if (expenses && expenses.length > 0) {
    const rows = expenses.map(e => [e.id, e.title, e.amount, e.date, e.category, e.description || '']);
    eSheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }

  // 4. Update Users
  if (users && users.length > 0) {
    const uSheet = getOrCreateSheet("Users");
    uSheet.clear();
    uSheet.appendRow(['ID', 'Username', 'Password', 'Role', 'Name']);
    const rows = users.map(u => [u.id, u.username, u.password, u.role, u.name]);
    uSheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }

  // 5. Update Notices
  const nSheet = getOrCreateSheet("Notices");
  nSheet.clear();
  nSheet.appendRow(['ID', 'Title', 'Content', 'Date', 'Important']);
  if (notices && notices.length > 0) {
    const rows = notices.map(n => [n.id, n.title, n.content, n.date, n.isImportant]);
    nSheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }

  // 6. Update Materials
  const mSheet = getOrCreateSheet("Materials");
  mSheet.clear();
  mSheet.appendRow(['ID', 'Title', 'Type', 'URL', 'Upload Date', 'Description']);
  if (materials && materials.length > 0) {
    const rows = materials.map(m => [m.id, m.title, m.type, m.url, m.uploadDate, m.description || '']);
    mSheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }

  // 7. Update Tests
  const tSheet = getOrCreateSheet("Tests");
  tSheet.clear();
  tSheet.appendRow(['ID', 'Title', 'Description', 'Questions (JSON)', 'Duration']);
  if (tests && tests.length > 0) {
    const rows = tests.map(t => [t.id, t.title, t.description, JSON.stringify(t.questions), t.durationMinutes]);
    tSheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }

  // 8. Update TestResults
  const trSheet = getOrCreateSheet("TestResults");
  trSheet.clear();
  trSheet.appendRow(['ID', 'Test ID', 'Student ID', 'Score', 'Total Questions', 'Date']);
  if (testResults && testResults.length > 0) {
    const rows = testResults.map(tr => [tr.id, tr.testId, tr.studentId, tr.score, tr.totalQuestions, tr.date]);
    trSheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }

  // 9. Update Attendance
  const aSheet = getOrCreateSheet("Attendance");
  aSheet.clear();
  aSheet.appendRow(['ID', 'Date', 'Student ID', 'Status']);
  if (attendance && attendance.length > 0) {
    const rows = attendance.map(a => [a.id, a.date, a.studentId, a.status]);
    aSheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
}

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === "Students") sheet.appendRow(['ID', 'Name', 'Father Name', 'DOB', 'Gender', 'Subject', 'Class', 'Semester', 'Mobile', 'Address', 'Admission Date', 'Status', 'Roll Number']);
    if (name === "Fees") sheet.appendRow(['ID', 'Student ID', 'Amount', 'Date', 'Status', 'Month']);
    if (name === "Expenses") sheet.appendRow(['ID', 'Title', 'Amount', 'Date', 'Category', 'Description']);
    if (name === "Users") sheet.appendRow(['ID', 'Username', 'Password', 'Role', 'Name']);
    if (name === "Notices") sheet.appendRow(['ID', 'Title', 'Content', 'Date', 'Important']);
    if (name === "Materials") sheet.appendRow(['ID', 'Title', 'Type', 'URL', 'Upload Date', 'Description']);
    if (name === "Tests") sheet.appendRow(['ID', 'Title', 'Description', 'Questions (JSON)', 'Duration']);
    if (name === "TestResults") sheet.appendRow(['ID', 'Test ID', 'Student ID', 'Score', 'Total Questions', 'Date']);
    if (name === "Attendance") sheet.appendRow(['ID', 'Date', 'Student ID', 'Status']);
  }
  return sheet;
}

function success(payload) {
  return ContentService.createTextOutput(JSON.stringify({"status": "success", ...payload}))
    .setMimeType(ContentService.MimeType.JSON);
}

function error(msg) {
  return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": msg}))
    .setMimeType(ContentService.MimeType.JSON);
}

// Full Data Fetch
function doGet() {
  const students = getSheetData("Students", ['id', 'name', 'fatherName', 'dob', 'gender', 'subject', 'class', 'semester', 'mobile', 'address', 'admissionDate', 'status', 'rollNumber']);
  const fees = getSheetData("Fees", ['id', 'studentId', 'amount', 'date', 'status', 'month']);
  const expenses = getSheetData("Expenses", ['id', 'title', 'amount', 'date', 'category', 'description']);
  const users = getSheetData("Users", ['id', 'username', 'password', 'role', 'name']);
  const notices = getSheetData("Notices", ['id', 'title', 'content', 'date', 'isImportant']);
  const materials = getSheetData("Materials", ['id', 'title', 'type', 'url', 'uploadDate', 'description']);
  const tests = getSheetData("Tests", ['id', 'title', 'description', 'questions', 'durationMinutes']);
  const testResults = getSheetData("TestResults", ['id', 'testId', 'studentId', 'score', 'totalQuestions', 'date']);
  const attendance = getSheetData("Attendance", ['id', 'date', 'studentId', 'status']);
  
  // Post-process JSON fields
  const processedTests = tests.map(t => {
    try {
      return { ...t, questions: JSON.parse(t.questions) };
    } catch(e) {
      return { ...t, questions: [] };
    }
  });

  return ContentService.createTextOutput(JSON.stringify({
    students, fees, expenses, users, notices, materials, tests: processedTests, testResults, attendance
  })).setMimeType(ContentService.MimeType.JSON);
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
