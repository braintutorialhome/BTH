import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { StorageProvider, useStorage } from './hooks/useStorage';
import PublicHome from './pages/public/Home';
import AdmissionForm from './pages/public/AdmissionForm';
import Login from './pages/public/Login';
import AdminDashboard from './pages/admin/Dashboard';
import StudentDashboard from './pages/student/Dashboard';
import { UserRole } from './types';

// Simple Auth Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRole: UserRole }> = ({ children, allowedRole }) => {
  const { currentUser } = useStorage();
  
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== allowedRole) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

export default function App() {
  return (
    <StorageProvider>
      <HashRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicHome />} />
          <Route path="/admission" element={<AdmissionForm />} />
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Student Routes */}
          <Route path="/student/*" element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </StorageProvider>
  );
}
