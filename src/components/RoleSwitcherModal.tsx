import React, { useState } from 'react';
import { UserRole, Student, Teacher } from '../types';
import { 
  Users, Shield, UserCheck, Key, Check, X, LogIn, Sparkles, UserPlus 
} from 'lucide-react';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  currentStudent: Student;
  teacher: Teacher;
  students: Student[];
  onSelectRole: (role: UserRole, student?: Student) => void;
  onOpenRegisterModal: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  currentStudent,
  teacher,
  students,
  onSelectRole,
  onOpenRegisterModal,
}) => {
  const [identifierInput, setIdentifierInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  if (!isOpen) return null;

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const targetStudent = students.find((s) => {
      const matchIdOrEmail =
        s.studentId.toLowerCase() === identifierInput.trim().toLowerCase() ||
        s.email.toLowerCase() === identifierInput.trim().toLowerCase();
      const matchPass = s.password === passwordInput.trim();
      return matchIdOrEmail && matchPass;
    });

    if (targetStudent) {
      onSelectRole('student', targetStudent);
      setIdentifierInput('');
      setPasswordInput('');
      onClose();
    } else {
      setLoginError('Invalid Student ID/Email or Password. Please check your credentials.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="pb-4 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <LogIn className="w-6 h-6 text-cyan-400" />
            <span>Account Login & Session</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Access your private COMTECH student account or switch to Teacher Mode.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto py-5 space-y-6">
          {/* Section 1: Teacher Portal Login */}
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-2">
              Teacher & Instructor Mode
            </span>
            <div
              onClick={() => {
                onSelectRole('teacher');
                onClose();
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                currentRole === 'teacher'
                  ? 'bg-cyan-950/30 border-cyan-500/60 ring-1 ring-cyan-500/40'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 ring-1 ring-slate-700 shrink-0">
                  <img
                    src={teacher.avatar}
                    alt={teacher.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm">{teacher.name}</h3>
                    <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-800">
                      Instructor
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{teacher.title}</p>
                </div>
              </div>

              {currentRole === 'teacher' ? (
                <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Active
                </span>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectRole('teacher');
                    onClose();
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors cursor-pointer"
                >
                  Log In
                </button>
              )}
            </div>
          </div>

          {/* Section 2: Student Private Login Form */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-cyan-400" />
                Student Private Login
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRegisterModal();
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>New Student? Register</span>
              </button>
            </div>

            <form onSubmit={handleStudentLogin} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Student ID (e.g. CT-2026-001) or Email:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your student ID or email"
                  value={identifierInput}
                  onChange={(e) => setIdentifierInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Your Password:
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter your confidential password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {loginError && (
                <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300">
                  {loginError}
                </div>
              )}

              <div className="pt-1 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Active as: <strong>{currentStudent.name}</strong>
                </span>

                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-md shadow-cyan-950/40 flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In to Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onOpenRegisterModal();
            }}
            className="text-xs text-cyan-400 hover:underline font-medium"
          >
            Create New Student Account
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
