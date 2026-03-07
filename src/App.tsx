import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Menu, Key } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import CreateMusic from './pages/CreateMusic';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen bg-background-dark items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function AppContent() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      try {
        if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasKey(selected);
        } else {
          setHasKey(true); // Fallback if not in AI Studio
        }
      } catch (e) {
        console.error('Failed to check API key', e);
        setHasKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    try {
      if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        await window.aistudio.openSelectKey();
        setHasKey(true); // Assume success to mitigate race condition
      }
    } catch (e) {
      console.error('Failed to open key selector', e);
    }
  };

  if (hasKey === false) {
    return (
      <div className="flex h-screen bg-background-dark text-slate-100 font-display items-center justify-center p-4">
        <div className="bg-surface-dark border border-border-dark rounded-xl p-8 max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key size={32} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-white">API Key Required</h2>
          <p className="text-slate-400">
            To use the Gemini Music Generation models, you need to provide your own Google Cloud API key with billing enabled.
          </p>
          <p className="text-xs text-slate-500">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-primary hover:underline">
              Learn more about billing
            </a>
          </p>
          <button
            onClick={handleSelectKey}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg shadow-lg shadow-primary/20 transition-all transform active:scale-[0.99]"
          >
            Select API Key
          </button>
        </div>
      </div>
    );
  }

  if (hasKey === null) {
    return <div className="flex h-screen bg-background-dark items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={
          <ProtectedRoute>
            <div className="flex h-screen bg-background-dark text-slate-100 font-display overflow-hidden">
              <Sidebar 
                isCollapsed={isSidebarCollapsed} 
                setIsCollapsed={setIsSidebarCollapsed}
                isMobileOpen={isMobileSidebarOpen}
                setIsMobileOpen={setIsMobileSidebarOpen}
              />
              <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center p-4 border-b border-border-dark bg-surface-darker shrink-0">
                  <button 
                    onClick={() => setIsMobileSidebarOpen(true)} 
                    className="p-2 -ml-2 mr-2 text-slate-400 hover:text-white"
                  >
                    <Menu size={24} />
                  </button>
                  <h1 className="font-bold text-white">Gemini Studio</h1>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/create" element={<CreateMusic />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </main>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
