import React from 'react';
import { Ticket, User as UserIcon, LogOut, Layers } from 'lucide-react';
import type { User } from '../types';

interface NavbarProps {
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  currentView: 'events' | 'orders';
  setCurrentView: (view: 'events' | 'orders') => void;
  onOpenArchitecture: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onLogout,
  currentView,
  setCurrentView,
  onOpenArchitecture,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('events')}>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Ticket className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
              TicketFlow
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              Cloud-Native v1.0
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-1 sm:space-x-3">
          <button
            onClick={() => setCurrentView('events')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              currentView === 'events'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Explore Events
          </button>

          {user && (
            <button
              onClick={() => setCurrentView('orders')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                currentView === 'orders'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              My Tickets & Orders
            </button>
          )}

          <button
            onClick={onOpenArchitecture}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition"
            title="Inspect 1+2+3 System Architecture & Live Metrics"
          >
            <Layers className="h-4 w-4" />
            <span className="hidden md:inline">Live Architecture & Metrics</span>
            <span className="md:hidden">Arch</span>
          </button>
        </nav>

        {/* User Account */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-medium text-slate-200">{user.fullName}</span>
                <span className="text-xs text-indigo-400">{user.email}</span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 transition"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium shadow-md shadow-indigo-600/30 transition"
            >
              <UserIcon className="h-4 w-4" />
              <span>Sign In / Demo</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
