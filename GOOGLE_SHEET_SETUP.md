# BTH Management Cloud-First Integration

Your application is configured for **Real-Time Data Mirroring** to Google Sheets. All records (including **Student Remarks**, Fees, Attendance, Tests, and Students) sync directly to your spreadsheet.

## Connected Sheets
The Google Apps Script automatically creates and manages these sheet tabs:
1. **Approved Students** — Registered active students
2. **Pending Admissions** — Pending admission requests
3. **Deleted Students** — Archived/deleted student records
4. **Student Remarks** — Academic, appreciation, and behavioral remarks/feedback
5. **Fees** — Fee collection and payment receipts
6. **Expenses** — Institutional expenses and operational costs
7. **Attendance** — Daily student attendance records
8. **Online Test** — Scheduled tests and question banks
9. **Test Results** — Student test submissions and scores
10. **Study Materials** — Uploaded resource links and documents
11. **Notice** — Broadcast announcements and circulars
12. **Due Fees** — Pending fee reminders and amounts
13. **User** — Admin and student credentials
14. **Exam Portal & Results** — External examination links and scorecards
15. **UI Activity Logs & System Logs** — Real-time event audits

---

## Updating Existing Google Sheet (To add "Student Remarks" Tab)

If your Google Sheet does not yet show the **"Student Remarks"** tab:

1. Open your existing Google Sheet.
2. In the top menu, click **Extensions > Apps Script**.
3. Replace all existing script code with the code from `/BACKEND_SETUP.gs` (or copy it from **Settings > Backend Script** inside the app).
4. Click the **Save (floppy disk)** icon.
5. In the top right, click **Deploy > Manage deployments**.
6. Click the **Edit (pencil)** icon next to your active Web App deployment.
7. In the **Version** dropdown, select **New version**.
8. Click **Deploy**.
9. Return to the BTH application (under **Student Remarks** or **Settings**) and click **"Force Cloud Sync"** or **"Sync Remarks to Google Sheet"**.
10. Refresh your Google Sheet — the **"Student Remarks"** sheet tab will now be created with all student remarks, names, roll numbers, and categories!

---

## Phase 1: New Sheet Setup (First-Time Setup)
1. Create a **New Google Sheet** at [sheets.new](https://sheets.new).
2. Go to **Extensions > Apps Script**.
3. Delete all existing code and paste the content of `/BACKEND_SETUP.gs`.
4. Click **Save** and name the project "BTH_Backend".

## Phase 2: Deployment (CRITICAL)
1. Click **Deploy > New deployment**.
2. Select **Web app**.
3. **Description**: "BTH Production v2"
4. **Execute as**: **Me (Your email)**.
5. **Who has access**: **Anyone** (required so the application can sync).
6. Click **Deploy** and **Authorize Access**.
7. Copy the **Web App URL**.

## Phase 3: Activating the Bridge
1. Open the application.
2. The Web App URL is connected to the backend synchronization bridge.
3. Every remark, fee collection, attendance record, and admission update will automatically synchronize.
