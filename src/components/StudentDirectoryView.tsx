import React, { useState } from 'react';
import { Student } from '../types';
import { 
  Users, Key, Copy, Check, Eye, EyeOff, UserPlus, 
  Search, LogIn, Printer, Sparkles, X, ShieldAlert, Download 
} from 'lucide-react';

interface StudentDirectoryViewProps {
  students: Student[];
  onAddStudent: (newStudent: Omit<Student, 'id' | 'completedAssignments' | 'totalAssignments' | 'performanceAverage' | 'lastActive'>) => void;
  onSelectStudentToLogin: (student: Student) => void;
  currentStudentId?: string;
}

export const StudentDirectoryView: React.FC<StudentDirectoryViewProps> = ({
  students,
  onAddStudent,
  onSelectStudentToLogin,
  currentStudentId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [showAllPasswords, setShowAllPasswords] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPrintSlipsOpen, setIsPrintSlipsOpen] = useState(false);

  // New Student Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newGrade, setNewGrade] = useState('Form 4 (Grade 12)');
  const [newStream, setNewStream] = useState('Science & Computing A');
  const [newPassword, setNewPassword] = useState('');

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const pass = `ComTech#${code}`;
    setNewPassword(pass);
  };

  const handleOpenAddModal = () => {
    generateRandomPassword();
    setIsAddModalOpen(true);
  };

  const handleSaveNewStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPassword.trim()) return;

    const nextIdNum = students.length + 1;
    const formattedId = `CT-2026-${String(nextIdNum).padStart(3, '0')}`;
    const generatedEmail = newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '.')}@school.edu`;

    onAddStudent({
      studentId: formattedId,
      name: newName.trim(),
      email: generatedEmail,
      password: newPassword.trim(),
      formGrade: newGrade,
      stream: newStream,
      avatar: `https://images.unsplash.com/photo-${1530000000000 + nextIdNum}?w=150&auto=format&fit=crop&q=80`,
      status: 'active',
    });

    setNewName('');
    setNewEmail('');
    setIsAddModalOpen(false);
  };

  const handleCopyCredentials = (student: Student) => {
    const text = `COMTECH Student Login\nName: ${student.name}\nStudent ID: ${student.studentId}\nEmail: ${student.email}\nPassword: ${student.password}\nPortal: COMTECH Android App`;
    navigator.clipboard.writeText(text);
    setCopiedId(student.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = selectedGrade === 'all' || s.formGrade.includes(selectedGrade);
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            <span>Student Login Directory</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Registered students with their credentials and direct application login access.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAllPasswords(!showAllPasswords)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {showAllPasswords ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Mask Passwords</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Show Passwords</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              let csv = `Student ID,Full Name,Email,Password,Form / Class,Stream\n`;
              students.forEach((s) => {
                csv += `"${s.studentId}","${s.name}","${s.email}","${s.password}","${s.formGrade}","${s.stream}"\n`;
              });
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `COMTECH_Student_Credentials_${new Date().toISOString().split('T')[0]}.csv`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            title="Download credentials to Downloads"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-slate-700 bg-slate-800/80 text-cyan-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>

          <button
            onClick={() => setIsPrintSlipsOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>Print Slips</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors cursor-pointer shadow-lg shadow-cyan-950/40"
          >
            <UserPlus className="w-4 h-4" />
            <span>Enroll Student</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-sm">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, ID (e.g. CT-2026-001), or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="all">All Forms / Classes</option>
            <option value="Form 4">Form 4 (Grade 12)</option>
            <option value="Form 3">Form 3 (Grade 11)</option>
          </select>
        </div>
      </div>

      {/* Directory Table / Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStudents.map((student) => {
          const isCurrentlyActive = student.id === currentStudentId;
          const isCopied = copiedId === student.id;

          return (
            <div
              key={student.id}
              className={`p-4 rounded-2xl border transition-all ${
                isCurrentlyActive
                  ? 'bg-cyan-950/20 border-cyan-500/50 ring-1 ring-cyan-500/30'
                  : 'bg-slate-900/70 border-slate-800/90 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 ring-1 ring-slate-700 shrink-0">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white text-base leading-tight">
                        {student.name}
                      </h3>
                      {isCurrentlyActive && (
                        <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-semibold px-2 py-0.5 rounded-full border border-cyan-500/40">
                          Active User
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-cyan-400 font-medium">{student.studentId}</span>
                      <span>·</span>
                      <span>{student.formGrade}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onSelectStudentToLogin(student)}
                  title="Switch session to this student"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 border border-slate-700 hover:border-cyan-400 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Log in as</span>
                </button>
              </div>

              {/* Credentials Box */}
              <div className="mt-4 p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Email Login:</span>
                  <span className="text-slate-200 font-mono text-[11px] truncate max-w-[190px]">
                    {student.email}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>App Password:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-amber-300 font-semibold text-xs tracking-wider">
                      {showAllPasswords ? student.password : '••••••••••••'}
                    </span>
                    <button
                      onClick={() => handleCopyCredentials(student)}
                      title="Copy student login"
                      className="text-slate-400 hover:text-cyan-400 transition-colors p-1 cursor-pointer"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress Summary */}
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/50">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-300 font-medium">Work Done:</span>
                  <span className="text-cyan-400 tabular-nums">
                    {student.completedAssignments}/{student.totalAssignments}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-300 font-medium">Grade Average:</span>
                  <span className="text-emerald-400 font-bold tabular-nums">
                    {student.performanceAverage}%
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {student.lastActive}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStudents.length === 0 && (
        <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400">
          <p className="text-base font-medium">No students match your search criteria.</p>
          <p className="text-xs text-slate-500 mt-1">Try adjusting the query or class filter.</p>
        </div>
      )}

      {/* Add New Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-white">Enroll New Student</h2>
            </div>

            <form onSubmit={handleSaveNewStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Student Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samuel Kigozi"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address (Optional - auto-generated if blank)
                </label>
                <input
                  type="email"
                  placeholder="e.g. samuel.k@school.edu"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Form / Grade
                  </label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Form 4 (Grade 12)">Form 4 (Grade 12)</option>
                    <option value="Form 3 (Grade 11)">Form 3 (Grade 11)</option>
                    <option value="Form 2 (Grade 10)">Form 2 (Grade 10)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Stream / Group
                  </label>
                  <input
                    type="text"
                    value={newStream}
                    onChange={(e) => setNewStream(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300">
                    Generated App Password *
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    Regenerate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-amber-300 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-950/40"
                >
                  Save & Issue Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Login Slips Modal */}
      {isPrintSlipsOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Printer className="w-5 h-5 text-emerald-400" />
                  <span>COMTECH Student Access Slips</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Print or distribute these secure cards to students for Android app login.
                </p>
              </div>
              <button
                onClick={() => setIsPrintSlipsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="p-4 rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/90 text-slate-200 space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400 tracking-wider">COMTECH ACCESS CARD</span>
                    <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                      {student.studentId}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{student.name}</div>
                    <div className="text-[11px] text-slate-400">{student.formGrade} · {student.stream}</div>
                  </div>
                  <div className="pt-2 border-t border-slate-800 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Username/Email:</span>
                      <span className="font-mono text-slate-300 truncate max-w-[150px]">{student.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Password:</span>
                      <span className="font-mono font-bold text-amber-300">{student.password}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-400">Total Cards: {students.length}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Cards
                </button>
                <button
                  onClick={() => setIsPrintSlipsOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
