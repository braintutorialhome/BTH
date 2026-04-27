# BTH Management Cloud-First Integration

Your application is now configured for **Real-Time Data Mirroring** to Google Sheets. This replaces manual backups with a direct data pipeline.

## Phase 1: Sheet Preparation
1.  Create a **New Google Sheet**.
2.  Go to **Extensions > Apps Script**.
3.  Delete all existing code and paste the content of `/APPS_SCRIPT_BACKEND.js`.
4.  **Save** the project as "BTH_Cloud_Core".

## Phase 2: Deployment (CRITICAL)
1.  Click **Deploy > New deployment**.
2.  Select **Web app**.
3.  **Execute as**: Me (Your email).
4.  **Who has access**: **Anyone**.
5.  Click **Deploy** and **Authorize Access**.
6.  **COPY the "Web App URL"**.

**NOTE**: If you update the code later, you MUST go to **Deploy > Manage deployments**, click the **Edit (pencil)** icon, select **New version**, and then click **Deploy** to apply changes to the existing URL.

## Phase 3: Activating the Bridge
1.  Log in to your BTH Web App.
2.  Go to the **Operations Center (Home)**.
3.  Paste the URL into the **Apps Script Web App URL** field.
4.  The system will transition to "Active" mode.
5.  **Initial Sync**: Click "Test & Backup" (one time) to push your existing records to the cloud.

## Phase 4: User Authentication
- **Admin Setup**: Create your first admin account using the **"Register Identity"** toggle on the Login page. Set the role to **Root**.
- **Student Access**: Students can now register themselves. Their access to the **Student Dashboard** is granted automatically once an Admin **approves** their admission in the "Admission Panel".
- **Real-Time Visibility**: Every fee payment, expense record, and new admission is sent to your Google Sheet the moment it occurs.
