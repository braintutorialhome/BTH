# Brain Tutorial Home - Coaching Management System

Brain Tutorial Home is a comprehensive coaching center management system designed to streamline student admissions, fee tracking, attendance, study materials, and online tests. Built with React, Tailwind CSS, and powered by Google Sheets as a lightweight backend.

## 🚀 Features

### For Admins
- **Dashboard**: High-level overview of students, fees, and attendance.
- **Student Management**: Register, view, and manage student profiles.
- **Admissions**: Process new admission requests.
- **Attendance Tracking**: Monitor daily student attendance.
- **Fee Management**: Track payments, pending fees, and generate reports.
- **Study Materials**: Upload and organize learning resources.
- **Tests & Results**: Manage online tests and publish results.
- **Notices**: Broadcast important announcements to students.

### For Students
- **Personal Dashboard**: View upcoming tests, notices, and progress.
- **Profile**: Keep personal information up to date.
- **Material Hub**: Access study materials shared by teachers.
- **Online Tests**: Participate in assessments directly from the portal.
- **Fee Status**: Check payment history and pending dues.

## 🛠️ Technology Stack
- **Frontend**: React 19 (Vite, TypeScript)
- **Styling**: Tailwind CSS 4 (Glassmorphism UI)
- **Animations**: Motion (formerly Framer Motion)
- **Backend**: Google Sheets API (via Apps Script)
- **AI**: Google Gemini API (integrated for smart features)

## 📦 Setup & Installation

### 1. Google Sheets Backend
This app uses Google Sheets as a database. 
1. Follow the instructions in [GOOGLE_SHEET_SETUP.md](./GOOGLE_SHEET_SETUP.md) to set up your sheet.
2. Deploy the [APPS_SCRIPT_BACKEND.js](./APPS_SCRIPT_BACKEND.js) as a Web App.

### 2. Environment Variables
Create a `.env` file based on `.env.example`:
```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

### 3. Development
```bash
npm install
npm run dev
```

## 📄 License
MIT
