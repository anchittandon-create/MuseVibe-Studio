import { NavLink } from 'react-router-dom';
import { Home, Music, LayoutDashboard, Settings, Folder, BarChart, ChevronLeft, ChevronRight, X, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }: any) {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        bg-surface-darker border-r border-border-dark flex flex-col shrink-0
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 md:p-6 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'md:justify-center md:w-full' : ''}`}>
            <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold text-xl">
              G
            </div>
            <div className={`transition-opacity duration-200 ${isCollapsed ? 'md:hidden' : 'block'}`}>
              <h1 className="text-white text-base font-bold leading-tight whitespace-nowrap">Gemini Studio</h1>
              <p className="text-slate-400 text-xs font-medium">Pro Plan</p>
            </div>
          </div>
          {/* Mobile Close */}
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsMobileOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex flex-col gap-2 px-4 md:px-6 mt-4">
          <NavItem to="/" icon={<Home size={20} />} label="Home" isCollapsed={isCollapsed} setIsMobileOpen={setIsMobileOpen} />
          <NavItem to="/create" icon={<Music size={20} />} label="Create Music" isCollapsed={isCollapsed} setIsMobileOpen={setIsMobileOpen} />
          <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" isCollapsed={isCollapsed} setIsMobileOpen={setIsMobileOpen} />
          
          <div className="mt-4 pt-4 border-t border-border-dark flex flex-col gap-2">
            <NavItem icon={<Folder size={20} />} label="Projects" isCollapsed={isCollapsed} />
            <NavItem icon={<BarChart size={20} />} label="Analytics" isCollapsed={isCollapsed} />
            <NavItem icon={<Settings size={20} />} label="Settings" isCollapsed={isCollapsed} />
          </div>
        </nav>

        <div className="mt-auto p-4 md:p-6 flex flex-col gap-4">
          {user && (
            <div className={`flex items-center gap-3 ${isCollapsed ? 'md:justify-center' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-surface-dark border border-border-dark flex items-center justify-center text-white font-bold shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user.mobile}</p>
                </div>
              )}
            </div>
          )}
          
          <button 
            onClick={logout}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 border border-transparent transition-colors ${isCollapsed ? 'md:justify-center' : ''}`}
            title={isCollapsed ? "Log Out" : undefined}
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">Log Out</span>}
          </button>
        </div>

        {/* Desktop Collapse Toggle */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-8 w-6 h-6 bg-surface-dark border border-border-dark rounded-full items-center justify-center text-slate-400 hover:text-white hover:bg-border-dark transition-colors z-10"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>
    </>
  );
}

function NavItem({ to, icon, label, isCollapsed, setIsMobileOpen }: any) {
  const content = (
    <>
      <div className="shrink-0">{icon}</div>
      <span className={`text-sm font-medium whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'md:hidden' : 'block'}`}>
        {label}
      </span>
    </>
  );

  const baseClass = `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors overflow-hidden ${isCollapsed ? 'md:justify-center' : ''}`;

  if (to) {
    return (
      <NavLink
        to={to}
        onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
        className={({ isActive }) =>
          `${baseClass} ${
            isActive
              ? 'bg-primary/20 text-white border border-primary/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`
        }
        title={isCollapsed ? label : undefined}
      >
        {content}
      </NavLink>
    );
  }

  return (
    <div 
      className={`${baseClass} text-slate-400 hover:text-white hover:bg-white/5 border border-transparent cursor-pointer`}
      title={isCollapsed ? label : undefined}
    >
      {content}
    </div>
  );
}
