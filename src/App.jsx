import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import Auth from './components/Auth';
import WebsitePage from './pages/Website/WebsitePage';
import FamilyTreePage from './pages/FamilyTree/FamilyTreePage';
import { LanguageProvider } from './context/LanguageContext';

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Auth />;
  }

  return children;
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <LanguageProvider>
    <AuthProvider>
      <AlertProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<WebsitePage />} />
          <Route
            path="/family-tree"
            element={
              <ProtectedRoute>
                <FamilyTreePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AlertProvider>
    </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
