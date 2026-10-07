import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  FolderTree, 
  School, 
  Image, 
  Mail, 
  Settings, 
  Database, 
  LogOut, 
  ExternalLink, 
  Menu, 
  X, 
  GraduationCap,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { AdminUser } from '../../services/authService';

interface AdminLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
  onViewPublicSite: () => void;
  adminUser: AdminUser | null;
  unreadCount?: number;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  onLogout,
  onViewPublicSite,
  adminUser,
  unreadCount = 0,
  children,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'articles', label: 'Articles Manager', icon: FileText },
    { id: 'new-article', label: 'Create New Article', icon: PlusCircle },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'institutions', label: 'Tertiary Institutions', icon: School },
    { id: 'media', label: 'Media Library', icon: Image },
    { id: 'messages', label: 'Contact Messages', icon: Mail, badge: unreadCount },
    { id: 'settings', label: 'Site Settings', icon: Settings },
    { id: 'supabase', label: 'Supabase & SQL Script', icon: Database, highlight: true },
  ];

  const handleTabClick = (tab: string) => {
    onSelectTab(tab);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 select-none">
        {/* Brand */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-auto max-w-[70px] rounded-lg bg-white p-1 flex items-center justify-center shrink-0">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-full w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://i.ibb.co/ksCXdD4L/Gemini-Generated-Image-cku0hvcku0hvcku0.jpg';
                }}
              />
            </div>
            <div>
              <div className="font-extrabold text-sm text-white tracking-tight">
                Legit<span className="text-orange-500">School</span><span className="text-sky-400">Gists</span>
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                Admin Console
              </div>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="px-5 py-3.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="truncate">
            <div className="text-xs font-bold text-white truncate">{adminUser?.name || 'Administrator'}</div>
            <div className="text-[11px] text-slate-400 truncate font-mono">{adminUser?.email}</div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" title="Active"></span>
        </div>

        {/* Menu Navigation */}
        <nav className="p-3 space-y-1 grow overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md'
                    : item.highlight
                    ? 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-800/60'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <button
            onClick={onViewPublicSite}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-sky-400 hover:bg-slate-800 hover:text-sky-300 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View Public Website</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-bold text-sm">LegitSchoolGists Admin</span>
        </div>

        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1.5 text-slate-300 hover:text-white"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileSidebarOpen && (
        <div className="md:hidden bg-slate-900 text-slate-300 p-4 border-b border-slate-800 space-y-2 z-40">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold ${
                  isActive ? 'bg-sky-600 text-white' : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="bg-orange-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={onViewPublicSite}
              className="text-xs text-sky-400 flex items-center gap-1 font-semibold"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </button>
            <button
              onClick={onLogout}
              className="text-xs text-rose-400 flex items-center gap-1 font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Admin Content Body */}
      <main className="grow p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};
