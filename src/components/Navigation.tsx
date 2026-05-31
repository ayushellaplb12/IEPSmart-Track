import React from 'react';
import { LayoutDashboard, FileInput, Users, Archive, LogOut } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem = ({ icon, label, active, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full text-left",
      active 
        ? "bg-blue-600 text-white" 
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    )}
  >
    {icon}
    <span>{label}</span>
  </button>
);

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navigation = ({ activeTab, setActiveTab }: NavigationProps) => {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-full shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            E
          </div>
          <h1 className="text-xl font-bold tracking-tight">IEPSmart</h1>
        </div>
        
        <nav className="space-y-1">
          <NavItem 
            icon={<LayoutDashboard size={18} />} 
            label="Dashboard Overview" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')}
          />
          <NavItem 
            icon={<FileInput size={18} />} 
            label="Input Monitoring" 
            active={activeTab === 'input'} 
            onClick={() => setActiveTab('input')}
          />
          <NavItem 
            icon={<Users size={18} />} 
            label="Student Database" 
            active={activeTab === 'students'} 
            onClick={() => setActiveTab('students')}
          />
          <NavItem 
            icon={<Archive size={18} />} 
            label="Report Archives" 
            active={activeTab === 'reports'} 
            onClick={() => setActiveTab('reports')}
          />
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold ring-2 ring-slate-800">
            T
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Teacher Account</p>
            <p className="text-xs text-slate-500 italic">EduTrack User</p>
          </div>
          <button className="text-slate-500 hover:text-white transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
