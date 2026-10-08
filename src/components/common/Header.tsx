import React, { useState } from 'react';
import { 
  Search, 
  Menu, 
  X, 
  ShieldCheck,
  Lock 
} from 'lucide-react';
import { SiteSettings } from '../../types';

interface HeaderProps {
  settings: SiteSettings;
  activeNav: string;
  onNavigate: (page: string, param?: string) => void;
  onOpenSearch: () => void;
  isAdminLoggedIn?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  activeNav,
  onNavigate,
  onOpenSearch,
  isAdminLoggedIn,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const navLinks = [
    { label: 'Home', target: 'home' },
    { label: 'News & Gist', target: 'category', param: 'education-news' },
    { label: 'About Us', target: 'about' },
    { label: 'Scholarship', target: 'category', param: 'scholarships' },
    { label: 'Contact Us', target: 'contact' },
  ];

  const handleLinkClick = (target: string, param?: string) => {
    onNavigate(target, param);
    setMobileMenuOpen(false);
    setShowDropdown(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-md border-b border-sky-100">
      {/* Main Brand Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <button
            onClick={() => handleLinkClick('home')}
            className="flex items-center gap-3 text-left group"
          >
            <div className="h-11 sm:h-13 w-auto max-w-[190px] sm:max-w-[240px] rounded-lg overflow-hidden bg-white flex items-center justify-center p-0.5 shadow-sm border border-slate-200 group-hover:scale-105 transition-transform">
              <img
                src={settings.logo_url || '/logo.png'}
                alt="LegitSchoolGists Logo"
                className="h-full w-auto object-contain max-h-11 sm:max-h-13"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://i.ibb.co/Zp452bpM/73b6adf9-0c8c-4f77-9623-83e3753202d9.jpg';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-sky-900 tracking-tight">
                  Legit<span className="text-orange-600">School</span><span className="text-sky-600">Gists</span>
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-emerald-200">
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                  VERIFIED
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium tracking-normal hidden xs:block">
                Nigeria's Premier Campus & Education News Portal
              </p>
            </div>
          </button>

          {/* Quick Search (Ask on WhatsApp removed per user request) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors border border-slate-200"
              title="Search news, cut-offs, scholarships..."
            >
              <Search className="w-4 h-4 text-sky-600" />
              <span className="hidden md:inline">Search articles, JAMB, schools...</span>
              <kbd className="hidden lg:inline bg-white px-1.5 py-0.5 text-[10px] text-slate-400 rounded border">⌘K</kbd>
            </button>

            {/* Admin Console Shortcut */}
            <button
              onClick={() => handleLinkClick('admin')}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-sky-700 bg-slate-100 hover:bg-slate-200 px-2.5 sm:px-3 py-2 rounded-lg transition-colors border border-slate-200"
              title="Official Admin Portal: https://legitschoolgists.com.ng/admin"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Admin</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:text-sky-600 rounded-lg focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Desktop Navigation Bar */}
      <nav className="hidden md:block bg-sky-700 text-white shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center justify-start gap-4 lg:gap-8 text-xs lg:text-sm font-medium tracking-wide">
            {navLinks.map((item) => {
              const isActive =
                activeNav === item.target ||
                (activeNav === 'category' && item.param && activeNav === item.param);

              return (
                <li key={item.label}>
                  <button
                    onClick={() => handleLinkClick(item.target, item.param)}
                    className={`py-3 px-3 lg:px-4 block transition-colors border-b-2 font-medium ${
                      isActive
                        ? 'border-amber-400 text-amber-300 font-bold bg-sky-800'
                        : 'border-transparent text-sky-100 hover:text-white hover:bg-sky-800'
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-2 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-1.5">
            {navLinks.map((item) => (
              <button
                key={item.label}
                onClick={() => handleLinkClick(item.target, item.param)}
                className="w-full text-left px-3 py-2.5 rounded-md text-sm font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
