/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  UserRole, Student, Teacher, Assignment, Submission, Tutorial, PastPaper, Announcement 
} from './types';
import { 
  INITIAL_TEACHER, 
  INITIAL_STUDENTS, 
  INITIAL_ASSIGNMENTS, 
  INITIAL_SUBMISSIONS, 
  INITIAL_TUTORIALS, 
  INITIAL_PAST_PAPERS, 
  INITIAL_ANNOUNCEMENTS 
} from './data/mockData';

import { TopAppBar } from './components/TopAppBar';
import { BottomTabBar } from './components/BottomTabBar';
import { AndroidFrameWrapper } from './components/AndroidFrameWrapper';
import { DashboardHome } from './components/DashboardHome';
import { TeacherWorkManager } from './components/TeacherWorkManager';
import { StudentAnswerPortal } from './components/StudentAnswerPortal';
import { TutorialsHub } from './components/TutorialsHub';
import { PastPapersManager } from './components/PastPapersManager';
import { StudentDirectoryView } from './components/StudentDirectoryView';
import { StudentProfileView } from './components/StudentProfileView';
import { StudentRegisterModal } from './components/StudentRegisterModal';
import { PracticeArena } from './components/PracticeArena';
import { RoleSwitcherModal } from './components/RoleSwitcherModal';
import { Sparkles } from 'lucide-react';

export default function App() {
  // Persistence helpers
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('comtech_role');
    return (saved as UserRole) || 'student';
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('comtech_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [currentStudentId, setCurrentStudentId] = useState<string>(() => {
    const saved = localStorage.getItem('comtech_student_id');
    return saved || INITIAL_STUDENTS[0].id;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('comtech_assignments');
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
  });

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem('comtech_submissions');
    return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
  });

  const [pastPapers, setPastPapers] = useState<PastPaper[]>(() => {
    const saved = localStorage.getItem('comtech_pastpapers_v3');
    return saved ? JSON.parse(saved) : INITIAL_PAST_PAPERS;
  });

  const [tutorials] = useState<Tutorial[]>(INITIAL_TUTORIALS);
  const [announcements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const teacher = INITIAL_TEACHER;

  // Navigation and Modal State
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isSimulatorMode, setIsSimulatorMode] = useState<boolean>(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('comtech_role', currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('comtech_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('comtech_student_id', currentStudentId);
  }, [currentStudentId]);

  useEffect(() => {
    localStorage.setItem('comtech_assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('comtech_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem('comtech_pastpapers_v3', JSON.stringify(pastPapers));
  }, [pastPapers]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentStudent = students.find((s) => s.id === currentStudentId) || students[0];

  // Actions
  const handleForwardAnswers = (newSubmission: Submission) => {
    const existingIndex = submissions.findIndex(
      (s) => s.assignmentId === newSubmission.assignmentId && s.studentId === newSubmission.studentId
    );

    let updatedSubmissions: Submission[];
    if (existingIndex >= 0) {
      updatedSubmissions = [...submissions];
      updatedSubmissions[existingIndex] = newSubmission;
    } else {
      updatedSubmissions = [newSubmission, ...submissions];
    }

    setSubmissions(updatedSubmissions);

    // Update student progress count
    setStudents((prev) =>
      prev.map((stud) => {
        if (stud.id === newSubmission.studentId) {
          return {
            ...stud,
            completedAssignments: Math.min(stud.totalAssignments, stud.completedAssignments + 1),
            lastActive: 'Just now',
          };
        }
        return stud;
      })
    );

    showToast(`Answers forwarded successfully to Mr. Kevin Agaba's grading inbox.`);
  };

  const handleGradeSubmission = (submissionId: string, updatedFields: Partial<Submission>) => {
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === submissionId) {
          return { ...sub, ...updatedFields } as Submission;
        }
        return sub;
      })
    );

    if (updatedFields.totalScore !== undefined) {
      const targetSub = submissions.find((s) => s.id === submissionId);
      if (targetSub) {
        const studentId = targetSub.studentId;
        const studentGraded = submissions.filter(
          (s) => s.studentId === studentId && (s.id === submissionId ? updatedFields.totalScore : s.totalScore !== undefined)
        );

        if (studentGraded.length > 0) {
          const totalEarned = studentGraded.reduce((acc, curr) => {
            const sc = curr.id === submissionId ? updatedFields.totalScore! : (curr.totalScore || 0);
            return acc + (sc / curr.maxScore);
          }, 0);
          const newAvg = Math.round((totalEarned / studentGraded.length) * 100);

          setStudents((prev) =>
            prev.map((st) => (st.id === studentId ? { ...st, performanceAverage: newAvg } : st))
          );
        }
      }
    }

    showToast(`Graded submission saved and feedback returned to student.`);
  };

  const handleCreateAssignment = (newAssignment: Assignment) => {
    setAssignments([newAssignment, ...assignments]);
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        totalAssignments: s.totalAssignments + 1,
      }))
    );
    showToast(`"${newAssignment.title}" given out to all classes!`);
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    setAssignments(assignments.filter((a) => a.id !== assignmentId));
    setSubmissions(submissions.filter((s) => s.assignmentId !== assignmentId));
    showToast(`Assignment removed from student portal.`);
  };

  const handleUploadPaper = (newPaper: PastPaper) => {
    setPastPapers([newPaper, ...pastPapers]);
    showToast(`Paper attachment "${newPaper.fileName}" uploaded!`);
  };

  const handleDeletePaper = (paperId: string) => {
    setPastPapers(pastPapers.filter((p) => p.id !== paperId));
    showToast('Document removed.');
  };

  const handleUpdatePaper = (paperId: string, updated: Partial<PastPaper>) => {
    setPastPapers((prev) =>
      prev.map((p) => (p.id === paperId ? { ...p, ...updated } : p))
    );
    showToast('Document updated successfully!');
  };

  const handleUpdateProfile = (updatedFields: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === currentStudentId ? { ...s, ...updatedFields } : s))
    );
    showToast('Your profile has been updated successfully!');
  };

  const handleRegisterStudent = (
    newStudentData: Omit<Student, 'id' | 'completedAssignments' | 'totalAssignments' | 'performanceAverage' | 'lastActive'>
  ) => {
    const newStudent: Student = {
      ...newStudentData,
      id: `stud-${Date.now()}`,
      completedAssignments: 0,
      totalAssignments: assignments.length,
      performanceAverage: 85,
      lastActive: 'Just registered',
    };
    setStudents([...students, newStudent]);
    setCurrentStudentId(newStudent.id);
    setCurrentRole('student');
    setActiveTab('profile');
    showToast(`Welcome ${newStudent.name}! You are registered and logged in.`);
  };

  const handleSelectStudentToLogin = (student: Student) => {
    setCurrentStudentId(student.id);
    setCurrentRole('student');
    showToast(`Logged in as student: ${student.name}`);
  };

  const handleSelectRole = (role: UserRole, student?: Student) => {
    setCurrentRole(role);
    if (student) {
      setCurrentStudentId(student.id);
    }
  };

  const pendingSubmissionsCount = currentRole === 'teacher'
    ? submissions.filter((s) => s.status === 'submitted').length
    : assignments.filter((a) => !submissions.some((s) => s.assignmentId === a.id && s.studentId === currentStudent.id)).length;

  return (
    <AndroidFrameWrapper
      isSimulatorMode={isSimulatorMode}
      onToggleSimulator={() => setIsSimulatorMode(!isSimulatorMode)}
    >
      {/* Toast notification banner */}
      {toastMessage && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-cyan-950/90 text-cyan-200 border border-cyan-500/50 px-4 py-2 rounded-xl text-xs font-medium shadow-2xl backdrop-blur-md flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Application Bar */}
      <TopAppBar
        currentRole={currentRole}
        currentStudent={currentStudent}
        teacher={teacher}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
        onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
        isSimulatorMode={isSimulatorMode}
        onToggleSimulator={() => setIsSimulatorMode(!isSimulatorMode)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-12">
        {activeTab === 'home' && (
          <DashboardHome
            currentRole={currentRole}
            currentStudent={currentStudent}
            teacher={teacher}
            assignments={assignments}
            submissions={submissions}
            announcements={announcements}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenRoleModal={() => setIsRoleModalOpen(true)}
          />
        )}

        {activeTab === 'assignments' && (
          <TeacherWorkManager
            assignments={assignments}
            submissions={submissions}
            currentRole={currentRole}
            currentStudent={currentStudent}
            onSelectAssignmentForAnswer={() => {
              setActiveTab('submit');
            }}
            onCreateAssignment={handleCreateAssignment}
            onDeleteAssignment={handleDeleteAssignment}
          />
        )}

        {activeTab === 'submit' && (
          <StudentAnswerPortal
            assignments={assignments}
            submissions={submissions}
            currentRole={currentRole}
            currentStudent={currentStudent}
            onForwardAnswers={handleForwardAnswers}
            onGradeSubmission={handleGradeSubmission}
          />
        )}

        {activeTab === 'tutorials' && (
          <TutorialsHub tutorials={tutorials} />
        )}

        {activeTab === 'pastpapers' && (
          <PastPapersManager
            pastPapers={pastPapers}
            currentRole={currentRole}
            teacher={teacher}
            onUploadPaper={handleUploadPaper}
            onDeletePaper={handleDeletePaper}
            onUpdatePaper={handleUpdatePaper}
          />
        )}

        {/* If teacher: Roster; If student: My Profile */}
        {activeTab === 'students' && (
          currentRole === 'teacher' ? (
            <StudentDirectoryView
              students={students}
              onAddStudent={handleRegisterStudent}
              onSelectStudentToLogin={handleSelectStudentToLogin}
              currentStudentId={currentStudent.id}
            />
          ) : (
            <StudentProfileView
              currentStudent={currentStudent}
              submissions={submissions}
              assignments={assignments}
              onUpdateProfile={handleUpdateProfile}
              onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
            />
          )
        )}

        {activeTab === 'profile' && (
          <StudentProfileView
            currentStudent={currentStudent}
            submissions={submissions}
            assignments={assignments}
            onUpdateProfile={handleUpdateProfile}
            onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
          />
        )}

        {activeTab === 'quiz' && (
          <PracticeArena />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Tab Bar */}
      <BottomTabBar
        activeTab={activeTab === 'students' && currentRole === 'student' ? 'profile' : activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        currentRole={currentRole}
        pendingSubmissionsCount={pendingSubmissionsCount}
      />

      {/* User Session & Password Switcher Modal (Keep student passwords hidden) */}
      <RoleSwitcherModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        currentRole={currentRole}
        currentStudent={currentStudent}
        teacher={teacher}
        students={students}
        onSelectRole={handleSelectRole}
        onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
      />

      {/* Student Self-Registration Modal */}
      <StudentRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegisterStudent={handleRegisterStudent}
        existingCount={students.length}
      />
    </AndroidFrameWrapper>
  );
}
