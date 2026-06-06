"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BrainCircuit,
  MessageSquare,
  Mic,
  MicOff,
  Heart,
  Activity,
  History,
  Calendar,
  Sparkles,
  Play,
  Square,
  BookOpen,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Volume2
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

// Pre-configured mock coping tips / wellness boosters with Indian memes and quotes
const WELLNESS_HUB_BOOSTERS = [
  {
    title: "🧘 Mock Test Down Bad Era",
    description: "Got low ranks? Don't panic. As Uncle Ben said: 'With great exam prep comes great stress-busting responsibility.' Deep breaths. Picture abhi baaki hai mere dost!",
    category: "Main Character Reset"
  },
  {
    title: "⚡ Backlog Slay Strategy",
    description: "Syllabus backlog renting space in your head rent-free? Break it into tiny 30-min sessions. No cap, slow progress is still progress. Let's cook!",
    category: "Study Recovery"
  },
  {
    title: "💤 Night Before Exam: Kalm Edition",
    description: "Close your books early. 'Why so serious?' Sleep is the ultimate cheat code. A sleep-deprived brain is not vibing. Keep it All Is Well!",
    category: "No Cap Tip"
  }
];

// Famous Indian & Global Memes & Quotes shortcuts for check-in
const PRESETS_VIBES = [
  "Mock test scores went down bad. Panik mode active! 📈",
  "Sharma Ji Ka Beta got 99.9% but my mock backlog is renting space in my head rent-free. 💀",
  "Chilla chilla ke sabko scheme batade! Studying 12 hours but feeling mid. 🤐",
  "Bro decided to complete 5 chapters in one night. Now down bad and sleep deprived. 😴",
  "Vibing today! Locked in and revised all organic chemistry formulas. Slaying! 👑"
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
      alert("Browser speech recognition is not supported. Type your reflection below, no cap!");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN"; // Set to Indian English for better local accent transcription

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
        setError("Microphone permission denied. Allow mic access in your browser settings to speak.");
      } else {
        setError("Voice transcription was interrupted. Please type instead!");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Loading animation cycle status list with trendy GenZ words
  const loadingMessages = [
    "Centering your main character energy... 🧘",
    "Checking if Sharma Ji Ka Beta is stressing you... 📈",
    "Evicting syllabus stress renting space rent-free... 🧠",
    "Preparing your emotional glow up plan... 👑",
    "Structuring top tier wellness advice, no cap... 🍳"
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
      setError("Pick your mood vibe check first! 👑");
      return;
    }
    if (!reflection.trim()) {
      setError("Tell us what's on your mind. Let us help you cook! 🍳");
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
      setError(err.message || "Something went wrong. Let's try that again!");
    } finally {
      setLoading(false);
    }
  };

  // Delete an entry from local storage history
  const handleDeleteEntry = (id: string) => {
    if (confirm("Evict this entry from history?")) {
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
      alert("Absolute win! 60-second breathing completed. You are locked-in and ready to slay! 👑");
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
    <div className="relative min-h-screen flex flex-col bg-[#f8fafc] text-[#0f172a] font-sans antialiased">
      {/* Background ambient decorative pastel glows */}
      <div className="ambient-glow top-[10%] left-[-100px]" />
      <div className="ambient-glow-rose bottom-[20%] right-[-100px]" />

      {/* HEADER SECTION (Mobile responsive) */}
      <header className="w-full border-b border-slate-200/80 bg-white/70 backdrop-blur-md sticky top-0 z-50 px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-rose-400 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 bg-clip-text text-transparent">
                MindGlow <span className="text-[10px] text-indigo-600 font-bold px-1.5 py-0.5 bg-indigo-500/10 rounded-md border border-indigo-500/20">मनGlow</span>
              </h1>
              <p className="text-[9px] text-slate-500 font-semibold tracking-wider uppercase">Exam Vibe Check & Wellness Companion</p>
            </div>
          </div>

          {/* Navigation Controls (Mobile first design, wraps nicely) */}
          <nav className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab("checkin")}
              aria-label="Vibe Check Screen"
              className={`text-xs px-3 py-2 rounded-xl border transition duration-200 flex items-center gap-1.5 cursor-pointer ${
                activeTab === "checkin"
                  ? "bg-indigo-500 text-white border-indigo-500 font-bold shadow-md shadow-indigo-500/15"
                  : "bg-white/90 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Vibe Check</span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              aria-label="Glow Log Screen"
              className={`text-xs px-3 py-2 rounded-xl border transition duration-200 flex items-center gap-1.5 cursor-pointer ${
                activeTab === "history"
                  ? "bg-indigo-500 text-white border-indigo-500 font-bold shadow-md shadow-indigo-500/15"
                  : "bg-white/90 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Glow Log</span>
              {entries.length > 0 && (
                <span className="bg-rose-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {entries.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("wellness")}
              aria-label="Chill Hub Screen"
              className={`text-xs px-3 py-2 rounded-xl border transition duration-200 flex items-center gap-1.5 cursor-pointer ${
                activeTab === "wellness"
                  ? "bg-indigo-500 text-white border-indigo-500 font-bold shadow-md shadow-indigo-500/15"
                  : "bg-white/90 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Chill Hub</span>
            </button>
          </nav>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 md:py-10">

        {/* MOTIVATIONAL BANNER (Quotes & Memes) */}
        <div className="mb-6 p-4 glass-panel rounded-2xl border-l-4 border-l-purple-500 flex items-start gap-3 shadow-sm">
          <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-extrabold text-purple-700 block uppercase tracking-wider mb-0.5">Today's Daily Reset Quote</span>
            <p className="text-slate-600 italic">
              &ldquo;Why so serious? It's just an exam! With great mock tests comes great breathing responsibility. All is well, let's slay today!&rdquo; 🕷️🤡
            </p>
          </div>
        </div>

        {/* ==============================================
            SCREEN 1 & 2: VIBE CHECK-IN & AI GLOW UP PLAN
            ============================================== */}
        {activeTab === "checkin" && (
          <div className="space-y-6">
            
            {/* Simple Daily Input Box (Single Column for Mobile First ease of use) */}
            <section className="glass-panel rounded-2xl p-5 md:p-8 space-y-6">
              <div className="border-b border-slate-200/80 pb-3 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <MessageSquare className="w-4.5 h-4.5 text-indigo-500" />
                  <span>Start Your Vibe Check</span>
                </h2>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 px-2.5 py-0.5 rounded-lg font-bold">
                  Gemini-2.5-Flash
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Select Mood Area */}
                <div className="space-y-2.5">
                  <label id="mood-label" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    How are you feeling? (Current Era)
                  </label>
                  <div className="grid grid-cols-5 gap-2" role="group" aria-labelledby="mood-label">
                    {(["Happy", "Good", "Neutral", "Sad", "Stressed"] as const).map((m) => {
                      const isSelected = mood === m;
                      let colorStyles = "border-slate-200/80 bg-white hover:border-indigo-400 hover:bg-slate-50 text-slate-500";
                      
                      if (isSelected) {
                        if (m === "Stressed") colorStyles = "bg-rose-100 text-rose-700 border-rose-400 font-bold shadow-sm";
                        else if (m === "Sad") colorStyles = "bg-amber-100 text-amber-700 border-amber-400 font-bold shadow-sm";
                        else if (m === "Neutral") colorStyles = "bg-blue-100 text-blue-700 border-blue-400 font-bold shadow-sm";
                        else if (m === "Good") colorStyles = "bg-purple-100 text-purple-700 border-purple-400 font-bold shadow-sm";
                        else colorStyles = "bg-emerald-100 text-emerald-700 border-emerald-400 font-bold shadow-sm";
                      }

                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMood(m)}
                          aria-label={`Mood: ${m}`}
                          aria-pressed={isSelected}
                          className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition duration-250 cursor-pointer ${colorStyles}`}
                        >
                          <span className="text-2xl mb-1" role="img" aria-hidden="true">
                            {m === "Happy" && "👑"}
                            {m === "Good" && "✨"}
                            {m === "Neutral" && "😐"}
                            {m === "Sad" && "😔"}
                            {m === "Stressed" && "😫"}
                          </span>
                          <span className="text-[9px] uppercase tracking-wide font-extrabold">
                            {m === "Happy" && "Slay"}
                            {m === "Good" && "Vibe"}
                            {m === "Neutral" && "Mid"}
                            {m === "Sad" && "Down"}
                            {m === "Stressed" && "Panik"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Exam selection (Mobile friendly tap selects) */}
                <div className="space-y-2">
                  <label htmlFor="exam-selector" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Target Exam Focus
                  </label>
                  <select
                    id="exam-selector"
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-indigo-500/50 rounded-xl px-3.5 py-3 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition"
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
                      placeholder="Specify exam name (e.g. CUET, NDA)"
                      value={customExam}
                      onChange={(e) => setCustomExam(e.target.value)}
                      className="w-full mt-2 bg-white border border-slate-200 focus:border-indigo-500/50 rounded-xl px-3.5 py-2.5 text-slate-700 text-xs focus:outline-none"
                    />
                  )}
                </div>

                {/* Text / Voice journal input */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label htmlFor="reflection-input" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Write or Speak Your Thoughts (No Cap)
                    </label>
                    
                    {/* Voice record trigger */}
                    <button
                      type="button"
                      onClick={handleVoiceReflection}
                      aria-label={isListening ? "Stop voice recording" : "Record thoughts with microphone"}
                      className={`text-[10px] px-3 py-1.5 rounded-xl border transition duration-200 flex items-center gap-1 cursor-pointer font-bold ${
                        isListening
                          ? "mic-active border-rose-400 text-white"
                          : "bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:border-slate-300"
                      }`}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-3.5 h-3.5 text-white" />
                          <span>Stop Recording</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                          <span>Record Voice</span>
                        </>
                      )}
                    </button>
                  </div>

                  <textarea
                    id="reflection-input"
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="E.g., 'Bro, Sharma Ji Ka Beta is studying 12 hours a day and my syllabus backlog is renting space rent-free. Panik!'"
                    rows={3}
                    className="w-full bg-white border border-slate-200 focus:border-indigo-500/50 rounded-xl px-4 py-3.5 text-slate-800 text-sm focus:outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/10"
                  />

                  {/* Pre-written templates for students shortcut */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Or click a meme preset check-in:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESETS_VIBES.map((txt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setReflection(txt)}
                          className="text-[10px] text-left px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white/60 text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition"
                        >
                          {txt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submission triggers */}
                {error && (
                  <div className="bg-rose-100 border border-rose-200 text-rose-700 rounded-xl p-3 flex gap-2 items-start text-xs font-semibold leading-relaxed" role="alert">
                    <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-400 hover:from-indigo-600 hover:to-rose-500 text-white font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition duration-300 cursor-pointer shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Cooking your Wellness Plan... 🍳</span>
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="w-4.5 h-4.5 text-white" />
                      <span>Let AI Cook My Wellness Plan 🍳</span>
                    </>
                  )}
                </button>
              </form>
            </section>

            {/* AI Results Presentation Area (Dynamic, scrolls into view) */}
            {loading && (
              <div className="glass-panel rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[350px]">
                <div className="relative w-28 h-28 flex items-center justify-center mb-6">
                  <div className="absolute inset-0 rounded-full border border-dashed border-indigo-400/30 animate-spin" style={{ animationDuration: '6s' }} />
                  <div className="w-14 h-14 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-inner">
                    <BrainCircuit className="w-7 h-7 text-indigo-500 animate-bounce" />
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-slate-800 mb-1">Let Him Cook! 🍳</h3>
                <p className="text-xs text-slate-500 mb-6 max-w-xs leading-relaxed">MindGlow is generating your personalized GenZ mental health recovery report...</p>

                <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4.5 py-2.5 rounded-full text-xs text-indigo-600 font-bold min-w-[280px] justify-center shadow-sm animate-pulse">
                  <span>{loadingMessages[loadingStep]}</span>
                </div>
              </div>
            )}

            {!loading && latestAnalysis && (
              <section className="space-y-6">
                
                {/* Analysis Header Card (Insight & Summary) */}
                <div className="glass-panel rounded-2xl p-6 border-l-4 border-l-indigo-500 space-y-4 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wider block">Your Wellness Glow Plan</span>
                      <h3 className="text-xs text-slate-500 font-bold flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Logged: {new Date(latestAnalysis.timestamp).toLocaleTimeString()} ({latestAnalysis.examType})</span>
                      </h3>
                    </div>
                    
                    <span className="text-2xl" role="img" aria-label="Checked mood representation">
                      {latestAnalysis.mood === "Happy" && "👑 Slaying"}
                      {latestAnalysis.mood === "Good" && "✨ Vibing"}
                      {latestAnalysis.mood === "Neutral" && "😐 Mid"}
                      {latestAnalysis.mood === "Sad" && "😔 Down Bad"}
                      {latestAnalysis.mood === "Stressed" && "😫 Panik"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Vibe Summary</h4>
                    <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                      &ldquo;{latestAnalysis.analysis.emotionalState}&rdquo;
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl flex gap-3 items-start shadow-inner">
                    <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-purple-900 leading-relaxed font-semibold">
                      <strong className="text-purple-700 block uppercase tracking-wider text-[9px] mb-0.5">AI Coping Advice:</strong> 
                      {latestAnalysis.analysis.insight}
                    </p>
                  </div>
                </div>

                {/* 3 Metrics Row: Stress Level, Burnout Risk, Confidence */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* Stress Level */}
                  <div className="glass-panel p-5 rounded-2xl space-y-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Stress Level</span>
                    <div className="flex items-end justify-between">
                      <span className={`text-xl font-extrabold ${
                        latestAnalysis.analysis.stressLevel === "High" ? "text-rose-600" :
                        latestAnalysis.analysis.stressLevel === "Medium" ? "text-amber-600" : "text-emerald-600"
                      }`}>
                        {latestAnalysis.analysis.stressLevel === "High" ? "💀 High" : 
                         latestAnalysis.analysis.stressLevel === "Medium" ? "⚡ Medium" : "🟢 Low"}
                      </span>
                      
                      {/* Simple level visual bar */}
                      <div className="flex gap-0.5 h-3 w-10">
                        <div className={`w-3 h-full rounded-sm ${
                          latestAnalysis.analysis.stressLevel !== "Low" ? "bg-amber-400" : "bg-emerald-400"
                        }`} />
                        <div className={`w-3 h-full rounded-sm ${
                          latestAnalysis.analysis.stressLevel === "High" ? "bg-rose-400" : "bg-slate-200"
                        }`} />
                        <div className={`w-3 h-full rounded-sm ${
                          latestAnalysis.analysis.stressLevel === "High" ? "bg-rose-500" : "bg-slate-200"
                        }`} />
                      </div>
                    </div>
                  </div>

                  {/* Burnout Risk */}
                  <div className="glass-panel p-5 rounded-2xl space-y-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Burnout Risk</span>
                    <div className="flex items-end justify-between">
                      <span className={`text-xl font-extrabold ${
                        latestAnalysis.analysis.burnoutRisk === "High" ? "text-rose-600" :
                        latestAnalysis.analysis.burnoutRisk === "Medium" ? "text-amber-600" : "text-emerald-600"
                      }`}>
                        {latestAnalysis.analysis.burnoutRisk}
                      </span>
                      
                      <div className="flex gap-0.5 h-3 w-10">
                        <div className={`w-3 h-full rounded-sm ${
                          latestAnalysis.analysis.burnoutRisk !== "Low" ? "bg-amber-400" : "bg-emerald-400"
                        }`} />
                        <div className={`w-3 h-full rounded-sm ${
                          latestAnalysis.analysis.burnoutRisk === "High" ? "bg-rose-400" : "bg-slate-200"
                        }`} />
                        <div className={`w-3 h-full rounded-sm ${
                          latestAnalysis.analysis.burnoutRisk === "High" ? "bg-rose-500" : "bg-slate-200"
                        }`} />
                      </div>
                    </div>
                  </div>

                  {/* Confidence Level */}
                  <div className="glass-panel p-5 rounded-2xl space-y-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Confidence Level</span>
                    <div className="flex items-end justify-between">
                      <span className={`text-xl font-extrabold ${
                        latestAnalysis.analysis.confidenceLevel === "High" ? "text-emerald-600" :
                        latestAnalysis.analysis.confidenceLevel === "Medium" ? "text-amber-600" : "text-rose-600"
                      }`}>
                        {latestAnalysis.analysis.confidenceLevel === "High" ? "👑 High" : 
                         latestAnalysis.analysis.confidenceLevel === "Medium" ? "⚡ Medium" : "💀 Low"}
                      </span>
                      
                      <div className="flex gap-0.5 h-3 w-10">
                        <div className={`w-3 h-full rounded-sm ${
                          latestAnalysis.analysis.confidenceLevel === "Low" ? "bg-rose-400" : "bg-emerald-400"
                        }`} />
                        <div className={`w-3 h-full rounded-sm ${
                          latestAnalysis.analysis.confidenceLevel === "High" ? "bg-emerald-400" : "bg-slate-200"
                        }`} />
                        <div className={`w-3 h-full rounded-sm ${
                          latestAnalysis.analysis.confidenceLevel === "High" ? "bg-emerald-500" : "bg-slate-200"
                        }`} />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Triggers Tag Cloud & Recommendations (Responsive Grid) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Triggers list */}
                  <div className="glass-panel rounded-2xl p-5 space-y-3 shadow-sm">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block border-b border-slate-200 pb-1.5">
                      Syllabus Stress Triggers (Rent Free)
                    </span>
                    
                    {latestAnalysis.analysis.triggers.length > 0 ? (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {latestAnalysis.analysis.triggers.map((trig, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200 px-3 py-1 rounded-xl shadow-inner"
                          >
                            ⚠️ {trig}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 block py-1">No triggers isolated, absolute win!</span>
                    )}
                  </div>

                  {/* Recommendations */}
                  <div className="glass-panel rounded-2xl p-5 space-y-3 shadow-sm">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block border-b border-slate-200 pb-1.5">
                      Your Slay-Break Recommendations
                    </span>

                    <ul className="space-y-2.5 pt-1">
                      {latestAnalysis.analysis.recommendations.map((rec, rIdx) => (
                        <li key={rIdx} className="text-xs text-slate-600 flex items-start gap-2 leading-relaxed">
                          <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

              </section>
            )}

          </div>
        )}

        {/* ==============================================
            SCREEN 3: GLOW HISTORICAL TIMELINE & STATS
            ============================================== */}
        {activeTab === "history" && (
          <div className="space-y-6">
            
            {/* Stats Overview Dashboard */}
            {moodStats ? (
              <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="glass-panel p-4.5 rounded-2xl text-center space-y-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Checks done</span>
                  <span className="text-2xl font-extrabold text-indigo-600">{moodStats.total}</span>
                </div>
                <div className="glass-panel p-4.5 rounded-2xl text-center space-y-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Common Era</span>
                  <span className="text-2xl font-extrabold text-emerald-600">
                    {moodStats.dominantMood === "Happy" && "👑 Slay"}
                    {moodStats.dominantMood === "Good" && "✨ Vibe"}
                    {moodStats.dominantMood === "Neutral" && "😐 Mid"}
                    {moodStats.dominantMood === "Sad" && "😔 Down"}
                    {moodStats.dominantMood === "Stressed" && "😫 Panik"}
                  </span>
                </div>
                <div className="glass-panel p-4.5 rounded-2xl text-center space-y-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Avg Stress</span>
                  <span className={`text-2xl font-extrabold ${
                    moodStats.averageStress === "High" ? "text-rose-600" :
                    moodStats.averageStress === "Medium" ? "text-amber-600" : "text-emerald-600"
                  }`}>{moodStats.averageStress}</span>
                </div>
                <div className="glass-panel p-4.5 rounded-2xl text-center flex flex-col justify-center items-center gap-1.5">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Mental Slay</span>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-full">
                    👑 Unstoppable
                  </span>
                </div>
              </section>
            ) : (
              <div className="glass-panel p-6 rounded-2xl text-center text-xs text-slate-400">
                Log your vibes first to unlock the stats board.
              </div>
            )}

            {/* Timeline */}
            <section className="glass-panel rounded-2xl p-5 md:p-7 space-y-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-3">
                <History className="w-5 h-5 text-indigo-500" />
                <span>Your Glow Log Timeline</span>
              </h2>

              {entries.length > 0 ? (
                <div className="space-y-5 max-h-[500px] overflow-y-auto pr-1">
                  {entries.slice().reverse().map((entry) => (
                    <div
                      key={entry.id}
                      className="relative border-l border-slate-200 pl-5 space-y-2 pb-5 last:pb-0"
                    >
                      {/* Dot */}
                      <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full border border-white bg-indigo-500 shadow-sm" />
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/80 border border-slate-200 p-4 rounded-2xl shadow-sm hover:border-indigo-300 transition duration-200">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-800">
                              {entry.mood === "Happy" && "👑 Slaying"}
                              {entry.mood === "Good" && "✨ Vibing"}
                              {entry.mood === "Neutral" && "😐 Mid"}
                              {entry.mood === "Sad" && "😔 Down Bad"}
                              {entry.mood === "Stressed" && "😫 Panik"}
                            </span>
                            <span className="text-[9px] text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full font-bold">
                              {entry.examType}
                            </span>
                          </div>
                          
                          <span className="text-[9px] text-slate-400 block font-medium">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>

                          <p className="text-xs text-slate-500 italic pt-1 leading-relaxed">
                            &ldquo;{entry.reflection}&rdquo;
                          </p>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <button
                            onClick={() => {
                              setLatestAnalysis(entry);
                              setActiveTab("checkin");
                            }}
                            className="text-[10px] px-2.5 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-xl font-bold hover:bg-indigo-100 transition cursor-pointer"
                          >
                            Show Insights
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            aria-label="Delete entry"
                            className="p-1.5 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400 text-xs">
                  Your timeline is empty. Perform a daily vibe check to log entries!
                </div>
              )}
            </section>

          </div>
        )}

        {/* ==============================================
            SCREEN 4: CHILL HUB (Guided Breathing & Pop-It)
            ============================================== */}
        {activeTab === "wellness" && (
          <div className="space-y-6">
            
            {/* Box Breathing */}
            <section className="glass-panel rounded-2xl p-5 md:p-8 space-y-6 shadow-sm">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Activity className="w-4.5 h-4.5 text-indigo-500" />
                  <span>Interactive Box Breathing Simulator (4-4-4)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Reset your nervous system in 60 seconds. Box breathing reduces exam panik instantly. No cap!
                </p>
              </div>

              <div className="flex flex-col items-center justify-center py-6 space-y-6">
                
                {/* Visual Circle */}
                <div className="relative w-44 h-44 flex items-center justify-center">
                  {breathingActive && (
                    <div className={`absolute inset-0 rounded-full border border-indigo-400/40 transition-all duration-1000 ${
                      breathingPhase === "Inhale" ? "scale-100 opacity-70" : 
                      breathingPhase === "Hold" ? "scale-105 opacity-100 animate-ping" : "scale-75 opacity-30"
                    }`} />
                  )}

                  <div className={`w-36 h-36 rounded-full bg-white border-2 flex flex-col items-center justify-center text-center shadow-lg transition-all duration-1000 ${
                    breathingActive
                      ? breathingPhase === "Inhale"
                        ? "border-emerald-400 scale-105 shadow-emerald-200/50"
                        : breathingPhase === "Hold"
                        ? "border-amber-400 scale-110 shadow-amber-200/50"
                        : "border-indigo-400 scale-95 shadow-indigo-200/50"
                      : "border-slate-200 scale-100"
                  }`}>
                    {breathingActive ? (
                      <>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">
                          {breathingPhase === "Inhale" ? "🧘 Inhale" : 
                           breathingPhase === "Hold" ? "⏳ Hold" : "💨 Exhale"}
                        </span>
                        <span className={`text-3xl font-extrabold tracking-tight ${
                          breathingPhase === "Inhale" ? "text-emerald-600" :
                          breathingPhase === "Hold" ? "text-amber-600" : "text-indigo-600"
                        }`}>
                          {phaseSeconds}s
                        </span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-7 h-7 text-slate-300 mb-1" />
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Ready</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Subtext instruction */}
                <div className="text-center">
                  <div className="text-xs font-bold text-slate-700">
                    {breathingActive ? (
                      breathingPhase === "Inhale" ? "Breathe in main character energy deep..." :
                      breathingPhase === "Hold" ? "Let the syllabus stress stay outside..." :
                      "Exhale the panik, you are slaying..."
                    ) : (
                      "Press play to start calming your nerves"
                    )}
                  </div>
                  
                  {breathingActive && (
                    <div className="text-[10px] text-indigo-600 font-bold bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full inline-block mt-3 shadow-inner">
                      Timer: {breathingTimer}s remaining
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex gap-3">
                  {!breathingActive ? (
                    <button
                      onClick={startBreathing}
                      aria-label="Start breathing exercise"
                      className="bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 shadow-md shadow-indigo-500/15 cursor-pointer active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-white text-white" />
                      <span>Start Breathing Exercise</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopBreathing}
                      aria-label="Stop breathing exercise"
                      className="bg-rose-100 hover:bg-rose-200 text-rose-700 border border-rose-200 font-bold px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Square className="w-3.5 h-3.5 fill-rose-700 text-rose-700" />
                      <span>Stop Exercise</span>
                    </button>
                  )}
                </div>

              </div>
            </section>

            {/* Bubble Pop-It Grid (Tension Release) */}
            <section className="glass-panel rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-pink-500" />
                  <h3 className="text-xs font-bold text-slate-800">Stress Pop-It Game (Satisfying pop in your head)</h3>
                </div>
                <button
                  onClick={resetBubbles}
                  className="text-[10px] text-indigo-600 font-bold hover:text-indigo-800 cursor-pointer"
                >
                  Reset Grid
                </button>
              </div>
              <p className="text-[11px] text-slate-500">Studying too much? Pop some bubbles, release that tension instantly! 🎈</p>

              <div className="grid grid-cols-4 gap-3.5 max-w-[200px] mx-auto py-2">
                {bubbles.map((popped, bIdx) => (
                  <button
                    key={bIdx}
                    onClick={() => handlePopBubble(bIdx)}
                    aria-label={`Bubble ${bIdx + 1} ${popped ? "popped" : "unpopped"}`}
                    className={`w-10 h-10 rounded-full border transition duration-200 cursor-pointer active:scale-90 shadow-sm ${
                      popped
                        ? "bg-slate-100 border-slate-200 text-slate-300 shadow-inner"
                        : "bg-gradient-to-tr from-pink-400 to-indigo-400 border-pink-300 text-white"
                    }`}
                  >
                    {popped ? "" : "🎈"}
                  </button>
                ))}
              </div>
            </section>

            {/* Exam prep Mindset Cards */}
            <section className="glass-panel rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-2.5">
                <BookOpen className="w-4.5 h-4.5 text-indigo-500" />
                <span>Locked-In Exam Mindset Cards</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {WELLNESS_HUB_BOOSTERS.map((hub, idx) => (
                  <div
                    key={idx}
                    className="bg-white/80 border border-slate-200 rounded-xl p-4 space-y-2 shadow-sm hover:border-indigo-300 transition duration-200"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{hub.category}</span>
                    </div>
                    <span className="text-xs font-extrabold text-indigo-600 block">{hub.title}</span>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
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
      <footer className="w-full border-t border-slate-200 bg-white/50 py-4 text-center mt-auto px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-[9px] text-slate-400 font-bold">
          <span>&copy; {new Date().getFullYear()} MindGlow (मनGlow). Slaying exam stress daily, no cap.</span>
          <span className="flex items-center gap-1 text-slate-500">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            Let him cook! Powered by Gemini AI.
          </span>
        </div>
      </footer>
    </div>
  );
}
