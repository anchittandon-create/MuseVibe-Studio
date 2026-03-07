import { NavLink } from 'react-router-dom';
import { Home, Music, LayoutDashboard, Settings, Folder, BarChart } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-surface-darker border-r border-border-dark flex flex-col shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold text-xl">
            G
          </div>
          <div>
            <h1 className="text-white text-base font-bold leading-tight">Gemini Studio</h1>
            <p className="text-slate-400 text-xs font-medium">Pro Plan</p>
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary/20 text-white border border-primary/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`
            }
          >
            <Home size={20} />
            <span className="text-sm font-medium">Home</span>
          </NavLink>
          <NavLink
            to="/create"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary/20 text-white border border-primary/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`
            }
          >
            <Music size={20} />
            <span className="text-sm font-medium">Create Music</span>
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary/20 text-white border border-primary/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`
            }
          >
            <LayoutDashboard size={20} />
            <span className="text-sm font-medium">Dashboard</span>
          </NavLink>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer mt-4">
            <Folder size={20} />
            <span className="text-sm font-medium">Projects</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
            <BarChart size={20} />
            <span className="text-sm font-medium">Analytics</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
            <Settings size={20} />
            <span className="text-sm font-medium">Settings</span>
          </div>
        </nav>
      </div>
      <div className="mt-auto p-6 border-t border-border-dark">
        <div className="bg-surface-dark rounded-xl p-4 border border-border-dark">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400 font-medium">Storage Used</span>
            <span className="text-xs text-white font-bold">75%</span>
          </div>
          <div className="w-full bg-border-dark rounded-full h-1.5">
            <div className="bg-primary h-1.5 rounded-full" style={{ width: '75%' }}></div>
          </div>
          <button className="w-full mt-4 py-2 text-xs font-medium text-white bg-border-dark hover:bg-white/10 rounded-lg transition-colors">
            Upgrade Plan
          </button>
        </div>
      </div>
    </aside>
  );
}
