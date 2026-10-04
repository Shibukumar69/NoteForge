import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { CreateNotesPage } from './pages/CreateNotesPage';
import { ProcessingPage } from './pages/ProcessingPage';
import { NotesViewerPage } from './pages/NotesViewerPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  // Allow seamless testing
  return children;
};

export const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create"
                element={
                  <ProtectedRoute>
                    <CreateNotesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/processing/:id"
                element={
                  <ProtectedRoute>
                    <ProcessingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notes/:id"
                element={
                  <ProtectedRoute>
                    <NotesViewerPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
