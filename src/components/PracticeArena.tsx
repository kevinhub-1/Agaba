import React, { useState } from 'react';
import { 
  Award, Sparkles, CheckCircle2, XCircle, RotateCcw, 
  Clock, Flame, Trophy, ArrowRight, ShieldCheck 
} from 'lucide-react';

interface QuestionItem {
  id: number;
  question: string;
  topic: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuestionItem[] = [
  {
    id: 1,
    topic: 'Computer Hardware',
    question: 'Which component of the Central Processing Unit performs arithmetic calculations and logical decisions?',
    options: ['Control Unit (CU)', 'Arithmetic Logic Unit (ALU)', 'Memory Management Unit (MMU)', 'Program Counter (PC)'],
    correctIndex: 1,
    explanation: 'The Arithmetic Logic Unit (ALU) is the primary digital execution circuitry responsible for integer arithmetic (add, subtract) and Boolean logic operations (AND, OR, NOT).',
  },
  {
    id: 2,
    topic: 'Python Programming',
    question: 'What is the output of the Python expression: bool([] or 0 or "COMTECH")?',
    options: ['False', 'True', '0', 'COMTECH'],
    correctIndex: 1,
    explanation: 'In Python, empty lists [] and 0 are falsy. "COMTECH" is a truthy string. The expression evaluates to "COMTECH", and bool("COMTECH") returns True.',
  },
  {
    id: 3,
    topic: 'Computer Networks',
    question: 'At which layer of the OSI model does the Internet Protocol (IPv4 / IPv6) operate?',
    options: ['Data Link Layer (Layer 2)', 'Network Layer (Layer 3)', 'Transport Layer (Layer 4)', 'Session Layer (Layer 5)'],
    correctIndex: 1,
    explanation: 'The Network Layer (Layer 3) provides end-to-end logical packet addressing, routing, and path determination via IP addresses.',
  },
  {
    id: 4,
    topic: 'Data Representation',
    question: 'How many distinct binary states can be uniquely represented by an 8-bit byte?',
    options: ['128 states', '255 states', '256 states', '512 states'],
    correctIndex: 2,
    explanation: 'An 8-bit byte has 2^8 = 256 distinct permutations (from decimal 0 to 255 inclusive).',
  },
  {
    id: 5,
    topic: 'Databases & SQL',
    question: 'Which SQL clause is used to filter aggregated grouped records created by GROUP BY?',
    options: ['WHERE', 'ORDER BY', 'HAVING', 'FILTER BY'],
    correctIndex: 2,
    explanation: 'WHERE filters individual row records before grouping, whereas HAVING filters aggregated groups created by GROUP BY.',
  },
];

export const PracticeArena: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = QUIZ_QUESTIONS[currentIndex];

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctIndex) {
      setScore((prev) => prev + 10);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setIsFinished(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            <span>Tech Quiz & Knowledge Arena</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Test your computer science mastery with instant rationale feedback.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Score:</span>
            <span className="font-bold text-amber-400 tabular-nums">{score} pts</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-slate-400">Streak:</span>
            <span className="font-bold text-orange-400 tabular-nums">{streak}x</span>
          </div>
        </div>
      </div>

      {!isFinished ? (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6 max-w-3xl mx-auto">
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Question {currentIndex + 1} of {QUIZ_QUESTIONS.length}</span>
              <span className="font-medium text-cyan-400">{currentQ.topic}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
              {currentQ.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correctIndex;

              let style = 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700';
              if (isAnswered) {
                if (isCorrect) {
                  style = 'bg-emerald-950/40 border-emerald-500 text-emerald-200';
                } else if (isSelected) {
                  style = 'bg-red-950/40 border-red-500 text-red-200';
                } else {
                  style = 'bg-slate-950/50 border-slate-900 text-slate-500';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleSelect(idx)}
                  className={`w-full p-4 rounded-2xl border text-xs sm:text-sm text-left font-medium transition-all flex items-center justify-between cursor-pointer ${style}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-slate-400 text-xs flex items-center justify-center font-mono">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>

                  {isAnswered && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {isAnswered && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation if answered */}
          {isAnswered && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-white flex items-center gap-1.5 text-cyan-400">
                <ShieldCheck className="w-4 h-4" />
                Teacher Explanation:
              </span>
              <p className="text-slate-300 leading-relaxed">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Next Button */}
          {isAnswered && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleNext}
                className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-950/40 cursor-pointer"
              >
                <span>{currentIndex < QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'View Results'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Finished Screen */
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center max-w-md mx-auto space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 mx-auto flex items-center justify-center">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Quiz Challenge Complete!</h2>
            <p className="text-xs text-slate-400">
              You scored <strong className="text-amber-400 font-bold">{score} / {QUIZ_QUESTIONS.length * 10}</strong> points.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
            {score >= 40
              ? 'Excellent performance! You demonstrate a solid grasp of core computing concepts.'
              : 'Good attempt! Review the tutorials and past papers to strengthen these areas.'}
          </div>

          <button
            onClick={handleRestart}
            className="w-full py-2.5 text-xs font-semibold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Practice Quiz</span>
          </button>
        </div>
      )}
    </div>
  );
};
