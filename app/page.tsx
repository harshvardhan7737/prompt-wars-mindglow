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
  AlertCircle
} from "lucide-react";

// Local storage key helper
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

// Pre-configured mock coping tips / wellness tools
const WELLNESS_HUB_BOOSTERS = [
  {
    title: "⚡ Quick Mock Test Recovery",
    description: "Got lower marks than expected? Take 5 deep breaths, close the test portal, and write down 2 topics you already know perfectly. Rebuild momentum slowly.",
    category: "Mindset Reset"
  },
  {
    title: "🧘 Revision Backlog Relief",
    description: "Break the backlog into 45-minute chunks. Study for 45 mins, then take a hard 15-minute break. Never study continuous hours without getting up.",
    category: "Study Recovery"
  },
  {
    title: "💤 Night Before Exam Routine",
    description: "Close all books by 8:00 PM. Eat a light dinner, listen to soft music, and pack your admit card/pens. A rested brain scores 10% higher than a sleep-deprived one.",
    category: "Exam Prep"
  }
];

const PRESETS_VIBES = [
  "I got stuck on a complex math topic and felt like giving up.",
  "Mock test scores came out today. They were lower than my targets, feeling anxious.",
  "Parents keep asking about my preparation syllabus and mock ranks. I feel pressured.",
  "Studying 12 hours a day but still feeling like I will forget everything during the exam.",
  "Felt energetic today! Completed my daily schedule early and revised physics formulas."
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
  
  // Loading & Submission State
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Latest Analysis State (from last successful submission)
  const [latestAnalysis, setLatestAnalysis] = useState<MoodEntry | null>(null);
  
  // Entries History State (loaded from LocalStorage)
  const [entries, setEntries] = useState<MoodEntry[]>([]);

  // Guided Breathing State
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [breathingTimer, setBreathingTimer] = useState(60); // 60s exercise
  const [phaseSeconds, setPhaseSeconds] = useState(4); // 4s per phase

  // Bubble Pop-it game state (interactive tension release)
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
    recognition.lang = "en-IN"; // Set to Indian English for better local accents transcription

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
        setError("Microphone permission denied. Please allow microphone access in your browser settings.");
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

  // Loading animation cycle status list
  const loadingMessages = [
    "Centering your thoughts...",
    "Analyzing syllabus stress triggers...",
    "Assessing burnout metrics...",
    "Querying emotional wellness databases...",
    "Drafting positive, actionable coping suggestions..."
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
        setLatestAnalysis(updated.length > 0 ? updated[updated.length - 1] : null);
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
      alert("Great job! You have completed a 60-second guided breathing cycle. Your heart rate and anxiety should feel reduced.");
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
    let totalStressScore = 0; // High = 3, Medium = 2, Low = 1

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
    <div className="relative min-h-screen flex flex-col bg-[#090d16] text-[#f8fafc] font-sans antialiased">
      {/* Background ambient decorative glows */}
      <div className="ambient-glow top-[10%] left-[-100px]" />
      <div className="ambient-glow-rose bottom-[20%] right-[-100px]" />

      {/* HEADER SECTION */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/45 backdrop-blur-md sticky top-0 z-50 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-rose-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <BrainCircuit className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-200 via-purple-300 to-rose-300 bg-clip-text text-transparent">
                MindGlow <span className="text-xs text-indigo-400 font-semibold px-1 py-0.5 bg-indigo-500/10 rounded-md border border-indigo-500/20">मनGlow</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">Exam Mental Wellness Companion</p>
            </div>
          </div>

          {/* Navigation Controls */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab("checkin")}
              aria-label="Daily Check-in Screen"
              className={`text-xs px-3 py-1.5 rounded-lg border transition duration-200 flex items-center gap-1.5 ${
                activeTab === "checkin"
                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-semibold"
                  : "bg-slate-900/40 text-slate-400 border-slate-800 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Daily Check-in</span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              aria-label="Mood History Screen"
              className={`text-xs px-3 py-1.5 rounded-lg border transition duration-200 flex items-center gap-1.5 ${
                activeTab === "history"
                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-semibold"
                  : "bg-slate-900/40 text-slate-400 border-slate-800 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Emotional History</span>
              {entries.length > 0 && (
                <span className="bg-indigo-500 text-slate-950 text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {entries.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("wellness")}
              aria-label="Wellness Center Screen"
              className={`text-xs px-3 py-1.5 rounded-lg border transition duration-200 flex items-center gap-1.5 ${
                activeTab === "wellness"
                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-semibold"
                  : "bg-slate-900/40 text-slate-400 border-slate-800 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Wellness Hub</span>
            </button>
          </nav>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 md:py-12">

        {/* ==============================================
            SCREEN 1 & 2: DAILY CHECK-IN & AI INSIGHTS 
            ============================================== */}
        {activeTab === "checkin" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Input Form Dashboard (Left Pane) */}
            <section className="lg:col-span-5 space-y-6">
              <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <MessageSquare className="w-4.5 h-4.5 text-indigo-400" />
                    <span>How is your prep going?</span>
                  </h2>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-medium">
                    AI Enabled
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Select Mood Area */}
                  <div className="space-y-3">
                    <label id="mood-label" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Current Exam-Prep Mood
                    </label>
                    <div className="grid grid-cols-5 gap-2" role="group" aria-labelledby="mood-label">
                      {(["Happy", "Good", "Neutral", "Sad", "Stressed"] as const).map((m) => {
                        const isSelected = mood === m;
                        let colorStyles = "hover:border-indigo-500/50 hover:bg-indigo-500/5 text-slate-400 border-slate-800/80 bg-slate-900/30";
                        if (isSelected) {
                          if (m === "Stressed") colorStyles = "bg-rose-500/20 text-rose-300 border-rose-500/60";
                          else if (m === "Sad") colorStyles = "bg-amber-500/20 text-amber-300 border-amber-500/60";
                          else if (m === "Neutral") colorStyles = "bg-blue-500/20 text-blue-300 border-blue-500/60";
                          else colorStyles = "bg-emerald-500/20 text-emerald-300 border-emerald-500/60";
                        }

                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setMood(m)}
                            aria-label={`Select ${m} mood`}
                            aria-pressed={isSelected}
                            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition duration-200 cursor-pointer ${colorStyles}`}
                          >
                            <span className="text-xl mb-1" role="img" aria-hidden="true">
                              {m === "Happy" && "😊"}
                              {m === "Good" && "🙂"}
                              {m === "Neutral" && "😐"}
                              {m === "Sad" && "😔"}
                              {m === "Stressed" && "😫"}
                            </span>
                            <span className="text-[10px] font-bold tracking-tight">{m}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Exam selection */}
                  <div className="space-y-2">
                    <label htmlFor="exam-selector" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Target Examination
                    </label>
                    <select
                      id="exam-selector"
                      value={examType}
                      onChange={(e) => setExamType(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-3 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
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
                        className="w-full mt-2 bg-slate-900/60 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-3.5 py-2 text-slate-200 text-xs focus:outline-none"
                      />
                    )}
                  </div>

                  {/* Text / Voice journal input */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label htmlFor="reflection-input" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Personal Reflection / Thoughts
                      </label>
                      
                      {/* Voice record trigger */}
                      <button
                        type="button"
                        onClick={handleVoiceReflection}
                        aria-label={isListening ? "Stop voice recording" : "Record thoughts with microphone"}
                        className={`text-[10px] px-2.5 py-1 rounded-lg border transition duration-200 flex items-center gap-1 cursor-pointer ${
                          isListening
                            ? "mic-active border-rose-500/40 text-white font-bold"
                            : "bg-slate-900/50 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
                        }`}
                      >
                        {isListening ? (
                          <>
                            <MicOff className="w-3 h-3 text-white" />
                            <span>Stop Mic</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-3 h-3 text-indigo-400" />
                            <span>Speak Thoughts</span>
                          </>
                        )}
                      </button>
                    </div>

                    <textarea
                      id="reflection-input"
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      placeholder="Write how your preparation is going. E.g., 'Anxious about the physics mechanics formulas and mock results next Monday. Worried that I will run out of study time.'"
                      rows={4}
                      className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none transition placeholder:text-slate-600 focus:ring-1 focus:ring-indigo-500/30"
                    />

                    {/* Pre-written templates for students shortcut */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-500 font-medium block">Or click a shortcut concern to test:</span>
                      <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
                        {PRESETS_VIBES.map((txt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setReflection(txt)}
                            className="text-[10px] text-left px-2 py-1.5 rounded-lg border border-slate-800/80 bg-slate-900/20 text-slate-400 hover:bg-slate-850 hover:text-slate-300 hover:border-slate-700 transition"
                          >
                            {txt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Submission triggers */}
                  {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-3 flex gap-2 items-start text-xs leading-relaxed" role="alert">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-slate-950 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition duration-300 cursor-pointer shadow-lg shadow-indigo-500/10 hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm active:scale-[0.98]"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Generating Wellness Profile...</span>
                      </>
                    ) : (
                      <>
                        <BrainCircuit className="w-4.5 h-4.5 text-slate-950" />
                        <span className="text-slate-950">Analyze Stress & Get Plan</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </section>

            {/* AI Results Presentation Area (Right Pane) */}
            <section className="lg:col-span-7 space-y-6">
              
              {/* Default Empty State */}
              {!loading && !latestAnalysis && (
                <div className="glass-panel rounded-2xl p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 text-indigo-400/80">
                    <Heart className="w-8 h-8 animate-pulse text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-200 mb-2">No Stress Check-in Completed</h3>
                  <p className="text-slate-400 text-xs max-w-sm leading-relaxed mb-6">
                    MindGlow analyzes your daily study routine, mood, and concerns. Submit a check-in on the left to receive AI assessment, trigger diagnosis, and recovery plans.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full border-t border-slate-850 pt-6 text-left">
                    <div className="p-3 bg-slate-900/10 border border-slate-850 rounded-xl">
                      <span className="text-xs font-bold text-indigo-400 block mb-1">🔍 Trigger Diagnosis</span>
                      <span className="text-[10px] text-slate-500">Isolate syllabus bottlenecks vs expectation pressure automatically.</span>
                    </div>
                    <div className="p-3 bg-slate-900/10 border border-slate-850 rounded-xl">
                      <span className="text-xs font-bold text-emerald-400 block mb-1">🌿 Personalized Plans</span>
                      <span className="text-[10px] text-slate-500">Actionable study breaks, routines, and box breathing suggestions.</span>
                    </div>
                    <div className="p-3 bg-slate-900/10 border border-slate-850 rounded-xl">
                      <span className="text-xs font-bold text-rose-400 block mb-1">⏳ Burnout Risk Meter</span>
                      <span className="text-[10px] text-slate-500">Visual indicators on energy depletion limits.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State with cycling progress messages */}
              {loading && (
                <div className="glass-panel rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[450px]">
                  <div className="relative w-32 h-32 flex items-center justify-center mb-8">
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-500/20 animate-spin" style={{ animationDuration: '8s' }} />
                    <div className="absolute inset-2 rounded-full border border-dashed border-purple-500/20 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }} />
                    <div className="w-16 h-16 rounded-full bg-slate-900/80 border border-slate-800 flex items-center justify-center shadow-lg shadow-indigo-500/5">
                      <BrainCircuit className="w-8 h-8 text-indigo-400 animate-pulse" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-200 mb-1">MindGlow Advisor Working</h3>
                  <p className="text-xs text-slate-500 mb-6 max-w-xs leading-relaxed">Evaluating your emotional profile and structuring mental wellness interventions...</p>

                  <div className="inline-flex items-center gap-2 bg-slate-950/60 border border-slate-850 px-4 py-2 rounded-full text-xs text-slate-400 min-w-[280px] justify-center">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                    <span className="font-semibold text-slate-300 transition-all duration-300">
                      {loadingMessages[loadingStep]}
                    </span>
                  </div>
                </div>
              )}

              {/* Rendered Results */}
              {!loading && latestAnalysis && (
                <div className="space-y-6">
                  
                  {/* Analysis Header Card (Insight & Summary) */}
                  <div className="glass-panel rounded-2xl p-6 border-l-4 border-l-indigo-500 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">Latest Evaluation</span>
                        <h3 className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 mt-0.5">
                          <Calendar className="w-3.5 h-3.5" />
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
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current State</h4>
                      <p className="text-sm font-semibold text-slate-100 leading-relaxed">
                        &ldquo;{latestAnalysis.analysis.emotionalState}&rdquo;
                      </p>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl flex gap-3 items-start">
                      <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        <strong className="text-purple-300">Wellness Insight:</strong> {latestAnalysis.analysis.insight}
                      </p>
                    </div>
                  </div>

                  {/* 3 Metrics Row: Stress Level, Burnout Risk, Confidence */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Stress Level */}
                    <div className="glass-panel p-5 rounded-xl space-y-2">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Stress Level</span>
                      <div className="flex items-end justify-between">
                        <span className={`text-xl font-bold ${
                          latestAnalysis.analysis.stressLevel === "High" ? "text-rose-400" :
                          latestAnalysis.analysis.stressLevel === "Medium" ? "text-amber-400" : "text-emerald-400"
                        }`}>
                          {latestAnalysis.analysis.stressLevel}
                        </span>
                        
                        {/* Simple level visual bar */}
                        <div className="flex gap-0.5 h-3 w-10">
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
                    <div className="glass-panel p-5 rounded-xl space-y-2">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Burnout Risk</span>
                      <div className="flex items-end justify-between">
                        <span className={`text-xl font-bold ${
                          latestAnalysis.analysis.burnoutRisk === "High" ? "text-rose-400" :
                          latestAnalysis.analysis.burnoutRisk === "Medium" ? "text-amber-400" : "text-emerald-400"
                        }`}>
                          {latestAnalysis.analysis.burnoutRisk}
                        </span>
                        
                        <div className="flex gap-0.5 h-3 w-10">
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
                    <div className="glass-panel p-5 rounded-xl space-y-2">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Confidence Level</span>
                      <div className="flex items-end justify-between">
                        <span className={`text-xl font-bold ${
                          latestAnalysis.analysis.confidenceLevel === "High" ? "text-emerald-400" :
                          latestAnalysis.analysis.confidenceLevel === "Medium" ? "text-amber-400" : "text-rose-400"
                        }`}>
                          {latestAnalysis.analysis.confidenceLevel}
                        </span>
                        
                        <div className="flex gap-0.5 h-3 w-10">
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

                  {/* Triggers Tag Cloud & Recommendations */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    
                    {/* Triggers column (4 cols) */}
                    <div className="glass-panel rounded-xl p-5 md:col-span-5 space-y-3">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block border-b border-slate-800 pb-1.5">
                        Identified Triggers
                      </span>
                      
                      {latestAnalysis.analysis.triggers.length > 0 ? (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {latestAnalysis.analysis.triggers.map((trig, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-lg"
                            >
                              ⚠️ {trig}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 block py-2">No key stress triggers isolated from text.</span>
                      )}
                    </div>

                    {/* Recommendations column (7 cols) */}
                    <div className="glass-panel rounded-xl p-5 md:col-span-7 space-y-3">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block border-b border-slate-800 pb-1.5">
                        Wellness Support Recommendations
                      </span>

                      <ul className="space-y-2.5 pt-1">
                        {latestAnalysis.analysis.recommendations.map((rec, rIdx) => (
                          <li key={rIdx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>

                </div>
              )}

            </section>
            
          </div>
        )}

        {/* ==============================================
            SCREEN 3: MOOD HISTORY TIMELINE & STATS
            ============================================== */}
        {activeTab === "history" && (
          <div className="space-y-8">
            
            {/* Stats Overview Dashboard */}
            {moodStats ? (
              <section className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="glass-panel p-5 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Total Logs</span>
                  <span className="text-3xl font-extrabold text-indigo-400">{moodStats.total}</span>
                </div>
                <div className="glass-panel p-5 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Dominant Mood</span>
                  <span className="text-3xl font-extrabold text-emerald-400">{moodStats.dominantMood}</span>
                </div>
                <div className="glass-panel p-5 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Avg Stress</span>
                  <span className={`text-3xl font-extrabold ${
                    moodStats.averageStress === "High" ? "text-rose-400" :
                    moodStats.averageStress === "Medium" ? "text-amber-400" : "text-emerald-400"
                  }`}>{moodStats.averageStress}</span>
                </div>
                <div className="glass-panel p-5 rounded-2xl flex flex-col justify-center items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Study Resilience</span>
                  <span className="text-xs font-bold text-purple-300 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full">
                    🟢 Stable & Focused
                  </span>
                </div>
              </section>
            ) : (
              <div className="glass-panel p-6 rounded-2xl text-center text-xs text-slate-500">
                No tracking statistics available. Perform a daily check-in to compile history.
              </div>
            )}

            {/* Chronological Timeline */}
            <section className="glass-panel rounded-2xl p-6 md:p-8 space-y-6">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
                <History className="w-5 h-5 text-indigo-400" />
                <span>Historical Wellness Logs</span>
              </h2>

              {entries.length > 0 ? (
                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-1">
                  {entries.slice().reverse().map((entry, index) => (
                    <div
                      key={entry.id}
                      className="relative border-l border-slate-800 pl-6 space-y-3 pb-6 last:pb-0"
                    >
                      {/* Timeline dot */}
                      <div className="absolute left-[-6px] top-1.5 w-3 h-3 rounded-full border-2 border-[#090d16] bg-indigo-500" />
                      
                      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/30 border border-slate-850 p-4 rounded-xl">
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5">
                            <span className="text-sm font-bold text-slate-200">
                              {entry.mood === "Happy" && "😊 Happy"}
                              {entry.mood === "Good" && "🙂 Good"}
                              {entry.mood === "Neutral" && "😐 Neutral"}
                              {entry.mood === "Sad" && "😔 Sad"}
                              {entry.mood === "Stressed" && "😫 Stressed"}
                            </span>
                            <span className="text-[10px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                              {entry.examType}
                            </span>
                          </div>
                          
                          <span className="text-[10px] text-slate-500 block font-medium">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>

                          <p className="text-xs text-slate-400 italic max-w-xl leading-relaxed pt-2">
                            &ldquo;{entry.reflection}&rdquo;
                          </p>

                          <div className="pt-2 flex flex-wrap gap-1">
                            {entry.analysis.triggers.map((t, idx) => (
                              <span key={idx} className="text-[9px] font-bold bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setLatestAnalysis(entry)}
                            className="text-xs px-2.5 py-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/20 transition cursor-pointer"
                          >
                            Restore Insight
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            aria-label="Delete entry"
                            className="text-xs p-1.5 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-sm">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Guided Breathing Box (Left / 7 cols) */}
            <section className="lg:col-span-7 glass-panel rounded-2xl p-6 md:p-8 space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  <span>Interactive Guided Breathing</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  60-second visual simulator using the standard 4-4-4 box breathing technique to quickly lower stress before exams.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center py-8 space-y-8">
                
                {/* Simulated Breathing Circle */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                  
                  {/* Outer pulse wave */}
                  {breathingActive && (
                    <div className={`absolute inset-0 rounded-full border border-indigo-500/30 transition-all duration-1000 ${
                      breathingPhase === "Inhale" ? "scale-100 opacity-80" : 
                      breathingPhase === "Hold" ? "scale-105 opacity-100 animate-ping" : "scale-75 opacity-40"
                    }`} />
                  )}

                  {/* Breathing Circle Ring */}
                  <div className={`w-40 h-40 rounded-full bg-slate-900 border-2 flex flex-col items-center justify-center text-center shadow-lg transition-all duration-1000 ${
                    breathingActive
                      ? breathingPhase === "Inhale"
                        ? "border-emerald-500/60 scale-105 shadow-emerald-500/10"
                        : breathingPhase === "Hold"
                        ? "border-amber-500/60 scale-110 shadow-amber-500/10"
                        : "border-indigo-500/60 scale-95 shadow-indigo-500/10"
                      : "border-slate-800 scale-100"
                  }`}>
                    {breathingActive ? (
                      <>
                        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-1">
                          {breathingPhase}
                        </span>
                        <span className={`text-3xl font-extrabold tracking-tight ${
                          breathingPhase === "Inhale" ? "text-emerald-400" :
                          breathingPhase === "Hold" ? "text-amber-400" : "text-indigo-400"
                        }`}>
                          {phaseSeconds}s
                        </span>
                      </>
                    ) : (
                      <>
                        <BrainCircuit className="w-8 h-8 text-slate-600 mb-2" />
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Ready</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status Bar / Details */}
                <div className="text-center space-y-2">
                  <div className="text-sm font-bold text-slate-200">
                    {breathingActive ? (
                      breathingPhase === "Inhale" ? "🌿 Breathe in deep through your nose..." :
                      breathingPhase === "Hold" ? "⏳ Hold and feel your heartbeat steady..." :
                      "💨 Slowly exhale through your mouth..."
                    ) : (
                      "Breathe to Calmer Mind"
                    )}
                  </div>
                  
                  {breathingActive && (
                    <div className="text-xs text-indigo-400 font-semibold bg-indigo-500/5 border border-indigo-500/10 px-3 py-1 rounded-full inline-block">
                      Exercise time remaining: {breathingTimer}s
                    </div>
                  )}
                </div>

                {/* Control Triggers */}
                <div className="flex gap-4">
                  {!breathingActive ? (
                    <button
                      onClick={startBreathing}
                      aria-label="Start guided breathing exercise"
                      className="bg-indigo-500 hover:bg-indigo-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 shadow-md shadow-indigo-500/15 cursor-pointer active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                      <span>Start Box Breathing (60s)</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopBreathing}
                      aria-label="Stop guided breathing exercise"
                      className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Square className="w-3.5 h-3.5 fill-rose-300 text-rose-300" />
                      <span>Stop Exercise</span>
                    </button>
                  )}
                </div>

              </div>
            </section>

            {/* Right column: Pop-it Stress Buster & Study Checklists (5 cols) */}
            <section className="lg:col-span-5 space-y-6">
              
              {/* Stress Buster Bubble Game */}
              <div className="glass-panel rounded-2xl p-5 md:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Smile className="w-5 h-5 text-pink-400" />
                    <h3 className="text-sm font-bold text-slate-100">Stress Pop-It Game</h3>
                  </div>
                  <button
                    onClick={resetBubbles}
                    aria-label="Reset popped bubbles"
                    className="text-[10px] text-slate-500 hover:text-slate-300 font-semibold cursor-pointer"
                  >
                    Reset Grid
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">Pop bubbles to release syllabus tension. Simple satisfying micro-interaction.</p>

                {/* Pop it Grid (16 bubbles) */}
                <div className="grid grid-cols-4 gap-3 max-w-[200px] mx-auto py-2">
                  {bubbles.map((popped, bIdx) => (
                    <button
                      key={bIdx}
                      onClick={() => handlePopBubble(bIdx)}
                      aria-label={`Bubble ${bIdx + 1} ${popped ? "popped" : "unpopped"}`}
                      className={`w-10 h-10 rounded-full border transition duration-200 cursor-pointer active:scale-90 ${
                        popped
                          ? "bg-slate-950 border-slate-850 shadow-inner text-slate-700"
                          : "bg-gradient-to-tr from-pink-500 to-indigo-500 border-pink-400/40 shadow-md shadow-pink-500/10 text-white"
                      }`}
                    >
                      {popped ? "" : "🎈"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Static coping list resources */}
              <div className="glass-panel rounded-2xl p-5 md:p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2.5">
                  <BookOpen className="w-4.5 h-4.5 text-indigo-400" />
                  <span>Exam Preparation Mindset Cards</span>
                </h3>

                <div className="space-y-3.5">
                  {WELLNESS_HUB_BOOSTERS.map((hub, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/30 border border-slate-850 rounded-xl p-3.5 space-y-2 hover:border-slate-800 transition duration-200"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                        <span className="text-xs font-bold text-slate-200">{hub.title}</span>
                        <span className="text-[9px] text-indigo-400 font-bold bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10">
                          {hub.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                        {hub.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </section>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/20 py-4 text-center mt-auto px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-slate-500">
          <span>&copy; {new Date().getFullYear()} MindGlow. Made with Care for Students.</span>
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            Empowering aspirants to beat stress and study healthily.
          </span>
        </div>
      </footer>
    </div>
  );
}
