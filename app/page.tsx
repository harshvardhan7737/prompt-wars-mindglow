"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ChefHat,
  TrendingUp,
  BrainCircuit,
  MessageSquare,
  Mic,
  MicOff,
  Heart,
  Activity,
  History,
  Calendar,
  Sparkles,
  Info,
  Play,
  Square,
  ChevronRight,
  User,
  BookOpen,
  Coffee,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Smile,
  Meh,
  Frown,
  AlertCircle,
  ArrowLeft,
  PlusCircle
} from "lucide-react";

const STORAGE_KEY = "mindglow_entries_v1";

interface Analysis {
  emotionalState: string;
  stressLevel: "High" | "Medium" | "Low";
  confidenceLevel: "High" | "Medium" | "Low";
  burnoutRisk: "High" | "Medium" | "Low";
  triggers: string[];
  recommendations: string[];
  insight: string;
}

interface MoodEntry {
  id: string;
  timestamp: string;
  mood: "Happy" | "Good" | "Neutral" | "Sad" | "Stressed";
  reflection: string;
  examType: string;
  analysis: Analysis;
}

const WELLNESS_HUB_BOOSTERS = [
  {
    title: "🕷️ The Peter Parker Principle",
    description: "With great prep comes great stress-sponsibility! When your spider-sense is tingling from mock test anxiety, take a break. Remember, even Spider-man needed a nap. No cap.",
    category: "Spidey Wisdom"
  },
  {
    title: "🥛 Jal Lijiye (Aap Thak Gaye Honge)",
    description: "Syllabus backlog looking huge? Don't get emotional damage! Aap thak gaye honge, jal lijiye. Close the book, drink water, take a 5 min walk.",
    category: "Meme Hydration"
  },
  {
    title: "🐕 'This is Fine' Coping Mode",
    description: "Mock marks lower than expected? Don't sit in the fire saying 'This is fine' FR FR. Pivot your strategy, revise one topic, and get that glow up.",
    category: "Anti-Delulu"
  },
  {
    title: "🍿 Absolutely Cinema Moment",
    description: "When you solve a tough integration or UPSC question on the first try and feel like a total GigaChad. Own that win. Slay!",
    category: "Peak Energy"
  }
];

const PRESETS_VIBES = [
  "Syllabus backlog is giving major emotional damage, no cap. Arey mujhe chakkar aane laga.",
  "Mock test marks are not giving main character energy today. Feeling peak delulu.",
  "Parents' expectation rizz is too high, need to study 14 hours but brain is fried FR FR.",
  "Felt like a GigaChad today! Solved all mock physics problems on the first try. Slay!"
];

const POPIT_SLANGS = [
  "No Cap", "Rizz", "FR FR", "Glow Up", 
  "Delulu", "Slay", "Sheesh", "Valid", 
  "Bussin", "GigaChad", "Stonks", "Spidey", 
  "Cinema", "Jal Lijiye", "Damage", "Chakkar"
];

export default function Home() {
  // Navigation tabs: 'checkin', 'history', 'wellness'
  const [activeTab, setActiveTab] = useState<"checkin" | "history" | "wellness">("checkin");

  // Form State
  const [mood, setMood] = useState<"Happy" | "Good" | "Neutral" | "Sad" | "Stressed" | null>(null);
  const [reflection, setReflection] = useState("");
  const [examType, setExamType] = useState("JEE Main/Advanced");
  const [customExam, setCustomExam] = useState("");
  const [isListening, setIsListening] = useState(false);
  
  // Mobile check-in step toggling (if we have a result, show result, otherwise show form)
  const [isEditing, setIsEditing] = useState(true);

  // Loading & Submission State
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Latest Analysis State
  const [latestAnalysis, setLatestAnalysis] = useState<MoodEntry | null>(null);
  
  // Entries History State
  const [entries, setEntries] = useState<MoodEntry[]>([]);

  // Guided Breathing State
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [breathingTimer, setBreathingTimer] = useState(60); 
  const [phaseSeconds, setPhaseSeconds] = useState(4); 

  // Bubble Pop-it game state
  const [bubbles, setBubbles] = useState<boolean[]>(Array(16).fill(false));

  // Initialize and load historical entries
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setEntries(parsed);
        if (parsed.length > 0) {
          setLatestAnalysis(parsed[parsed.length - 1]);
          setIsEditing(false); // If they have an existing entry, show that result on load!
        }
      }
    } catch (err) {
      console.error("Failed to load local storage entries", err);
    }
  }, []);

  // Web Speech API Voice recording handler
  const handleVoiceReflection = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported by your current browser. Please write in the reflection box directly.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN"; 

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setReflection((prev) => (prev ? prev + " " + transcript : transcript));
    };

    recognition.onerror = (event: any) => {
      console.error("Speech transcription error:", event);
      if (event.error === "not-allowed") {
        setError("Microphone permission denied. Please allow microphone access in your settings.");
      } else {
        setError("Voice transcription was interrupted. Please try writing instead.");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Gen-Z Loading animation cycle status list
  const loadingMessages = [
    "Initiating Rizz Engine FR FR...",
    "Evaluating if syllabus is giving main character energy...",
    "Checking if mock marks caused Emotional Damage...",
    "Babu Rao says: Aap thak gaye honge, Jal Lijiye...",
    "Peter Parker is sending some spider-sense vibes..."
  ];

  // Cycling status updates when loading
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev >= loadingMessages.length - 1) {
            return prev;
          }
          return prev + 1;
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mood) {
      setError("Please select your current mood before submitting.");
      return;
    }
    if (!reflection.trim()) {
      setError("Please write or speak a brief reflection about how you are feeling.");
      return;
    }

    const examToSubmit = examType === "Other" ? (customExam.trim() || "Competitive Exam") : examType;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mood,
          reflection: reflection.trim(),
          examType: examToSubmit
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to compile your wellness report.");
      }

      // Create new history entry
      const newEntry: MoodEntry = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        mood,
        reflection: reflection.trim(),
        examType: examToSubmit,
        analysis: data
      };

      // Update local storage and component states
      const updatedEntries = [...entries, newEntry];
      setEntries(updatedEntries);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
      setLatestAnalysis(newEntry);
      
      // Reset input fields
      setReflection("");
      setMood(null);
      setCustomExam("");
      setIsEditing(false); // Move to results view!

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Delete an entry from local storage history
  const handleDeleteEntry = (id: string) => {
    if (confirm("Are you sure you want to delete this check-in record from history?")) {
      const updated = entries.filter((e) => e.id !== id);
      setEntries(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      if (latestAnalysis?.id === id) {
        const nextLatest = updated.length > 0 ? updated[updated.length - 1] : null;
        setLatestAnalysis(nextLatest);
        if (!nextLatest) {
          setIsEditing(true);
        }
      }
    }
  };

  // Guided breathing exercise loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (breathingActive && breathingTimer > 0) {
      timer = setTimeout(() => {
        setBreathingTimer((t) => t - 1);
        
        // Cycle phase every 4 seconds
        setPhaseSeconds((s) => {
          if (s <= 1) {
            setBreathingPhase((currentPhase) => {
              if (currentPhase === "Inhale") return "Hold";
              if (currentPhase === "Hold") return "Exhale";
              return "Inhale";
            });
            return 4; // Reset to 4s
          }
          return s - 1;
        });
      }, 1000);
    } else if (breathingTimer === 0 && breathingActive) {
      setBreathingActive(false);
      alert("Great job! You popped your stress out. Heart rate stabilized, you are officially in GigaChad mode now!");
      setBreathingTimer(60);
      setPhaseSeconds(4);
      setBreathingPhase("Inhale");
    }

    return () => clearTimeout(timer);
  }, [breathingActive, breathingTimer, phaseSeconds]);

  // Start breathing exercise
  const startBreathing = () => {
    setBreathingActive(true);
    setBreathingTimer(60);
    setPhaseSeconds(4);
    setBreathingPhase("Inhale");
  };

  // Stop breathing exercise
  const stopBreathing = () => {
    setBreathingActive(false);
  };

  // Reset the stress pop-it bubble grid
  const resetBubbles = () => {
    setBubbles(Array(16).fill(false));
  };

  // Toggle single bubble state
  const handlePopBubble = (index: number) => {
    const next = [...bubbles];
    next[index] = !next[index];
    setBubbles(next);
  };

  // Calculate statistics for the dashboard
  const moodStats = useMemo(() => {
    if (entries.length === 0) return null;

    const moodCounts: Record<string, number> = { Happy: 0, Good: 0, Neutral: 0, Sad: 0, Stressed: 0 };
    let totalStressScore = 0; 

    entries.forEach((e) => {
      moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
      
      const level = e.analysis.stressLevel;
      if (level === "High") totalStressScore += 3;
      else if (level === "Medium") totalStressScore += 2;
      else totalStressScore += 1;
    });

    const averageStressScore = totalStressScore / entries.length;
    let averageStressText: "High" | "Medium" | "Low" = "Low";
    if (averageStressScore >= 2.3) averageStressText = "High";
    else if (averageStressScore >= 1.6) averageStressText = "Medium";

    // Most common mood
    let dominantMood: string = "Neutral";
    let maxCount = -1;
    Object.keys(moodCounts).forEach((m) => {
      if (moodCounts[m] > maxCount) {
        maxCount = moodCounts[m];
        dominantMood = m;
      }
    });

    return {
      total: entries.length,
      counts: moodCounts,
      dominantMood,
      averageStress: averageStressText
    };
  }, [entries]);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#05010b] text-[#f8fafc] font-sans antialiased">
      {/* Bright neon background glows */}
      <div className="ambient-glow-pink top-[10%] right-[5%]" />
      <div className="ambient-glow-cyan bottom-[15%] left-[5%]" />

      {/* HEADER SECTION */}
      <header className="w-full border-b border-pink-500/20 bg-slate-950/75 backdrop-blur-md sticky top-0 z-50 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <BrainCircuit className="w-5.5 h-5.5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-md font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                MindGlow <span className="text-[10px] text-pink-300 font-bold px-1.5 py-0.5 bg-pink-500/10 rounded-md border border-pink-500/20 ml-1">मनGlow</span>
              </h1>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Exam Wellness Companion</p>
            </div>
          </div>

          {/* Navigation Controls */}
          <nav className="flex items-center gap-1.5">
            <button
              onClick={() => { setActiveTab("checkin"); }}
              aria-label="Daily Check-in Screen"
              className={`text-[10px] px-2.5 py-1.5 rounded-lg border transition-all duration-200 flex items-center gap-1 cursor-pointer font-bold ${
                activeTab === "checkin"
                  ? "bg-gradient-to-r from-pink-500/10 to-purple-500/10 text-pink-300 border-pink-500/40"
                  : "bg-slate-905 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Check-in</span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              aria-label="Mood History Screen"
              className={`text-[10px] px-2.5 py-1.5 rounded-lg border transition-all duration-200 flex items-center gap-1 cursor-pointer font-bold ${
                activeTab === "history"
                  ? "bg-gradient-to-r from-pink-500/10 to-purple-500/10 text-pink-300 border-pink-500/40"
                  : "bg-slate-905 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Logs</span>
            </button>
            <button
              onClick={() => setActiveTab("wellness")}
              aria-label="Wellness Center Screen"
              className={`text-[10px] px-2.5 py-1.5 rounded-lg border transition-all duration-200 flex items-center gap-1 cursor-pointer font-bold ${
                activeTab === "wellness"
                  ? "bg-gradient-to-r from-pink-500/10 to-purple-500/10 text-pink-300 border-pink-500/40"
                  : "bg-slate-905 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Wellness</span>
            </button>
          </nav>
        </div>
      </header>

      {/* MAIN CONTAINER - Optimized for mobile viewport centering */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 md:py-10">

        {/* ==============================================
            SCREEN 1 & 2: DAILY CHECK-IN & AI INSIGHTS 
            ============================================== */}
        {activeTab === "checkin" && (
          <div className="w-full">
            
            {/* 1. Loading View */}
            {loading && (
              <div className="glass-panel-cyan rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[380px]">
                <div className="relative w-28 h-28 flex items-center justify-center mb-6">
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-pink-500/20 animate-spin" style={{ animationDuration: '8s' }} />
                  <div className="absolute inset-2 rounded-full border border-dashed border-cyan-500/20 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }} />
                  <div className="w-14 h-14 rounded-full bg-slate-900/80 border border-slate-800 flex items-center justify-center shadow-lg">
                    <BrainCircuit className="w-7 h-7 text-pink-400 animate-pulse" />
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-200 mb-1">Rizzler Engine Cooking</h3>
                <p className="text-[11px] text-slate-500 mb-6 max-w-xs leading-relaxed">Analyzing exam stress levels & compiling copes...</p>

                <div className="inline-flex items-center gap-2 bg-slate-950/60 border border-slate-850 px-4 py-2 rounded-full text-[11px] text-slate-400 justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping" />
                  <span className="font-bold text-slate-300">
                    {loadingMessages[loadingStep]}
                  </span>
                </div>
              </div>
            )}

            {/* 2. Check-in Input Form Screen (Renders when editing) */}
            {!loading && (isEditing || !latestAnalysis) && (
              <div className="glass-panel rounded-2xl p-5 md:p-7 space-y-5">
                <div className="border-b border-slate-850 pb-2.5 flex items-center justify-between">
                  <h2 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-pink-400" />
                    <span>How is your prep rizz today?</span>
                  </h2>
                  <span className="text-[8px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded font-bold uppercase">
                    AI Enabled
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Select Mood */}
                  <div className="space-y-2.5">
                    <label id="mood-label" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Current Vibe State
                    </label>
                    <div className="grid grid-cols-5 gap-1.5" role="group" aria-labelledby="mood-label">
                      {(["Happy", "Good", "Neutral", "Sad", "Stressed"] as const).map((m) => {
                        const isSelected = mood === m;
                        let colorStyles = "hover:border-pink-500/30 hover:bg-pink-500/5 text-slate-400 border-slate-800 bg-slate-900/40";
                        if (isSelected) {
                          if (m === "Stressed") colorStyles = "bg-rose-500/20 text-rose-300 border-rose-500/50";
                          else if (m === "Sad") colorStyles = "bg-amber-500/20 text-amber-300 border-amber-500/50";
                          else if (m === "Neutral") colorStyles = "bg-blue-500/20 text-blue-300 border-blue-500/50";
                          else colorStyles = "bg-emerald-500/20 text-emerald-300 border-emerald-500/50";
                        }

                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setMood(m)}
                            aria-label={`Select ${m} mood`}
                            aria-pressed={isSelected}
                            className={`flex flex-col items-center justify-center py-2.5 rounded-xl border text-center transition duration-205 cursor-pointer ${colorStyles}`}
                          >
                            <span className="text-xl mb-1" role="img" aria-hidden="true">
                              {m === "Happy" && "😊"}
                              {m === "Good" && "🙂"}
                              {m === "Neutral" && "😐"}
                              {m === "Sad" && "😔"}
                              {m === "Stressed" && "😫"}
                            </span>
                            <span className="text-[8px] font-black uppercase tracking-tight">
                              {m === "Happy" && "Slay"}
                              {m === "Good" && "Chill"}
                              {m === "Neutral" && "Meh"}
                              {m === "Sad" && "Depresso"}
                              {m === "Stressed" && "Damage"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Target Exam */}
                  <div className="space-y-2">
                    <label htmlFor="exam-selector" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Target Exam Mission
                    </label>
                    <select
                      id="exam-selector"
                      value={examType}
                      onChange={(e) => setExamType(e.target.value)}
                      className="w-full bg-slate-900/70 border border-slate-800 focus:border-pink-500/50 rounded-xl px-3 py-2.5 text-slate-200 text-xs focus:outline-none"
                    >
                      <option value="JEE Main/Advanced">JEE Main / Advanced (Engineering)</option>
                      <option value="NEET UG">NEET UG (Medical Entrance)</option>
                      <option value="UPSC CSE">UPSC Civil Services Examination</option>
                      <option value="CAT / GATE">CAT / GATE / Entrance Tests</option>
                      <option value="CBSE/ICSE Boards">Class 10th / 12th Board Exams</option>
                      <option value="Other">Other Examination</option>
                    </select>

                    {examType === "Other" && (
                      <input
                        type="text"
                        placeholder="Enter exam name (e.g. CUET, NDA)"
                        value={customExam}
                        onChange={(e) => setCustomExam(e.target.value)}
                        className="w-full mt-2 bg-slate-900/60 border border-slate-800 focus:border-pink-500/50 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none"
                      />
                    )}
                  </div>

                  {/* Reflection Input */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <label htmlFor="reflection-input" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Mind Dump / Rant Zone
                      </label>
                      
                      <button
                        type="button"
                        onClick={handleVoiceReflection}
                        aria-label={isListening ? "Stop voice recording" : "Record thoughts with microphone"}
                        className={`text-[8px] px-2.5 py-1 rounded-lg border transition duration-200 flex items-center gap-1 cursor-pointer font-bold uppercase tracking-wide ${
                          isListening
                            ? "mic-active-neon border-pink-500/40 text-white"
                            : "bg-slate-900/50 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
                        }`}
                      >
                        {isListening ? (
                          <>
                            <MicOff className="w-2.5 h-2.5 text-white" />
                            <span>Stop Rant</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-2.5 h-2.5 text-pink-400" />
                            <span>Speak Rant</span>
                          </>
                        )}
                      </button>
                    </div>

                    <textarea
                      id="reflection-input"
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      placeholder="Write what is stressing you out today. E.g., 'Anxious about syllabus backlogs, parent expectations are too high FR FR.'"
                      rows={3}
                      className="w-full bg-slate-900/70 border border-slate-800 focus:border-pink-500/50 rounded-xl px-3 py-2.5 text-slate-100 text-xs focus:outline-none transition placeholder:text-slate-650"
                    />

                    {/* Presets Shortcuts */}
                    <div className="space-y-1.5">
                      <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Or click a shortcut concern:</span>
                      <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-1">
                        {PRESETS_VIBES.map((txt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setReflection(txt)}
                            className="text-[9px] text-left px-2 py-1.5 rounded-lg border border-slate-800/80 bg-slate-900/20 text-slate-400 hover:bg-slate-850 hover:text-slate-200 hover:border-slate-700 transition"
                          >
                            {txt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-3 flex gap-2 items-start text-xs" role="alert">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-slate-950 font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition duration-300 cursor-pointer shadow-lg shadow-pink-500/10 hover:shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-wider active:scale-[0.98]"
                  >
                    <BrainCircuit className="w-4 h-4 text-slate-950" />
                    <span>Analyze Stress & Slay</span>
                  </button>
                </form>
              </div>
            )}

            {/* 3. AI Wellness Results Screen (Renders when analysis exists and not editing) */}
            {!loading && !isEditing && latestAnalysis && (
              <div className="space-y-5">
                
                {/* Back Control Button */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-pink-400 hover:text-pink-300 font-bold transition cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Check-in</span>
                  </button>
                  
                  <button
                    onClick={() => { setMood(null); setReflection(""); setIsEditing(true); }}
                    className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-bold transition cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>New Check-in</span>
                  </button>
                </div>

                {/* Analysis Header Card (Insight & Summary) */}
                <div className="glass-panel-cyan rounded-2xl p-5 md:p-6 border-l-4 border-l-pink-500 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
                    <div>
                      <span className="text-[9px] text-pink-400 font-extrabold uppercase tracking-wider block">AI Rizzler Evaluation</span>
                      <h3 className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(latestAnalysis.timestamp).toLocaleString()} ({latestAnalysis.examType})</span>
                      </h3>
                    </div>
                    
                    <span className="text-xl" role="img" aria-label="Checked mood representation">
                      {latestAnalysis.mood === "Happy" && "😊"}
                      {latestAnalysis.mood === "Good" && "🙂"}
                      {latestAnalysis.mood === "Neutral" && "😐"}
                      {latestAnalysis.mood === "Sad" && "😔"}
                      {latestAnalysis.mood === "Stressed" && "😫"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Current State</h4>
                    <p className="text-xs font-bold text-slate-100 leading-relaxed">
                      &ldquo;{latestAnalysis.analysis.emotionalState}&rdquo;
                    </p>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-850 p-3.5 rounded-xl flex gap-2.5 items-start">
                    <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                      <strong className="text-purple-300">Wellness Rizz:</strong> {latestAnalysis.analysis.insight}
                    </p>
                  </div>
                </div>

                {/* 3 Metrics Row: Stress Level, Burnout Risk, Confidence */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  
                  {/* Stress Level */}
                  <div className="glass-panel p-4.5 rounded-xl space-y-1.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Stress Status</span>
                    <div className="flex items-end justify-between">
                      <span className={`text-sm font-extrabold ${
                        latestAnalysis.analysis.stressLevel === "High" ? "text-rose-400" :
                        latestAnalysis.analysis.stressLevel === "Medium" ? "text-amber-400" : "text-emerald-400"
                      }`}>
                        {latestAnalysis.analysis.stressLevel === "High" ? "💀 High" :
                         latestAnalysis.analysis.stressLevel === "Medium" ? "⚡ Medium" : "💅 Low"}
                      </span>
                      
                      <div className="flex gap-0.5 h-2.5 w-10">
                        <div className={`w-3 h-full rounded-sm ${
                          latestAnalysis.analysis.stressLevel !== "Low" ? "bg-amber-500" : "bg-emerald-500"
                        }`} />
                        <div className={`w-3 h-full rounded-sm ${
                          latestAnalysis.analysis.stressLevel === "High" ? "bg-rose-500" : "bg-slate-800"
                        }`} />
                        <div className={`w-3 h-full rounded-sm ${
                          latestAnalysis.analysis.stressLevel === "High" ? "bg-rose-600" : "bg-slate-800"
                        }`} />
                      </div>
                    </div>
                  </div>

                  {/* Burnout Risk */}
                  <div className="glass-panel p-4.5 rounded-xl space-y-1.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Burnout Risk</span>
                    <div className="flex items-end justify-between">
                      <span className={`text-sm font-extrabold ${
                        latestAnalysis.analysis.burnoutRisk === "High" ? "text-rose-400" :
                        latestAnalysis.analysis.burnoutRisk === "Medium" ? "text-amber-400" : "text-emerald-400"
                      }`}>
                        {latestAnalysis.analysis.burnoutRisk === "High" ? "🔥 High" :
                         latestAnalysis.analysis.burnoutRisk === "Medium" ? "⚠️ Medium" : "😎 Low"}
                      </span>
                      
                      <div className="flex gap-0.5 h-2.5 w-10">
                        <div className={`w-3 h-full rounded-sm ${
                          latestAnalysis.analysis.burnoutRisk !== "Low" ? "bg-amber-500" : "bg-emerald-500"
                        }`} />
                        <div className={`w-3 h-full rounded-sm ${
                          latestAnalysis.analysis.burnoutRisk === "High" ? "bg-rose-500" : "bg-slate-800"
                        }`} />
                        <div className={`w-3 h-full rounded-sm ${
                          latestAnalysis.analysis.burnoutRisk === "High" ? "bg-rose-600" : "bg-slate-800"
                        }`} />
                      </div>
                    </div>
                  </div>

                  {/* Confidence Level */}
                  <div className="glass-panel p-4.5 rounded-xl space-y-1.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Confidence Rizz</span>
                    <div className="flex items-end justify-between">
                      <span className={`text-sm font-extrabold ${
                        latestAnalysis.analysis.confidenceLevel === "High" ? "text-emerald-400" :
                        latestAnalysis.analysis.confidenceLevel === "Medium" ? "text-amber-400" : "text-rose-400"
                      }`}>
                        {latestAnalysis.analysis.confidenceLevel === "High" ? "👑 High" :
                         latestAnalysis.analysis.confidenceLevel === "Medium" ? "🔥 Medium" : "📉 Low"}
                      </span>
                      
                      <div className="flex gap-0.5 h-2.5 w-10">
                        <div className={`w-3 h-full rounded-sm ${
                          latestAnalysis.analysis.confidenceLevel === "Low" ? "bg-rose-500" : "bg-emerald-500"
                        }`} />
                        <div className={`w-3 h-full rounded-sm ${
                          latestAnalysis.analysis.confidenceLevel === "High" ? "bg-emerald-500" : "bg-slate-800"
                        }`} />
                        <div className={`w-3 h-full rounded-sm ${
                          latestAnalysis.analysis.confidenceLevel === "High" ? "bg-emerald-600" : "bg-slate-800"
                        }`} />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Triggers Tag Cloud & Recommendations Stack */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  
                  {/* Triggers (4 cols) */}
                  <div className="glass-panel rounded-xl p-5 md:col-span-5 space-y-2.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block border-b border-slate-800 pb-1">
                      Isolated Triggers
                    </span>
                    
                    {latestAnalysis.analysis.triggers.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {latestAnalysis.analysis.triggers.map((trig, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-md"
                          >
                            💥 {trig}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 block py-2">No key stress triggers isolated.</span>
                    )}
                  </div>

                  {/* Recommendations (7 cols) */}
                  <div className="glass-panel rounded-xl p-5 md:col-span-7 space-y-2.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block border-b border-slate-800 pb-1">
                      Recovery Mission Plan
                    </span>

                    <ul className="space-y-2 pt-1">
                      {latestAnalysis.analysis.recommendations.map((rec, rIdx) => (
                        <li key={rIdx} className="text-xs text-slate-300 flex items-start gap-1.5 leading-relaxed font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

        {/* ==============================================
            SCREEN 3: MOOD HISTORY TIMELINE & STATS
            ============================================== */}
        {activeTab === "history" && (
          <div className="space-y-6">
            
            {/* Stats Overview Dashboard */}
            {moodStats ? (
              <section className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="glass-panel p-4 rounded-xl text-center space-y-0.5">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Rants</span>
                  <span className="text-2xl font-extrabold text-pink-400">{moodStats.total}</span>
                </div>
                <div className="glass-panel p-4 rounded-xl text-center space-y-0.5">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Dominant Vibe</span>
                  <span className="text-2xl font-extrabold text-cyan-400 text-ellipsis overflow-hidden block">{moodStats.dominantMood}</span>
                </div>
                <div className="glass-panel p-4 rounded-xl text-center space-y-0.5">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Avg Stress State</span>
                  <span className={`text-2xl font-extrabold block ${
                    moodStats.averageStress === "High" ? "text-rose-400" :
                    moodStats.averageStress === "Medium" ? "text-amber-400" : "text-emerald-400"
                  }`}>{moodStats.averageStress === "High" ? "💀 High" :
                        moodStats.averageStress === "Medium" ? "⚡ Med" : "💅 Low"}</span>
                </div>
                <div className="glass-panel p-4 rounded-xl flex flex-col justify-center items-center gap-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">GigaChad Status</span>
                  <span className="text-[10px] font-extrabold text-lime-400 px-2 py-0.5 bg-lime-500/10 border border-lime-500/20 rounded-md">
                    👑 Unstoppable
                  </span>
                </div>
              </section>
            ) : (
              <div className="glass-panel p-5 rounded-xl text-center text-xs text-slate-500">
                No tracking statistics available. Perform a daily check-in to compile history.
              </div>
            )}

            {/* Chronological Timeline */}
            <section className="glass-panel rounded-2xl p-5 md:p-6 space-y-4">
              <h2 className="text-md font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <History className="w-4.5 h-4.5 text-pink-400" />
                <span>Historical Wellness Timeline</span>
              </h2>

              {entries.length > 0 ? (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {entries.slice().reverse().map((entry, index) => (
                    <div
                      key={entry.id}
                      className="relative border-l border-slate-850 pl-5 space-y-2 pb-5 last:pb-0"
                    >
                      <div className="absolute left-[-4.5px] top-1.5 w-2 h-2 rounded-full border border-[#05010b] bg-pink-500" />
                      
                      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-905 border border-slate-850 p-3.5 rounded-xl">
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-200">
                              {entry.mood === "Happy" && "😊 Slay"}
                              {entry.mood === "Good" && "🙂 Chill"}
                              {entry.mood === "Neutral" && "😐 Meh"}
                              {entry.mood === "Sad" && "😔 Depresso"}
                              {entry.mood === "Stressed" && "😫 Damage"}
                            </span>
                            <span className="text-[8px] text-pink-300 bg-pink-500/5 px-1.5 py-0.5 rounded border border-pink-500/10 font-bold uppercase">
                              {entry.examType}
                            </span>
                          </div>
                          
                          <span className="text-[9px] text-slate-500 block font-medium">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>

                          <p className="text-xs text-slate-400 italic max-w-md leading-relaxed pt-1">
                            &ldquo;{entry.reflection}&rdquo;
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setLatestAnalysis(entry); setIsEditing(false); setActiveTab("checkin"); }}
                            className="text-[10px] px-2 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded-md hover:bg-cyan-500/20 transition cursor-pointer font-bold"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            aria-label="Delete entry"
                            className="text-xs p-1 text-slate-550 hover:text-rose-450 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 text-xs">
                  You haven't logged any wellness reports yet. Go to the Daily Check-in screen to make your first entry!
                </div>
              )}
            </section>

          </div>
        )}

        {/* ==============================================
            SCREEN 4: INTERACTIVE WELLNESS HUB
            ============================================== */}
        {activeTab === "wellness" && (
          <div className="space-y-6">
            
            {/* Guided Breathing Box - Full Width for clean interface */}
            <section className="glass-panel rounded-2xl p-5 md:p-7 space-y-5">
              <div className="border-b border-slate-800 pb-2.5">
                <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Gen-Z Guided Breathing Simulator</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  60-second breathing simulator using the 4-4-4 box routine. Calm down your spidey senses.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center py-6 space-y-6">
                
                {/* Simulated Breathing Circle */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                  
                  {/* Outer pulse wave */}
                  {breathingActive && (
                    <div className={`absolute inset-0 rounded-full border border-pink-500/30 transition-all duration-1000 ${
                      breathingPhase === "Inhale" ? "scale-100 opacity-80" : 
                      breathingPhase === "Hold" ? "scale-105 opacity-100 animate-ping" : "scale-75 opacity-40"
                    }`} />
                  )}

                  {/* Breathing Circle Ring */}
                  <div className={`w-32 h-32 rounded-full bg-slate-900 border-2 flex flex-col items-center justify-center text-center shadow-lg transition-all duration-1000 ${
                    breathingActive
                      ? breathingPhase === "Inhale"
                        ? "border-emerald-500/60 scale-105"
                        : breathingPhase === "Hold"
                        ? "border-amber-500/60 scale-110"
                        : "border-pink-500/60 scale-95"
                      : "border-slate-800 scale-100"
                  }`}>
                    {breathingActive ? (
                      <>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                          {breathingPhase === "Inhale" ? "Inhale" :
                           breathingPhase === "Hold" ? "Hold" : "Exhale"}
                        </span>
                        <span className={`text-2xl font-extrabold tracking-tight ${
                          breathingPhase === "Inhale" ? "text-emerald-400" :
                          breathingPhase === "Hold" ? "text-amber-400" : "text-pink-400"
                        }`}>
                          {phaseSeconds}s
                        </span>
                      </>
                    ) : (
                      <>
                        <BrainCircuit className="w-7 h-7 text-slate-600 mb-1" />
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Chilled</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status Bar / Details */}
                <div className="text-center space-y-1.5">
                  <div className="text-xs font-bold text-slate-200">
                    {breathingActive ? (
                      breathingPhase === "Inhale" ? "🌿 Breathe in deep..." :
                      breathingPhase === "Hold" ? "⏳ Hold and feel the calm..." :
                      "💨 Slow release, throw stress out..."
                    ) : (
                      "Stabilize Your Spider-Senses"
                    )}
                  </div>
                  
                  {breathingActive && (
                    <div className="text-[9px] text-pink-400 font-bold bg-pink-500/5 border border-pink-500/10 px-2.5 py-1 rounded-md inline-block uppercase">
                      Timer: {breathingTimer}s remaining
                    </div>
                  )}
                </div>

                {/* Control Triggers */}
                <div className="flex gap-4">
                  {!breathingActive ? (
                    <button
                      onClick={startBreathing}
                      aria-label="Start guided breathing exercise"
                      className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer uppercase tracking-wider active:scale-95"
                    >
                      <Play className="w-3 h-3 fill-slate-950 text-slate-950" />
                      <span>Start Box Breathing (60s)</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopBreathing}
                      aria-label="Stop guided breathing exercise"
                      className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer uppercase tracking-wider active:scale-95"
                    >
                      <Square className="w-3 h-3 fill-rose-300 text-rose-300" />
                      <span>Abort</span>
                    </button>
                  )}
                </div>

              </div>
            </section>

            {/* Bubble Pop-It Grid */}
            <section className="glass-panel rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Smile className="w-4 h-4 text-pink-400" />
                  <h3 className="text-xs font-bold text-slate-100">Slang Pop-It Solver</h3>
                </div>
                <button
                  onClick={resetBubbles}
                  className="text-[9px] text-slate-500 hover:text-slate-350 font-bold uppercase cursor-pointer"
                >
                  Reset
                </button>
              </div>
              <p className="text-[10px] text-slate-400">Pop slang bubbles to terminate exam pressure. satisfying click resets.</p>

              <div className="grid grid-cols-4 gap-2.5 max-w-sm mx-auto py-2">
                {bubbles.map((popped, bIdx) => (
                  <button
                    key={bIdx}
                    onClick={() => handlePopBubble(bIdx)}
                    className={`h-9 text-[8px] font-black rounded-lg border transition duration-200 cursor-pointer active:scale-90 flex items-center justify-center p-1 text-center leading-tight ${
                      popped
                        ? "bg-slate-950 border-slate-850 text-slate-700 shadow-inner"
                        : "bg-gradient-to-tr from-pink-500/20 to-purple-500/20 border-pink-500/40 text-pink-300 hover:border-pink-500"
                    }`}
                  >
                    {popped ? "💥" : POPIT_SLANGS[bIdx]}
                  </button>
                ))}
              </div>
            </section>

            {/* Coping Tips */}
            <section className="glass-panel rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-extrabold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Wellness & Meme Wisdom</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {WELLNESS_HUB_BOOSTERS.map((hub, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/30 border border-slate-850 rounded-xl p-3.5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between border-b border-slate-850 pb-1">
                      <span className="text-[10px] font-bold text-slate-200">{hub.title}</span>
                      <span className="text-[8px] text-pink-300 font-extrabold bg-pink-500/10 px-1.5 py-0.5 rounded border border-pink-500/20">
                        {hub.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                      {hub.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/40 py-3.5 text-center mt-auto px-4">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5 text-[9px] text-slate-500">
          <span>&copy; {new Date().getFullYear()} MindGlow. Slay your exams, no cap.</span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
            Helping aspirants stay calm FR FR.
          </span>
        </div>
      </footer>
    </div>
  );
}
