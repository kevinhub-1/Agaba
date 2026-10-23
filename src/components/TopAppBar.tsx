import React from 'react';
import { APP_LOGO_SRC } from '../data/mockData';
import { UserRole, Student, Teacher } from '../types';
import { Smartphone, Monitor, UserCheck, Shield, ChevronDown } from 'lucide-react';

interface TopAppBarProps {
  currentRole: UserRole;
  currentStudent: Student;
  teacher: Teacher;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenRoleModal: () => void;
  onOpenRegisterModal: () => void;
  isSimulatorMode: boolean;
  onToggleSimulator: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  currentRole,
  currentStudent,
  teacher,
  activeTab,
  onTabChange,
  onOpenRoleModal,
  onOpenRegisterModal,
  isSimulatorMode,
  onToggleSimulator,
}) => {
  // Students only see My Profile; Teacher sees Class Roster
  const navItems = [
    { id: 'home', label: 'Dashboard' },
    { id: 'assignments', label: 'Work' },
    { id: 'submit', label: 'Answer & Submit' },
    { id: 'tutorials', label: 'Tutorials' },
    { id: 'pastpapers', label: 'Past Papers' },
    currentRole === 'teacher'
      ? { id: 'students', label: 'Class Students' }
      : { id: 'profile', label: 'My Profile' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark & Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-cyan-500/30 shadow-md shadow-cyan-950/40 bg-slate-950 flex items-center justify-center">
            <img
              src={APP_LOGO_SRC}
              alt="COMTECH Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={() => onTabChange('home')}
            className="text-left group cursor-pointer"
          >
            <div className="text-lg font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors whitespace-nowrap">
              COMTECH
            </div>
            <div className="text-[10px] text-cyan-400/80 font-medium tracking-wide -mt-0.5 whitespace-nowrap">
              Computer & Tech Academy
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Desktop 4-5 clean single-line links) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`transition-colors whitespace-nowrap pb-1 relative cursor-pointer ${
                  isActive
                    ? 'text-cyan-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions - Mode Simulator & User Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Register Button */}
          <button
            onClick={onOpenRegisterModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-colors cursor-pointer"
          >
            <span>+ Register</span>
          </button>

          {/* Simulator Toggle Button */}
          <button
            onClick={onToggleSimulator}
            title={isSimulatorMode ? 'Switch to Full Web View' : 'Preview in Android Mobile Frame'}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors cursor-pointer"
          >
            {isSimulatorMode ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                <span className="whitespace-nowrap">Full View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                <span className="whitespace-nowrap">Android View</span>
              </>
            )}
          </button>

          {/* Active User Switcher Pill */}
          <button
            onClick={onOpenRoleModal}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700 text-left transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-700 shrink-0 ring-1 ring-slate-600">
              <img
                src={currentRole === 'teacher' ? teacher.avatar : currentStudent.avatar}
                alt="Profile"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden md:block">
              <div className="text-xs font-semibold text-white leading-tight truncate max-w-[130px]">
                {currentRole === 'teacher' ? teacher.name : currentStudent.name}
              </div>
              <div className="text-[10px] text-cyan-400 capitalize flex items-center gap-1">
                {currentRole === 'teacher' ? (
                  <Shield className="w-2.5 h-2.5 inline" />
                ) : (
                  <UserCheck className="w-2.5 h-2.5 inline" />
                )}
                {currentRole} Mode
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>
        </div>
      </div>
    </header>
  );
};
