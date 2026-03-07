import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import CreateMusic from './pages/CreateMusic';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <Router>
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
    </Router>
  );
}
