import React, { useState } from 'react';
import { Student, Submission, Assignment } from '../types';
import { STUDENT_PHOTO_SRC } from '../data/mockData';
import { 
  User, Key, Award, Clock, BookOpen, CheckCircle, 
  Edit3, Save, Phone, Mail, GraduationCap, Sparkles, 
  Upload, X, Shield, Lock, Eye, EyeOff, Check
} from 'lucide-react';

interface StudentProfileViewProps {
  currentStudent: Student;
  submissions: Submission[];
  assignments: Assignment[];
  onUpdateProfile: (updatedStudent: Partial<Student>) => void;
  onOpenRegisterModal: () => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  currentStudent,
  submissions,
  assignments,
  onUpdateProfile,
  onOpenRegisterModal,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentStudent.name);
  const [email, setEmail] = useState(currentStudent.email);
  const [phone, setPhone] = useState(currentStudent.phone || '');
  const [formGrade, setFormGrade] = useState(currentStudent.formGrade);
  const [stream, setStream] = useState(currentStudent.stream);
  const [bio, setBio] = useState(currentStudent.bio || '');
  const [targetGrade, setTargetGrade] = useState(currentStudent.targetGrade || 'Distinction 1 (D1)');
  const [avatarUrl, setAvatarUrl] = useState(currentStudent.avatar);
  
  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Handle local image file upload for avatar
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      formGrade,
      stream: stream.trim(),
      bio: bio.trim(),
      targetGrade,
      avatar: avatarUrl,
    });
    setIsEditing(false);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 4) {
      setPasswordError('Password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match. Please re-enter.');
      return;
    }

    onUpdateProfile({
      password: newPassword.trim(),
    });

    setPasswordSuccess(true);
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => {
      setPasswordSuccess(false);
      setIsChangingPassword(false);
    }, 2000);
  };

  // Student specific submissions
  const mySubmissions = submissions.filter((s) => s.studentId === currentStudent.id);
  const completedCount = mySubmissions.length;
  const gradedCount = mySubmissions.filter((s) => s.status === 'graded').length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <User className="w-6 h-6 text-cyan-400" />
            <span>My Student Profile</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your personal student details, credentials, and track your academic progress.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-950/40 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit My Profile</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Cancel Editing</span>
            </button>
          )}

          <button
            onClick={onOpenRegisterModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-slate-700 bg-slate-800/80 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Register New Student</span>
          </button>
        </div>
      </div>

      {/* Main Profile View or Edit Form */}
      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Avatar & Identity Card */}
          <div className="md:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 text-center">
              <div className="relative w-28 h-28 mx-auto rounded-3xl overflow-hidden ring-4 ring-cyan-500/30 bg-slate-800 shadow-xl">
                <img
                  src={currentStudent.avatar}
                  alt={currentStudent.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">{currentStudent.name}</h2>
                <div className="text-xs text-cyan-400 font-mono font-medium mt-0.5">
                  ID: {currentStudent.studentId}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {currentStudent.formGrade} · {currentStudent.stream}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-xs text-slate-300 space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" /> Email:
                  </span>
                  <span className="font-mono text-slate-200 truncate max-w-[160px] text-[11px]">
                    {currentStudent.email}
                  </span>
                </div>

                {currentStudent.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" /> Phone:
                    </span>
                    <span className="font-mono text-slate-200 text-[11px]">
                      {currentStudent.phone}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-cyan-400" /> Target Grade:
                  </span>
                  <span className="font-semibold text-amber-400 text-xs">
                    {currentStudent.targetGrade || 'Distinction 1 (D1)'}
                  </span>
                </div>
              </div>

              {/* Password Section */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    App Password:
                  </span>
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="font-mono font-bold text-amber-300 text-xs text-center tracking-wider">
                  {showPassword ? currentStudent.password : '••••••••••••'}
                </div>
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="w-full py-1 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
                >
                  Change Password
                </button>
              </div>

              {currentStudent.bio && (
                <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/60 text-xs text-slate-300 text-left italic">
                  "{currentStudent.bio}"
                </div>
              )}
            </div>
          </div>

          {/* Right: Academic Performance & Submissions Record */}
          <div className="md:col-span-7 space-y-5">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">Current Average</span>
                <div className="text-2xl font-bold text-emerald-400 tabular-nums">
                  {currentStudent.performanceAverage}%
                </div>
                <span className="text-[11px] text-slate-500">Based on graded work</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">Completed Work</span>
                <div className="text-2xl font-bold text-cyan-400 tabular-nums">
                  {completedCount} Tasks
                </div>
                <span className="text-[11px] text-slate-500">{gradedCount} Graded & Returned</span>
              </div>
            </div>

            {/* My Submissions History */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-cyan-400" />
                  <span>My Coursework & Answers</span>
                </h3>
                <span className="text-xs text-slate-400">
                  {mySubmissions.length} Forwarded
                </span>
              </div>

              <div className="space-y-3">
                {mySubmissions.map((sub) => {
                  const isGraded = sub.status === 'graded';
                  return (
                    <div
                      key={sub.id}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-white leading-snug">
                            {sub.assignmentTitle}
                          </h4>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              Forwarded {new Date(sub.submittedAt).toLocaleDateString()}
                            </span>
                            <span>·</span>
                            <span>{sub.answers.length} Questions Answered</span>
                          </div>
                        </div>

                        {isGraded ? (
                          <div className="text-right shrink-0">
                            <span className="font-mono font-bold text-emerald-400 text-xs">
                              {sub.totalScore}/{sub.maxScore}
                            </span>
                            <div className="text-[10px] text-emerald-500">Graded</div>
                          </div>
                        ) : (
                          <span className="text-[10px] bg-amber-950/40 text-amber-400 border border-amber-800/60 px-2 py-0.5 rounded-full shrink-0">
                            Awaiting Grade
                          </span>
                        )}
                      </div>

                      {isGraded && sub.teacherOverallFeedback && (
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                          <strong className="text-cyan-400">Mr. Kevin Agaba:</strong> {sub.teacherOverallFeedback}
                        </div>
                      )}
                    </div>
                  );
                })}

                {mySubmissions.length === 0 && (
                  <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                    You haven't forwarded any coursework answers yet. Go to the "Answer & Submit" tab to begin!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Edit Profile Form */
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
          <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Edit Your Student Profile</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Update your personal information, profile picture, and study goals.
              </p>
            </div>
            <button
              onClick={() => setIsEditing(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Avatar Selector / Upload */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300 block">
                Profile Photo
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-cyan-500 bg-slate-800 shrink-0">
                  <img
                    src={avatarUrl}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 cursor-pointer flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
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
                      onClick={() => setAvatarUrl(STUDENT_PHOTO_SRC)}
                      className="px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                    >
                      Use School Uniform Photo
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    JPG or PNG formats supported.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Phone / WhatsApp Number
                </label>
                <input
                  type="text"
                  placeholder="+256 701 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Target Academic Grade
                </label>
                <select
                  value={targetGrade}
                  onChange={(e) => setTargetGrade(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Distinction 1 (D1)">Distinction 1 (D1)</option>
                  <option value="Distinction 2 (D2)">Distinction 2 (D2)</option>
                  <option value="Credit 3 (C3)">Credit 3 (C3)</option>
                  <option value="Pass">Pass</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Form / Class
                </label>
                <select
                  value={formGrade}
                  onChange={(e) => setFormGrade(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Form 4 (Grade 12)">Form 4 (Grade 12)</option>
                  <option value="Form 3 (Grade 11)">Form 3 (Grade 11)</option>
                  <option value="Form 2 (Grade 10)">Form 2 (Grade 10)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Stream / Study Group
                </label>
                <input
                  type="text"
                  value={stream}
                  onChange={(e) => setStream(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Personal Bio / Motivation Quote
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your tech aspirations, favorite computing topics, or study goals..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-medium rounded-xl text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-950/40 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangingPassword && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsChangingPassword(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Key className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">Change App Password</h3>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  New Password *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ComTech#NewPass88"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Re-type password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {passwordError && (
                <div className="text-xs text-red-400 bg-red-950/40 p-2.5 rounded-xl border border-red-800/60">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="text-xs text-emerald-400 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/60 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Password successfully changed!</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-950/40"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
