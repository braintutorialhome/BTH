// ==========================================
// GOOGLE APPS SCRIPT FOR BRAIN TUTORIAL HOME
// ==========================================
// 1. Open Google Sheets (sheets.new)
// 2. Go to Extensions > Apps Script
// 3. Delete any existing code and paste this
// 4. Click "Deploy" > "New Deployment"
//    - Select "Web App"
//    - Description: "BTH Backend v1"
//    - Execute as: "Me"
//    - Who has access: "Anyone"
// 5. Authorize permissions when prompted
// 6. Copy the "Web App URL" and paste into useStorage.tsx
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
          // Handle dates
          if (val instanceof Date) val = val.toISOString();
          // Handle potential JSON strings
          if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
             try { val = JSON.parse(val); } catch(e) {}
          }
          obj[header] = val;
        });
        return obj;
      });
    };

    // Construct the response object
    // We map the database keys to the sheet names
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
    data.externalTests = getSheetData(SHEETS.EXAM_PORTAL); // Map 'Exam Portal' sheet to 'externalTests'
    data.resultLinks = getSheetData(SHEETS.RESULTS);
    data.materials = getSheetData(SHEETS.MATERIALS);
    data.tests = getSheetData(SHEETS.ONLINE_TESTS);
    data.testResults = getSheetData(SHEETS.TEST_RESULTS);
    data.attendance = getSheetData(SHEETS.ATTENDANCE);
    data.users = getSheetData(SHEETS.USERS);
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

    if (action === "SYNC_ALL" && data) {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      
      // Helper to clear and write sheet
      const writeToSheet = (sheetName, items) => {
        let sheet = ss.getSheetByName(sheetName);
        if (!sheet) {
          sheet = ss.insertSheet(sheetName);
        } else {
          sheet.clear();
        }
        
        if (!items || items.length === 0) return;
        
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

      // Perform sync for all sheets
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
      writeToSheet(SHEETS.LOGS, data.logs);
      
      // Background log
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
}
