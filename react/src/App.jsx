import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Settings from './components/Settings';
import CircularEditor from './components/CircularEditor';
import ApprovedDocuments from './components/ApprovedDocuments';
import './styles.css';

export default function App() {
  useEffect(() => {
    const applyTheme = () => {
      const theme = localStorage.getItem('app_theme') || 'light';
      if (theme === 'dark') {
        document.documentElement.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-mode');
      }
    };
    applyTheme();
    // Listen for changes from Settings page
    window.addEventListener('theme-changed', applyTheme);
    return () => window.removeEventListener('theme-changed', applyTheme);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login/:role" element={<Login />} />
        
        <Route element={<Layout />}>
          <Route path="/:role/dashboard" element={<Dashboard />} />
          <Route path="/approved" element={<ApprovedDocuments />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/staff/circular/new" element={<CircularEditor />} />
          <Route path="/staff/circular/edit/:id" element={<CircularEditor />} />
          <Route path="/hod/circular/edit/:id" element={<CircularEditor editorRole="hod" />} />
          <Route path="/hod/circular/:id/review" element={<CircularEditor isReview={true} editorRole="hod" />} />
          <Route path="/principal/circular/:id/approval" element={<CircularEditor isReview={true} editorRole="principal" />} />
          <Route path="/circular/:id" element={<CircularEditor isViewOnly={true} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
