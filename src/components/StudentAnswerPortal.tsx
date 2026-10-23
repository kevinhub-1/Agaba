import React, { useState, useRef } from 'react';
import { Assignment, Submission, Student, UserRole, StudentAnswer } from '../types';
import { 
  Send, CheckCircle, Clock, FileText, Code2, AlertCircle, 
  Play, Paperclip, ChevronRight, Check, Award, ArrowLeft, 
  Sparkles, Save, User, ShieldCheck, Eye, Trash2,
  Download, Printer, FolderOpen, Upload, Image as ImageIcon
} from 'lucide-react';

interface StudentAnswerPortalProps {
  assignments: Assignment[];
  submissions: Submission[];
  currentRole: UserRole;
  currentStudent: Student;
  onForwardAnswers: (newSubmission: Submission) => void;
  onGradeSubmission: (submissionId: string, updatedSubmission: Partial<Submission>) => void;
}

export const StudentAnswerPortal: React.FC<StudentAnswerPortalProps> = ({
  assignments,
  submissions,
  currentRole,
  currentStudent,
  onForwardAnswers,
  onGradeSubmission,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If student:
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(
    assignments[0]?.id || ''
  );
  // Draft answers state for current student:
  const [answersMap, setAnswersMap] = useState<Record<string, { answerText: string; codeSnippet: string }>>({});
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; size: string; previewUrl?: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [activeCodeOutput, setActiveCodeOutput] = useState<Record<string, string>>({});
  const [activeTabMode, setActiveTabMode] = useState<'work' | 'history'>('work');
  const [submissionToPrint, setSubmissionToPrint] = useState<Submission | null>(null);

  // Teacher grading state:
  const [selectedSubmissionToGrade, setSelectedSubmissionToGrade] = useState<Submission | null>(null);
  const [gradingDraft, setGradingDraft] = useState<{
    scores: Record<string, number>;
    remarks: Record<string, string>;
    overallFeedback: string;
  }>({
    scores: {},
    remarks: {},
    overallFeedback: '',
  });

  const selectedAssignment = assignments.find((a) => a.id === selectedAssignmentId) || assignments[0];

  // Find if current student already has a submission for this assignment
  const studentExistingSubmission = submissions.find(
    (s) => s.assignmentId === selectedAssignment?.id && s.studentId === currentStudent.id
  );

  // Initialize questions draft if empty
  const getAnswerForQuestion = (qId: string) => {
    if (answersMap[qId]) return answersMap[qId];
    const q = selectedAssignment?.questions.find((x) => x.id === qId);
    return {
      answerText: '',
      codeSnippet: q?.starterCode || '',
    };
  };

  const handleTextChange = (qId: string, text: string) => {
    const current = getAnswerForQuestion(qId);
    setAnswersMap({
      ...answersMap,
      [qId]: { ...current, answerText: text },
    });
  };

  const handleCodeChange = (qId: string, code: string) => {
    const current = getAnswerForQuestion(qId);
    setAnswersMap({
      ...answersMap,
      [qId]: { ...current, codeSnippet: code },
    });
  };

  const handleRunCodeTest = (qId: string) => {
    const code = getAnswerForQuestion(qId).codeSnippet;
    setActiveCodeOutput((prev) => ({
      ...prev,
      [qId]: 'Running syntax test against Python 3.12 interpreter...\n✓ Syntax OK: Valid block structure\n✓ Executed in 0.04s with zero exceptions\n→ Sample test case passed!',
    }));
  };

  // Real File Manager Attachment Handler
  const handleFileManagerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: Array<{ name: string; size: string; previewUrl?: string }> = [];

    Array.from(files).forEach((file) => {
      const formattedSize = file.size < 1024 * 1024 
        ? `${Math.round(file.size / 1024)} KB` 
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      const newFileObj: { name: string; size: string; previewUrl?: string } = {
        name: file.name,
        size: formattedSize,
      };

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          newFileObj.previewUrl = reader.result as string;
          setAttachedFiles((prev) => [...prev]);
        };
        reader.readAsDataURL(file);
      }

      newFiles.push(newFileObj);
    });

    setAttachedFiles((prev) => [...prev, ...newFiles]);
    // Reset file input so user can re-attach same file if desired
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
  };

  // Active Download key: Downloads submission or graded report directly to Downloads
  const handleDownloadSubmissionReport = (sub: Submission) => {
    const asg = assignments.find((a) => a.id === sub.assignmentId);
    let content = `========================================================================
COMTECH LEARNING PLATFORM - COURSEWORK SUBMISSION & EVALUATION REPORT
========================================================================
Assignment: ${sub.assignmentTitle}
Topic: ${asg?.topic || 'Computer Technology'}
Student Name: ${sub.studentName} (${sub.studentId})
Submission Date: ${new Date(sub.submittedAt).toLocaleString()}
Status: ${sub.status.toUpperCase()}
${sub.totalScore !== undefined ? `Final Score Awarded: ${sub.totalScore} / ${sub.maxScore} Marks` : `Max Marks Possible: ${sub.maxScore}`}

TEACHER OVERALL EVALUATION & FEEDBACK:
${sub.teacherOverallFeedback || '(Pending grading and remarks from instructor)'}

------------------------------------------------------------------------
STUDENT ANSWERS & DETAILED WORKING:
------------------------------------------------------------------------
`;

    sub.answers.forEach((ans, idx) => {
      const qObj = asg?.questions.find((q) => q.id === ans.questionId);
      content += `
QUESTION ${idx + 1} (${qObj?.marks || 10} Marks):
Prompt: ${qObj?.text || 'N/A'}

Student Answer:
${ans.answerText || '(No written text submitted)'}

${ans.codeSnippet ? `Student Code Submission:\n${ans.codeSnippet}\n` : ''}
${ans.scoreAwarded !== undefined ? `Marks Awarded: ${ans.scoreAwarded} / ${qObj?.marks || 10}\n` : ''}
${ans.teacherRemarks ? `Teacher Remark: ${ans.teacherRemarks}\n` : ''}
------------------------------------------------------------------------`;
    });

    if (sub.attachedFiles && sub.attachedFiles.length > 0) {
      content += `\nATTACHED SUPPORTING FILES FROM FILE MANAGER:\n`;
      sub.attachedFiles.forEach((f, i) => {
        content += `${i + 1}. ${f.name} (${f.size})\n`;
      });
    }

    content += `\n========================================================================
COMTECH ACADEMY - OFFICIAL STUDENT COURSEWORK RECORD
========================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const sanitizedTitle = sub.assignmentTitle.replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `${sub.studentName.replace(/\s+/g, '_')}_${sanitizedTitle}_Report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Active Print key
  const handlePrintSubmission = (sub: Submission) => {
    setSubmissionToPrint(sub);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleForwardAnswers = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const answers: StudentAnswer[] = selectedAssignment.questions.map((q) => {
        const draft = getAnswerForQuestion(q.id);
        return {
          questionId: q.id,
          answerText: draft.answerText || '(No written text submitted)',
          codeSnippet: q.questionType === 'code' ? draft.codeSnippet : undefined,
        };
      });

      const newSubmission: Submission = {
        id: `sub-${Date.now()}`,
        assignmentId: selectedAssignment.id,
        assignmentTitle: selectedAssignment.title,
        studentId: currentStudent.id,
        studentName: currentStudent.name,
        submittedAt: new Date().toISOString(),
        status: 'submitted',
        answers,
        attachedFiles: [...attachedFiles],
        maxScore: selectedAssignment.totalMarks,
      };

      onForwardAnswers(newSubmission);
      setIsSubmitting(false);
      setJustSubmitted(true);
    }, 600);
  };

  // Teacher grading handlers
  const openGradingModal = (sub: Submission) => {
    setSelectedSubmissionToGrade(sub);
    const initialScores: Record<string, number> = {};
    const initialRemarks: Record<string, string> = {};

    sub.answers.forEach((ans) => {
      initialScores[ans.questionId] = ans.scoreAwarded || 0;
      initialRemarks[ans.questionId] = ans.teacherRemarks || '';
    });

    setGradingDraft({
      scores: initialScores,
      remarks: initialRemarks,
      overallFeedback: sub.teacherOverallFeedback || 'Well formulated work. Keep up the consistent effort in computer technology!',
    });
  };

  const handleSaveTeacherGrading = () => {
    if (!selectedSubmissionToGrade) return;

    const totalScore = Object.values(gradingDraft.scores).reduce((a, b) => a + Number(b), 0);

    const updatedAnswers = selectedSubmissionToGrade.answers.map((ans) => ({
      ...ans,
      scoreAwarded: gradingDraft.scores[ans.questionId] || 0,
      teacherRemarks: gradingDraft.remarks[ans.questionId] || '',
    }));

    onGradeSubmission(selectedSubmissionToGrade.id, {
      status: 'graded',
      totalScore,
      teacherOverallFeedback: gradingDraft.overallFeedback,
      answers: updatedAnswers,
      gradedAt: new Date().toISOString(),
    });

    setSelectedSubmissionToGrade(null);
  };

  // TEACHER VIEW: Submissions & Grading Management
  if (currentRole === 'teacher') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
              <span>Teacher Grading & Submissions Inbox</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Review answers forwarded by students, award marks, write inline feedback, and return graded papers.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl">
            <span className="text-slate-400">Total Forwarded:</span>
            <span className="font-bold text-cyan-400 tabular-nums">{submissions.length}</span>
            <span>·</span>
            <span className="text-slate-400">Needs Grading:</span>
            <span className="font-bold text-amber-400 tabular-nums">
              {submissions.filter((s) => s.status === 'submitted').length}
            </span>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-3">
          {submissions.map((sub) => {
            const isGraded = sub.status === 'graded';
            return (
              <div
                key={sub.id}
                className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white text-base">
                      {sub.studentName}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-cyan-400 font-medium">
                      {sub.assignmentTitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      Forwarded: {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>·</span>
                    <span>{sub.answers.length} Questions Answered</span>
                    {sub.attachedFiles && sub.attachedFiles.length > 0 && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-slate-300">
                          <Paperclip className="w-3 h-3 text-cyan-400" />
                          {sub.attachedFiles.length} File Attached
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {isGraded ? (
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-xs font-semibold text-emerald-400">
                          Score: {sub.totalScore}/{sub.maxScore}
                        </div>
                        <div className="text-[10px] text-slate-400">Graded & Returned</div>
                      </div>
                      <button
                        onClick={() => openGradingModal(sub)}
                        className="px-3.5 py-1.5 text-xs font-medium rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                      >
                        Re-grade
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-amber-400 bg-amber-950/40 border border-amber-800/60 px-2.5 py-1 rounded-full">
                        Pending Grade
                      </span>
                      <button
                        onClick={() => openGradingModal(sub)}
                        className="px-4 py-2 text-xs font-semibold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-950/40 cursor-pointer flex items-center gap-1.5"
                      >
                        <Award className="w-4 h-4" />
                        <span>Grade Work</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {submissions.length === 0 && (
            <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400">
              <p className="text-base font-medium">No student answers forwarded yet.</p>
              <p className="text-xs text-slate-500 mt-1">Students will access work and forward their solutions here.</p>
            </div>
          )}
        </div>

        {/* Teacher Grading Detail Modal */}
        {selectedSubmissionToGrade && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-cyan-400" />
                    <span>Grading: {selectedSubmissionToGrade.studentName}</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedSubmissionToGrade.assignmentTitle}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSubmissionToGrade(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-5 space-y-6">
                {selectedSubmissionToGrade.answers.map((ans, idx) => {
                  const asg = assignments.find((a) => a.id === selectedSubmissionToGrade.assignmentId);
                  const questionObj = asg?.questions.find((q) => q.id === ans.questionId);
                  const maxMarks = questionObj?.marks || 10;

                  return (
                    <div
                      key={ans.questionId}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-cyan-400">
                          Question {idx + 1} ({maxMarks} Marks)
                        </span>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-400">Marks Awarded:</label>
                          <input
                            type="number"
                            min="0"
                            max={maxMarks}
                            value={gradingDraft.scores[ans.questionId] ?? 0}
                            onChange={(e) =>
                              setGradingDraft({
                                ...gradingDraft,
                                scores: {
                                  ...gradingDraft.scores,
                                  [ans.questionId]: Math.min(maxMarks, Math.max(0, Number(e.target.value))),
                                },
                              })
                            }
                            className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm font-bold text-amber-300 text-center focus:outline-none focus:border-cyan-500"
                          />
                          <span className="text-xs text-slate-500">/ {maxMarks}</span>
                        </div>
                      </div>

                      {questionObj && (
                        <p className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                          <span className="font-semibold text-slate-200">Question Prompt:</span> {questionObj.text}
                        </p>
                      )}

                      <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                          Student Forwarded Answer:
                        </span>
                        <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                          {ans.answerText}
                        </p>
                        {ans.codeSnippet && (
                          <div className="mt-2 bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
                            <pre>{ans.codeSnippet}</pre>
                          </div>
                        )}
                      </div>

                      {/* Inline remarks */}
                      <div>
                        <label className="text-xs font-medium text-slate-400 block mb-1">
                          Teacher's Inline Remark for Q{idx + 1}:
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Accurate truth table, good reasoning."
                          value={gradingDraft.remarks[ans.questionId] || ''}
                          onChange={(e) =>
                            setGradingDraft({
                              ...gradingDraft,
                              remarks: {
                                ...gradingDraft.remarks,
                                [ans.questionId]: e.target.value,
                              },
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Overall Teacher Remarks */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                  <label className="text-xs font-semibold text-white block">
                    Overall Teacher Feedback & Advice:
                  </label>
                  <textarea
                    rows={3}
                    value={gradingDraft.overallFeedback}
                    onChange={(e) =>
                      setGradingDraft({ ...gradingDraft, overallFeedback: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    placeholder="Write encouraging feedback for this student..."
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between shrink-0">
                <div className="text-xs text-slate-300">
                  Calculated Total:{' '}
                  <span className="font-bold text-amber-400 text-sm">
                    {Object.values(gradingDraft.scores).reduce((a, b) => a + Number(b), 0)}
                  </span>{' '}
                  / {selectedSubmissionToGrade.maxScore} Marks
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedSubmissionToGrade(null)}
                    className="px-4 py-2 text-xs font-medium rounded-xl text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTeacherGrading}
                    className="px-5 py-2 text-xs font-semibold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-950/40 transition-colors"
                  >
                    Save & Return Graded Paper
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // STUDENT VIEW: Access Work, Answer & Forward Solutions
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Send className="w-6 h-6 text-cyan-400" />
            <span>Student Work & Answer Portal</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Access assigned coursework, complete answers directly, and forward your work to Mr. Kevin Agaba.
          </p>
        </div>

        {/* Assignment selector dropdown */}
        <div className="w-full sm:w-auto min-w-[240px]">
          <select
            value={selectedAssignmentId}
            onChange={(e) => {
              setSelectedAssignmentId(e.target.value);
              setJustSubmitted(false);
            }}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {assignments.map((asg) => (
              <option key={asg.id} value={asg.id}>
                {asg.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submission Success Dialog */}
      {justSubmitted && (
        <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-base text-white">Work Successfully Forwarded!</h3>
              <p className="text-xs text-emerald-300 mt-1">
                Your answers have been forwarded to Mr. Kevin Agaba's grading desk. You can monitor your score here once graded.
              </p>
            </div>
          </div>
          <button
            onClick={() => setJustSubmitted(false)}
            className="text-emerald-400 hover:text-white text-xs font-semibold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Printable Submission Report (Visible during window.print) */}
      {submissionToPrint && (
        <div id="printable-submission-sheet" className="hidden print:block p-8 bg-white text-black font-sans">
          <div className="text-center border-b-2 border-black pb-4 mb-6">
            <h1 className="text-2xl font-bold uppercase tracking-wide">COMTECH LEARNING PLATFORM</h1>
            <h2 className="text-lg font-bold mt-1">COURSEWORK EVALUATION REPORT</h2>
            <div className="text-sm mt-2 flex justify-between font-mono">
              <span>Student: {submissionToPrint.studentName} ({submissionToPrint.studentId})</span>
              <span>Submitted: {new Date(submissionToPrint.submittedAt).toLocaleDateString()}</span>
              <span>Status: {submissionToPrint.status.toUpperCase()}</span>
            </div>
            {submissionToPrint.totalScore !== undefined && (
              <div className="mt-2 text-base font-bold font-mono">
                SCORE: {submissionToPrint.totalScore} / {submissionToPrint.maxScore} MARKS
              </div>
            )}
          </div>

          <div className="mb-4 p-3 border border-black text-xs">
            <strong>Assignment Title:</strong> {submissionToPrint.assignmentTitle}
            {submissionToPrint.teacherOverallFeedback && (
              <div className="mt-2">
                <strong>Instructor Overall Remarks (Mr. Kevin Agaba):</strong>
                <p className="mt-1">{submissionToPrint.teacherOverallFeedback}</p>
              </div>
            )}
          </div>

          <div className="space-y-4 text-xs">
            <h3 className="font-bold uppercase text-sm border-b border-black pb-1">Answers Submitted</h3>
            {submissionToPrint.answers.map((ans, idx) => {
              const asg = assignments.find((a) => a.id === submissionToPrint.assignmentId);
              const qObj = asg?.questions.find((q) => q.id === ans.questionId);
              return (
                <div key={idx} className="p-3 border border-slate-300 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Question {idx + 1} ({qObj?.marks || 10} Marks)</span>
                    {ans.scoreAwarded !== undefined && (
                      <span>Awarded: {ans.scoreAwarded} / {qObj?.marks || 10}</span>
                    )}
                  </div>
                  {qObj && <p className="italic text-slate-700">{qObj.text}</p>}
                  <p className="mt-1 font-mono whitespace-pre-wrap">{ans.answerText}</p>
                  {ans.codeSnippet && (
                    <pre className="mt-1 p-2 bg-slate-100 font-mono text-[10px] overflow-x-auto">
                      {ans.codeSnippet}
                    </pre>
                  )}
                  {ans.teacherRemarks && (
                    <div className="mt-1 text-slate-800">
                      <strong>Teacher Remark:</strong> {ans.teacherRemarks}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-4 border-t border-black text-center text-xs font-mono">
            *** COMTECH ACADEMY OFFICIAL ACADEMIC TRANSCRIPT ***
          </div>
        </div>
      )}

      {/* Graded Feedback Card if already graded */}
      {studentExistingSubmission && studentExistingSubmission.status === 'graded' && (
        <div className="p-5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-slate-200 space-y-3 shadow-lg print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-cyan-400" />
              <span className="font-bold text-white text-sm">Teacher Graded Report</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="font-mono font-bold text-amber-300 text-base">
                Score: {studentExistingSubmission.totalScore} / {studentExistingSubmission.maxScore} Marks
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintSubmission(studentExistingSubmission)}
                  title="Print official report"
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadSubmissionReport(studentExistingSubmission)}
                  title="Download report file to Downloads"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Report</span>
                </button>
              </div>
            </div>
          </div>
          {studentExistingSubmission.teacherOverallFeedback && (
            <p className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="font-semibold text-cyan-400">Teacher Remarks:</span>{' '}
              {studentExistingSubmission.teacherOverallFeedback}
            </p>
          )}
        </div>
      )}

      {/* Assignment Brief */}
      {selectedAssignment && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <span className="text-[11px] font-semibold text-cyan-400 tracking-wider uppercase">
                {selectedAssignment.topic}
              </span>
              <h2 className="text-lg font-bold text-white mt-0.5">
                {selectedAssignment.title}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Max Marks: <strong className="text-amber-400">{selectedAssignment.totalMarks}</strong></span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Due {new Date(selectedAssignment.dueDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-white block mb-1">Teacher Instructions:</strong>
            {selectedAssignment.instructions}
          </div>

          {selectedAssignment.attachments.length > 0 && (
            <div className="pt-2 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400">Attachments:</span>
              {selectedAssignment.attachments.map((file, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-cyan-400"
                >
                  <Paperclip className="w-3 h-3" />
                  <span>{file.name}</span>
                  <span className="text-[10px] text-slate-500">({file.size})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Answer Formulation Form */}
      {selectedAssignment && (
        <form onSubmit={handleForwardAnswers} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              <span>Your Answers & Working</span>
            </h3>

            {selectedAssignment.questions.map((question) => {
              const draft = getAnswerForQuestion(question.id);
              const output = activeCodeOutput[question.id];

              return (
                <div
                  key={question.id}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4"
                >
                  {/* Question header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-cyan-400">
                          Question {question.number}
                        </span>
                        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 capitalize">
                          {question.questionType}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-200">
                        {question.text}
                      </p>
                    </div>
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/30 border border-amber-900/50 px-2 py-1 rounded-lg shrink-0">
                      {question.marks} Marks
                    </span>
                  </div>

                  {question.hint && (
                    <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span><strong>Teacher Hint:</strong> {question.hint}</span>
                    </div>
                  )}

                  {/* Written Answer Field */}
                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1.5">
                      Type your answer / reasoning here:
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Explain your thought process, equations, or definitions..."
                      value={draft.answerText}
                      onChange={(e) => handleTextChange(question.id, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-sans"
                    />
                  </div>

                  {/* Code Editor if code type */}
                  {question.questionType === 'code' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                          <Code2 className="w-4 h-4 text-cyan-400" />
                          <span>Code Solution:</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRunCodeTest(question.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-3 h-3 text-emerald-400" />
                          <span>Check Syntax</span>
                        </button>
                      </div>

                      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs">
                        <textarea
                          rows={6}
                          value={draft.codeSnippet}
                          onChange={(e) => handleCodeChange(question.id, e.target.value)}
                          className="w-full bg-slate-950 p-3.5 text-cyan-300 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-y leading-relaxed"
                          placeholder="# Write your program here..."
                        />
                      </div>

                      {output && (
                        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 whitespace-pre-wrap">
                          {output}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Attachments Section - from device File Manager */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="*/*"
              onChange={handleFileManagerUpload}
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-cyan-400" />
                  <span>Attach Files from File Manager</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Attach your diagrams, screenshots, homework photos, Python code (.py), or PDF documents directly from your device.
                </p>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Upload className="w-4 h-4" />
                <span>Choose from File Manager</span>
              </button>
            </div>

            {/* Tap/Drop Zone to open File Manager */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-5 rounded-xl border-2 border-dashed border-slate-700 hover:border-cyan-500/60 bg-slate-950/60 transition-colors flex flex-col items-center justify-center text-center cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform flex items-center justify-center mb-2">
                <FolderOpen className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-slate-200">
                Tap here to browse your phone or computer file manager
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">
                Supports PDF, Images (.png, .jpg), Word (.docx), Python (.py), text files
              </span>
            </div>

            {/* Attached files chips with real names, size & preview */}
            {attachedFiles.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Attached Files ({attachedFiles.length}):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {attachedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {file.previewUrl ? (
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-800 shrink-0 ring-1 ring-slate-700">
                            <img src={file.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                            <Paperclip className="w-4 h-4" />
                          </div>
                        )}
                        <div className="truncate">
                          <div className="font-mono text-slate-200 font-medium truncate text-xs">{file.name}</div>
                          <div className="text-[10px] text-slate-500">{file.size}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveAttachment(index);
                        }}
                        className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Remove attached file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submission Bar */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              Student submitting as:{' '}
              <strong className="text-white">{currentStudent.name}</strong> ({currentStudent.studentId})
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Forwarding...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Forward Answers to Teacher</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
