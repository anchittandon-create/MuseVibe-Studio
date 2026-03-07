import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import CreateMusic from './pages/CreateMusic';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <Router>
      <div className="flex h-screen bg-background-dark text-slate-100 font-display overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateMusic />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
