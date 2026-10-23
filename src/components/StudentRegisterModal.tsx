import React, { useState } from 'react';
import { Student } from '../types';
import { STUDENT_PHOTO_SRC } from '../data/mockData';
import { 
  UserPlus, Sparkles, X, Check, Lock, ShieldCheck, 
  Upload, Eye, EyeOff, Key
} from 'lucide-react';

interface StudentRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterStudent: (newStudent: Omit<Student, 'id' | 'completedAssignments' | 'totalAssignments' | 'performanceAverage' | 'lastActive'>) => void;
  existingCount: number;
}

export const StudentRegisterModal: React.FC<StudentRegisterModalProps> = ({
  isOpen,
  onClose,
  onRegisterStudent,
  existingCount,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [formGrade, setFormGrade] = useState('Form 4 (Grade 12)');
  const [stream, setStream] = useState('Science & Computing Track');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [avatar, setAvatar] = useState(STUDENT_PHOTO_SRC);
  const [targetGrade, setTargetGrade] = useState('Distinction 1 (D1)');

  if (!isOpen) return null;

  const generateSimplePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const cleanFirstName = name.trim().split(' ')[0] || 'Student';
    const capitalized = cleanFirstName.charAt(0).toUpperCase() + cleanFirstName.slice(1).toLowerCase();
    setPassword(`ComTech#${capitalized}${code}`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const nextIdNum = existingCount + 1;
    const formattedId = `CT-2026-${String(nextIdNum).padStart(3, '0')}`;
    const cleanEmail = email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@school.edu`;
    const finalPassword = password.trim() || `ComTech#${Math.floor(1000 + Math.random() * 9000)}`;

    onRegisterStudent({
      studentId: formattedId,
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim() || undefined,
      password: finalPassword,
      formGrade,
      stream,
      avatar,
      targetGrade,
      bio: 'Enrolled in COMTECH Computer Studies. Ready to learn!',
      status: 'active',
    });

    onClose();
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
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Join COMTECH Portal</h2>
              <p className="text-xs text-slate-400">
                Quick student registration. Get instant access to lessons, exams, and coursework.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Your Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Joel Ainamaani"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!password) {
                  const first = e.target.value.trim().split(' ')[0];
                  if (first.length > 2) {
                    setPassword(`ComTech#${first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()}26`);
                  }
                }
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Class / Form
              </label>
              <select
                value={formGrade}
                onChange={(e) => setFormGrade(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Form 4 (Grade 12)">Form 4 (Grade 12)</option>
                <option value="Form 3 (Grade 11)">Form 3 (Grade 11)</option>
                <option value="Form 2 (Grade 10)">Form 2 (Grade 10)</option>
                <option value="Form 1 (Grade 9)">Form 1 (Grade 9)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Stream / Group
              </label>
              <input
                type="text"
                value={stream}
                onChange={(e) => setStream(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="e.g. student@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Phone / WhatsApp (Optional)
              </label>
              <input
                type="text"
                placeholder="+256 700 000 000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Password with generator */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300">
                Choose Your Login Password *
              </label>
              <button
                type="button"
                onClick={generateSimplePassword}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                Generate Easy Password
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="e.g. ComTech#Student26"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-cyan-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Remember this password to log back in anytime on your Android device.
            </p>
          </div>

          {/* Avatar selector */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-medium text-slate-300 block">
              Profile Photo
            </label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 ring-1 ring-slate-700 shrink-0">
                <img
                  src={avatar}
                  alt="Student preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <label className="px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 cursor-pointer flex items-center gap-1.5">
                  <Upload className="w-3 h-3" />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setAvatar(STUDENT_PHOTO_SRC)}
                  className="px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                >
                  Use School Uniform Photo
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-950/40 flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register & Log In Now</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
