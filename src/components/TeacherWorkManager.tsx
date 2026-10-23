import React, { useState } from 'react';
import { Assignment, UserRole, Student, Submission } from '../types';
import { 
  FileText, Plus, Calendar, Clock, AlertCircle, CheckCircle, 
  ChevronRight, BookOpen, Send, Sparkles, X, Trash2, Award
} from 'lucide-react';

interface TeacherWorkManagerProps {
  assignments: Assignment[];
  submissions: Submission[];
  currentRole: UserRole;
  currentStudent: Student;
  onSelectAssignmentForAnswer: (assignmentId: string) => void;
  onCreateAssignment: (newAssignment: Assignment) => void;
  onDeleteAssignment: (assignmentId: string) => void;
}

export const TeacherWorkManager: React.FC<TeacherWorkManagerProps> = ({
  assignments,
  submissions,
  currentRole,
  currentStudent,
  onSelectAssignmentForAnswer,
  onCreateAssignment,
  onDeleteAssignment,
}) => {
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New assignment form state
  const [newTitle, setNewTitle] = useState('');
  const [newTopic, setNewTopic] = useState('Computer Systems & Hardware');
  const [newDueDate, setNewDueDate] = useState('2026-11-15T23:59');
  const [newInstructions, setNewInstructions] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [questionsList, setQuestionsList] = useState<
    Array<{ text: string; marks: number; type: 'theory' | 'code' | 'practical'; starterCode?: string }>
  >([
    { text: 'Explain the function of cache memory in the CPU architecture.', marks: 10, type: 'theory' },
    { text: 'Write a Python function to convert binary string into decimal integer.', marks: 15, type: 'code', starterCode: 'def bin_to_dec(b_str: str) -> int:\n    return int(b_str, 2)' },
  ]);

  const handleAddQuestionRow = () => {
    setQuestionsList([
      ...questionsList,
      { text: '', marks: 10, type: 'theory' },
    ]);
  };

  const handleRemoveQuestionRow = (index: number) => {
    setQuestionsList(questionsList.filter((_, i) => i !== index));
  };

  const handleSaveNewAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || questionsList.length === 0) return;

    const totalMarks = questionsList.reduce((sum, q) => sum + Number(q.marks), 0);
    const newAsg: Assignment = {
      id: `asg-${Date.now()}`,
      title: newTitle.trim(),
      topic: newTopic,
      subject: 'Computer Studies',
      dueDate: newDueDate,
      totalMarks,
      difficulty: newDifficulty,
      instructions: newInstructions.trim() || 'Complete all questions thoroughly and forward your answers before the deadline.',
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      teacherName: 'Mr. Kevin Agaba',
      attachments: [
        { name: 'Teacher_Assignment_Guide.pdf', size: '1.1 MB', type: 'PDF' },
      ],
      questions: questionsList.map((q, idx) => ({
        id: `q-${Date.now()}-${idx}`,
        number: idx + 1,
        text: q.text || `Question ${idx + 1}`,
        marks: Number(q.marks) || 10,
        questionType: q.type,
        starterCode: q.starterCode,
      })),
    };

    onCreateAssignment(newAsg);
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewInstructions('');
  };

  const filteredAssignments = assignments.filter((asg) => {
    if (filterDifficulty === 'all') return true;
    return asg.difficulty.toLowerCase() === filterDifficulty.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            <span>Coursework & Assignments</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {currentRole === 'teacher'
              ? 'Publish new work, distribute coursework questions, and monitor student submission progress.'
              : 'Browse assignments assigned by Mr. Kevin Agaba and forward your completed work.'}
          </p>
        </div>

        {currentRole === 'teacher' && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-950/40 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Give Out New Work</span>
          </button>
        )}
      </div>

      {/* Difficulty Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 font-medium whitespace-nowrap">Filter Level:</span>
        {['all', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => (
          <button
            key={diff}
            onClick={() => setFilterDifficulty(diff)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filterDifficulty === diff
                ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            {diff === 'all' ? 'All Difficulties' : diff}
          </button>
        ))}
      </div>

      {/* Assignments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAssignments.map((assignment) => {
          // Check if current student has submitted
          const studentSubmission = submissions.find(
            (s) => s.assignmentId === assignment.id && s.studentId === currentStudent.id
          );
          const isSubmitted = !!studentSubmission;
          const isGraded = studentSubmission?.status === 'graded';

          // Teacher stats
          const totalSubmissions = submissions.filter((s) => s.assignmentId === assignment.id).length;

          return (
            <div
              key={assignment.id}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/70 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="text-cyan-400 font-medium">{assignment.topic}</span>
                  <span className="font-mono text-amber-300 font-semibold">
                    {assignment.totalMarks} Marks
                  </span>
                </div>

                <h3 className="text-base font-bold text-white leading-snug">
                  {assignment.title}
                </h3>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {assignment.instructions}
                </p>

                <div className="flex items-center gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800/60 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    Due {new Date(assignment.dueDate).toLocaleDateString()}
                  </span>
                  <span>·</span>
                  <span>{assignment.questions.length} Questions</span>
                  <span>·</span>
                  <span className="text-slate-300">{assignment.difficulty}</span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800/60">
                {currentRole === 'teacher' ? (
                  <div className="flex items-center justify-between w-full">
                    <div className="text-xs text-slate-400">
                      Submissions:{' '}
                      <strong className="text-cyan-400 tabular-nums">
                        {totalSubmissions}
                      </strong>{' '}
                      received
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectAssignmentForAnswer(assignment.id)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-colors cursor-pointer"
                      >
                        View & Answer Sheet
                      </button>
                      <button
                        onClick={() => onDeleteAssignment(assignment.id)}
                        title="Delete assignment"
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <div>
                      {isGraded ? (
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" />
                          Graded: {studentSubmission.totalScore}/{studentSubmission.maxScore}
                        </span>
                      ) : isSubmitted ? (
                        <span className="text-xs font-medium text-cyan-400 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Answers Forwarded
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-amber-400 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Pending Submission
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => onSelectAssignmentForAnswer(assignment.id)}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors flex items-center gap-1 cursor-pointer shadow-md shadow-cyan-950/40"
                    >
                      <span>{isSubmitted ? 'View Work' : 'Open & Answer'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Give Out New Work Modal (Teacher) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-cyan-400" />
                  <span>Give Out New Work (Teacher Dispatch)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Publish assignments directly to the COMTECH student portal.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewAssignment} className="flex-1 overflow-y-auto py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Assignment 5: Object Oriented Programming in Python"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Subject Topic
                  </label>
                  <input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Due Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Teacher Instructions & Objectives
                </label>
                <textarea
                  rows={2}
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  placeholder="Detail what students should focus on, expected format, and submission deadlines..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Questions Builder */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-cyan-400">
                    Assignment Questions ({questionsList.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddQuestionRow}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Question
                  </button>
                </div>

                {questionsList.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2 relative"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Question {idx + 1}</span>
                      <div className="flex items-center gap-3">
                        <select
                          value={q.type}
                          onChange={(e) => {
                            const updated = [...questionsList];
                            updated[idx].type = e.target.value as any;
                            setQuestionsList(updated);
                          }}
                          className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300 text-[11px]"
                        >
                          <option value="theory">Theory</option>
                          <option value="code">Code / Programming</option>
                          <option value="practical">Practical / Diagram</option>
                        </select>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            value={q.marks}
                            onChange={(e) => {
                              const updated = [...questionsList];
                              updated[idx].marks = Number(e.target.value);
                              setQuestionsList(updated);
                            }}
                            className="w-12 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-center text-amber-300 font-bold text-xs"
                          />
                          <span>marks</span>
                        </div>
                        {questionsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestionRow(idx)}
                            className="text-slate-500 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <textarea
                      rows={2}
                      required
                      placeholder="Type the question prompt..."
                      value={q.text}
                      onChange={(e) => {
                        const updated = [...questionsList];
                        updated[idx].text = e.target.value;
                        setQuestionsList(updated);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />

                    {q.type === 'code' && (
                      <input
                        type="text"
                        placeholder="Optional starter code snippet..."
                        value={q.starterCode || ''}
                        onChange={(e) => {
                          const updated = [...questionsList];
                          updated[idx].starterCode = e.target.value;
                          setQuestionsList(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] font-mono text-cyan-300"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-950/40 transition-colors"
                >
                  Dispatch to Students
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
