import React, { useState } from 'react';
import { Tutorial } from '../types';
import { 
  BookOpen, Play, Pause, RotateCcw, Volume2, Maximize, 
  Copy, Check, Sparkles, CheckCircle2, XCircle, Award, 
  Clock, Star, ChevronDown, ChevronUp, FileCode
} from 'lucide-react';

interface TutorialsHubProps {
  tutorials: Tutorial[];
}

export const TutorialsHub: React.FC<TutorialsHubProps> = ({ tutorials }) => {
  const [selectedTutorialId, setSelectedTutorialId] = useState<string>(tutorials[0]?.id || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Video player simulator state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackTime, setPlaybackTime] = useState<number>(142); // in seconds
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Lesson Quiz State
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState<boolean>(false);

  const selectedTutorial = tutorials.find((t) => t.id === selectedTutorialId) || tutorials[0];

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
  };

  const handleQuizAnswer = (index: number) => {
    if (isQuizSubmitted) return;
    setSelectedQuizOption(index);
    setIsQuizSubmitted(true);
  };

  const handleResetQuiz = () => {
    setSelectedQuizOption(null);
    setIsQuizSubmitted(false);
  };

  const filteredTutorials = tutorials.filter((t) => {
    if (selectedCategory === 'all') return true;
    return t.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-cyan-400" />
            <span>Computer Science Video Tutorials</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Step-by-step practical masterclasses delivered by Mr. Kevin Agaba.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {['all', 'Hardware', 'Programming', 'Networking', 'Databases'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Modules' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Player & Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Player & Lesson Steps */}
        <div className="lg:col-span-8 space-y-6">
          {selectedTutorial && (
            <div className="space-y-6">
              {/* Video Player Simulator */}
              <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950 flex items-center justify-center">
                  {selectedTutorial.videoUrl && isPlaying ? (
                    <video
                      src={selectedTutorial.videoUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-contain bg-black"
                    />
                  ) : (
                    <>
                      <img
                        src={selectedTutorial.coverImage}
                        alt={selectedTutorial.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover opacity-85"
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                      {/* Center Play Button Overlay */}
                      <button
                        onClick={handlePlayToggle}
                        className="absolute z-20 w-16 h-16 rounded-full bg-cyan-500/90 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-2xl shadow-cyan-500/50 hover:scale-105 transition-all cursor-pointer"
                      >
                        <Play className="w-7 h-7 fill-current ml-1" />
                      </button>
                    </>
                  )}

                  {/* Top Bar Badges */}
                  <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between text-xs">
                    <span className="bg-slate-950/80 backdrop-blur-md text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/30 font-medium">
                      {selectedTutorial.category}
                    </span>
                    <span className="bg-slate-950/80 backdrop-blur-md text-slate-300 px-2.5 py-1 rounded-full border border-slate-700 flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      {selectedTutorial.duration}
                    </span>
                  </div>

                  {/* Bottom Controls Bar */}
                  <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent flex flex-col gap-2">
                    {/* Progress scrubber */}
                    <div className="w-full h-1.5 bg-slate-700/60 rounded-full overflow-hidden cursor-pointer relative group">
                      <div
                        className="h-full bg-cyan-400 rounded-full relative"
                        style={{ width: `${isPlaying ? '55%' : '35%'}` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handlePlayToggle}
                          className="hover:text-cyan-400 transition-colors cursor-pointer"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <span className="font-mono text-[11px] text-slate-400">
                          {isPlaying ? '06:45' : '02:22'} / {selectedTutorial.duration}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            const speeds = [1, 1.25, 1.5, 2];
                            const next = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
                            setPlaybackSpeed(next);
                          }}
                          className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono hover:text-white"
                        >
                          {playbackSpeed}x
                        </button>
                        <Volume2 className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer" />
                        <Maximize className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lesson Title & Overview */}
                <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-white leading-snug">
                      {selectedTutorial.title}
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                      <span>Instructor: <strong className="text-slate-200">{selectedTutorial.instructor}</strong></span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {selectedTutorial.rating}
                      </span>
                      <span>·</span>
                      <span>{selectedTutorial.viewsCount} Students Watched</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {selectedTutorial.description}
                  </p>

                  {/* Key Takeaways */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                      Core Lesson Outcomes
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                      {selectedTutorial.keyTakeaways.map((outcome, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Lesson Notes */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-cyan-400" />
                  <span>Curriculum Breakdown & Interactive Notes</span>
                </h3>

                <div className="space-y-4">
                  {selectedTutorial.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3"
                    >
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs flex items-center justify-center font-mono font-bold">
                          {idx + 1}
                        </span>
                        <span>{step.title}</span>
                      </h4>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {step.content}
                      </p>

                      {step.highlightNote && (
                        <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/20 text-xs text-cyan-300 flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{step.highlightNote}</span>
                        </div>
                      )}

                      {step.codeSnippet && (
                        <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs">
                          <div className="px-3.5 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                            <span>Code Walkthrough</span>
                            <button
                              onClick={() => handleCopyCode(step.codeSnippet!, `step-${idx}`)}
                              className="hover:text-cyan-400 flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              {copiedCodeId === `step-${idx}` ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-4 text-cyan-300 overflow-x-auto leading-relaxed">
                            {step.codeSnippet}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Lesson Knowledge Check Quiz */}
              {selectedTutorial.interactiveQuiz && (
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-400" />
                      <h3 className="text-base font-bold text-white">Lesson Knowledge Check</h3>
                    </div>
                    {isQuizSubmitted && (
                      <button
                        onClick={handleResetQuiz}
                        className="text-xs text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Try Again
                      </button>
                    )}
                  </div>

                  <p className="text-sm font-medium text-slate-200">
                    {selectedTutorial.interactiveQuiz.question}
                  </p>

                  <div className="space-y-2">
                    {selectedTutorial.interactiveQuiz.options.map((opt, i) => {
                      const isSelected = selectedQuizOption === i;
                      const isCorrect = i === selectedTutorial.interactiveQuiz.correctIndex;
                      
                      let stateClasses = 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300';
                      if (isQuizSubmitted) {
                        if (isCorrect) {
                          stateClasses = 'bg-emerald-950/40 border-emerald-500 text-emerald-200';
                        } else if (isSelected) {
                          stateClasses = 'bg-red-950/40 border-red-500 text-red-200';
                        }
                      }

                      return (
                        <button
                          key={i}
                          disabled={isQuizSubmitted}
                          onClick={() => handleQuizAnswer(i)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${stateClasses}`}
                        >
                          <span>{opt}</span>
                          {isQuizSubmitted && isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                          {isQuizSubmitted && isSelected && !isCorrect && (
                            <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {isQuizSubmitted && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                      <span className="font-bold text-white block">Explanation:</span>
                      <p>{selectedTutorial.interactiveQuiz.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Other Tutorials Playlist */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-base font-bold text-white">More Lesson Tutorials</h3>

          <div className="space-y-3">
            {filteredTutorials.map((tut) => {
              const isSelected = tut.id === selectedTutorial.id;
              return (
                <div
                  key={tut.id}
                  onClick={() => {
                    setSelectedTutorialId(tut.id);
                    setIsPlaying(false);
                    setSelectedQuizOption(null);
                    setIsQuizSubmitted(false);
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                    isSelected
                      ? 'bg-cyan-950/30 border-cyan-500/50 ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="w-20 h-16 rounded-xl overflow-hidden bg-slate-950 shrink-0 relative">
                    <img
                      src={tut.coverImage}
                      alt={tut.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Play className="w-4 h-4 text-white fill-current opacity-80" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-cyan-400 font-medium block truncate">
                      {tut.category}
                    </span>
                    <h4 className="text-xs font-semibold text-white truncate mt-0.5">
                      {tut.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                      <span>{tut.duration}</span>
                      <span>·</span>
                      <span className="text-amber-400 font-medium">★ {tut.rating}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
