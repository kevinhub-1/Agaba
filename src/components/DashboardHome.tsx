import React, { useState } from 'react';
import { 
  UserRole, Student, Teacher, Assignment, Submission, Announcement 
} from '../types';
import { HERO_BANNER_SRC, TECH_CHEAT_SHEETS } from '../data/mockData';
import { 
  Send, BookOpen, GraduationCap, Users, Bell, ArrowRight, 
  Clock, CheckCircle, Award, Terminal, Code2, Sparkles, ChevronRight
} from 'lucide-react';

interface DashboardHomeProps {
  currentRole: UserRole;
  currentStudent: Student;
  teacher: Teacher;
  assignments: Assignment[];
  submissions: Submission[];
  announcements: Announcement[];
  onNavigateTab: (tab: string) => void;
  onOpenRoleModal: () => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  currentRole,
  currentStudent,
  teacher,
  assignments,
  submissions,
  announcements,
  onNavigateTab,
  onOpenRoleModal,
}) => {
  const [activeCheatsheet, setActiveCheatsheet] = useState<number>(0);

  // Student specific stats
  const studentSubmissions = submissions.filter((s) => s.studentId === currentStudent.id);
  const gradedCount = studentSubmissions.filter((s) => s.status === 'graded').length;

  return (
    <div className="space-y-6">
      {/* Hero Welcome Card with Image Asset */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="relative h-64 sm:h-72 w-full overflow-hidden">
          <img
            src={HERO_BANNER_SRC}
            alt="COMTECH Computer Science Lab"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover brightness-60"
          />
          {/* Measured gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          {/* Text Over Scrim */}
          <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end text-white space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider bg-slate-950/80 px-2.5 py-1 rounded-md border border-cyan-500/30 backdrop-blur-sm">
                COMTECH Mobile Academy
              </span>
              <span className="text-xs text-slate-300">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white max-w-2xl leading-tight">
              {currentRole === 'teacher'
                ? `Welcome, ${teacher.name}`
                : `Welcome, ${currentStudent.name}`}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {currentRole === 'teacher'
                ? 'Your teacher dashboard to give out work, distribute lesson tutorials, inspect student answers, and manage login credentials.'
                : `You are enrolled in ${currentStudent.formGrade}. Access your classwork, forward answers, view video tutorials, and study past papers.`}
            </p>

            <div className="pt-2 flex items-center gap-3 flex-wrap">
              <button
                onClick={() => onNavigateTab('submit')}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-950/50 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{currentRole === 'teacher' ? 'Review Student Answers' : 'Answer Active Work'}</span>
              </button>

              <button
                onClick={() => onNavigateTab('tutorials')}
                className="px-4 py-2 text-xs font-medium rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 backdrop-blur-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>Video Lessons</span>
              </button>

              <button
                onClick={onOpenRoleModal}
                className="text-xs text-slate-300 hover:text-white underline ml-1 cursor-pointer"
              >
                Switch User / Student
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => onNavigateTab('assignments')}
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Given Out Work</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-2 tabular-nums">
            {assignments.length}
          </div>
          <div className="text-[11px] text-cyan-400 mt-1 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>View assignments</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('submit')}
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {currentRole === 'teacher' ? 'Forwarded Answers' : 'Your Submissions'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-2 tabular-nums">
            {currentRole === 'teacher' ? submissions.length : studentSubmissions.length}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>{currentRole === 'teacher' ? 'Grade inbox' : 'View answers'}</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('pastpapers')}
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Past Exam Papers</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-2 tabular-nums">
            5 Sets
          </div>
          <div className="text-[11px] text-purple-400 mt-1 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>With mark schemes</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('students')}
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Enrolled Students</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-2 tabular-nums">
            {currentRole === 'teacher' ? '8 Active' : `${currentStudent.performanceAverage}% GPA`}
          </div>
          <div className="text-[11px] text-amber-400 mt-1 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Credentials list</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Announcements / Notice Board */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Teacher Notices & Department Bulletin</h2>
          </div>
          <span className="text-xs text-slate-400">From Mr. Kevin Agaba</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/50">
                    {ann.badgeText}
                  </span>
                  <span className="text-[10px] text-slate-500">{ann.date}</span>
                </div>
                <h3 className="text-xs font-bold text-white leading-snug">
                  {ann.title}
                </h3>
                <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-3">
                  {ann.content}
                </p>
              </div>

              <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/60">
                Author: {ann.author}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Cheatsheets & Quick Reference */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Quick Revision Cheatsheets & Syntaxes</h2>
          </div>

          <div className="flex items-center gap-1.5">
            {TECH_CHEAT_SHEETS.map((sheet, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCheatsheet(idx)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                  activeCheatsheet === idx
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sheet.category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TECH_CHEAT_SHEETS[activeCheatsheet]?.items.map((item, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-1.5"
            >
              <div className="text-[11px] text-slate-400 font-sans font-semibold">
                {item.label}
              </div>
              <pre className="text-cyan-300 text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {item.code}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
