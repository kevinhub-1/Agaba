import React from 'react';
import { Home, FileText, Send, BookOpen, GraduationCap, Users, User } from 'lucide-react';
import { UserRole } from '../types';

interface BottomTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentRole: UserRole;
  pendingSubmissionsCount?: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabChange,
  currentRole,
  pendingSubmissionsCount = 0,
}) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'assignments', label: 'Work', icon: FileText },
    {
      id: 'submit',
      label: 'Submit',
      icon: Send,
      badge: pendingSubmissionsCount > 0 ? pendingSubmissionsCount : undefined,
    },
    { id: 'tutorials', label: 'Lessons', icon: BookOpen },
    { id: 'pastpapers', label: 'Papers', icon: GraduationCap },
    currentRole === 'teacher'
      ? { id: 'students', label: 'Roster', icon: Users }
      : { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 lg:hidden pb-safe">
      <div className="grid grid-cols-6 items-center h-16 max-w-md mx-auto px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-all relative cursor-pointer ${
                isActive ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'
                  }`}
                />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-cyan-500 text-slate-950 text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 bg-cyan-400 rounded-full mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
