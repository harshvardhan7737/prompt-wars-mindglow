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
  Volume2,
  AlertOctagon,
  X,
  Music
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
  "Bhai kya kar raha hai tu? Daily revision schedule went down bad. 💀",
  "Iron Man built a suit in a cave with a box of scraps, and I can't even solve this integration question. 😭",
  "Saala jaldi wahan se hato! organic chemistry formulas are renting space in my head. 🤐",
  "Vibing today! Locked in and revised all physics formulas. Slaying! 👑"
];

// Panic Memes Database
const PANIC_MEMES = [
  {
    quote: "Control Uday Control...",
    memeName: "Uday Shetty (Welcome)",
    translation: "Take a deep breath. Sharma ji ka beta is not worth your sleep. Kalm down!"
  },
  {
    quote: "Bilkul risk nahi lene ka!",
    memeName: "Babu Rao (Phir Hera Pheri)",
    translation: "Close the mock test for 5 minutes, drink cold water, and do not panic. Risk-free breathing is valid, no cap!"
  },
  {
    quote: "Bhai kya kar raha hai tu? Mazak chal raha hai kya?",
    memeName: "Ashneer Grover (Shark Tank)",
    translation: "Procrastinating 5 hours before exam? Stop the cap. Start box breathing now and get locked-in!"
  },
  {
    quote: "I am Iron Man.",
    memeName: "Tony Stark (Avengers)",
    translation: "You are the main character of your own preparation. Breathe in, recharge your arc reactor, and let's cook!"
  },
  {
    quote: "It's not who I am underneath, but what I do that defines me.",
    memeName: "Bruce Wayne (Batman Begins)",
    translation: "Your prep errors don't define you. Your next study session does. Time to rise out of the dark cave!"
  },
  {
    quote: "Tell me, do you bleed? You will.",
    memeName: "Batman (Batman v Superman)",
    translation: "Exam papers think they can bleed your scores? No cap, you will conquer them with revisions. Slay!"
  },
  {
    quote: "Part of the journey is the end.",
    memeName: "Iron Man (Avengers: Endgame)",
    translation: "Every backlog and preparation struggle is just the setup. The final victory is going to be legendary, love you 3000!"
  },
  {
    quote: "Chilla chilla ke sabko scheme batade!",
    memeName: "Raju (Hera Pheri)",
    translation: "Keep your study strategy quiet. Slay in silence, no cap. Let them wonder how you got that 99%."
  },
  {
    quote: "Arey mujhe chakkar aane laga!",
    memeName: "Babu Rao (Hera Pheri)",
    translation: "Feeling dizzier than Babu Rao over equations? Drink water, do 3 box breathing cycles, and reset."
  },
  {
    quote: "Aap chronology samajhiye...",
    memeName: "Chronology Meme",
    translation: "First we breathe, then we rest, then we revise. That is the winning chronology, no cap."
  }
];

interface SpeechRecognitionResult {
  transcript: string;
}
interface SpeechRecognitionResultList {
  [index: number]: {
    [index: number]: SpeechRecognitionResult;
  };
}
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent {
  error: string;
}
interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
}

// Generate Stereo Noise Buffer (White Noise + spatialized clicks)
// Defined outside of the React component to satisfy the react-hooks/purity ESLint rules.
function generateRainBuffer(ctx: AudioContext): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const duration = 5.0; // 5 seconds of variety
  const bufferSize = sampleRate * duration;
  const noiseBuffer = ctx.createBuffer(2, bufferSize, sampleRate);
  const leftChannel = noiseBuffer.getChannelData(0);
  const rightChannel = noiseBuffer.getChannelData(1);

  for (let i = 0; i < bufferSize; i++) {
    leftChannel[i] = Math.random() * 2 - 1;
    rightChannel[i] = Math.random() * 2 - 1;
  }

  // Add 380 random raindrop clicks (impulse thumps & splats) panned across channels
  const numDrops = 380;
  let prevL = 0.0, prevR = 0.0;
  for (let d = 0; d < numDrops; d++) {
    const startIdx = Math.floor(Math.random() * bufferSize);
    const decay = 0.003 + Math.random() * 0.012;
    const numSamples = Math.floor(decay * sampleRate);
    const pan = Math.floor(Math.random() * 3); // 0=L, 1=R, 2=Both

    for (let i = 0; i < numSamples; i++) {
      const idx = (startIdx + i) % bufferSize;
      const env = Math.exp(-8.5 * i / numSamples);
      const white = Math.random() * 2 - 1;

      if (pan === 0 || pan === 2) {
        const hpL = (white - prevL) * 0.5;
        leftChannel[idx] += hpL * env * 0.22;
      }
      if (pan === 1 || pan === 2) {
        const hpR = (white - prevR) * 0.5;
        rightChannel[idx] += hpR * env * 0.22;
      }
      prevL = white;
      prevR = white;
    }
  }

  return noiseBuffer;
}

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

  // Audio Context Lofi Synth State
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [lofiPlaying, setLofiPlaying] = useState(false);
  const [synthNodes, setSynthNodes] = useState<AudioNode[]>([]);
  const [rainMode, setRainMode] = useState<"downpour" | "shower" | "monsoon">("downpour");

  // Refs to hold real-time adjustable Web Audio Nodes
  const rumbleGainRef = React.useRef<GainNode | null>(null);
  const showerGainRef = React.useRef<GainNode | null>(null);
  const sizzleGainRef = React.useRef<GainNode | null>(null);
  const filterRef = React.useRef<BiquadFilterNode | null>(null);
  const lfoGainRef = React.useRef<GainNode | null>(null);

  // Panic Button State
  const [panicActive, setPanicActive] = useState(false);
  const [panicMeme, setPanicMeme] = useState<typeof PANIC_MEMES[0] | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  // Initialize and load historical entries
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setTimeout(() => {
          setEntries(parsed);
          if (parsed.length > 0) {
            setLatestAnalysis(parsed[parsed.length - 1]);
          }
        }, 0);
      }
    } catch (err) {
      console.error("Failed to load local storage entries", err);
    }
  }, []);

  // Web Speech API Voice recording handler
  const handleVoiceReflection = () => {
    const SpeechRecognition =
      (window as Window & { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
      (window as Window & { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;
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

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setReflection((prev) => (prev ? prev + " " + transcript : transcript));
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
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
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev >= loadingMessages.length - 1) {
          return prev;
        }
        return prev + 1;
      });
    }, 2000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setLoadingStep(0);
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

    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Something went wrong. Let's try that again!";
      setError(errorMessage);
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
      setTimeout(() => {
        setBreathingActive(false);
        alert("Absolute win! 60-second breathing completed. You are locked-in and ready to slay! 👑");
        setBreathingTimer(60);
        setPhaseSeconds(4);
        setBreathingPhase("Inhale");
      }, 0);
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
    
    // Play a tiny synthesis click sound
    try {
      const ctx = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
      setTimeout(() => ctx.close(), 200);
    } catch {}
  };

  const applyRainModeSettings = (mode: "downpour" | "shower" | "monsoon", ctx: AudioContext) => {
    const time = ctx.currentTime;
    
    // Smooth transitions (0.4s) to avoid clicks or sudden shifts
    if (rumbleGainRef.current) {
      const rumbleVal = mode === "downpour" ? 0.08 : mode === "shower" ? 0.015 : 0.11;
      rumbleGainRef.current.gain.linearRampToValueAtTime(rumbleVal, time + 0.4);
    }
    
    if (showerGainRef.current) {
      const showerVal = mode === "downpour" ? 0.045 : mode === "shower" ? 0.06 : 0.075;
      showerGainRef.current.gain.linearRampToValueAtTime(showerVal, time + 0.4);
    }
    
    if (sizzleGainRef.current) {
      const sizzleVal = mode === "downpour" ? 0.015 : mode === "shower" ? 0.045 : 0.03;
      sizzleGainRef.current.gain.linearRampToValueAtTime(sizzleVal, time + 0.4);
    }

    if (filterRef.current) {
      const freqVal = mode === "downpour" ? 1100 : mode === "shower" ? 1800 : 1300;
      filterRef.current.frequency.linearRampToValueAtTime(freqVal, time + 0.4);
    }

    if (lfoGainRef.current) {
      const lfoVal = mode === "downpour" ? 350 : mode === "shower" ? 150 : 550;
      lfoGainRef.current.gain.linearRampToValueAtTime(lfoVal, time + 0.4);
    }
  };

  const handleChangeRainMode = (mode: "downpour" | "shower" | "monsoon") => {
    setRainMode(mode);
    if (audioCtx && lofiPlaying) {
      applyRainModeSettings(mode, audioCtx);
    }
  };

  // Web Audio Lofi Synth Playback Trigger
  const handleToggleLofi = async () => {
    if (lofiPlaying) {
      // Stop synthesis
      synthNodes.forEach((node) => {
        try {
          node.disconnect();
          if (node instanceof AudioBufferSourceNode || node instanceof OscillatorNode) {
            node.stop();
          }
        } catch {}
      });
      setSynthNodes([]);
      if (audioCtx) {
        audioCtx.close();
        setAudioCtx(null);
      }
      rumbleGainRef.current = null;
      showerGainRef.current = null;
      sizzleGainRef.current = null;
      filterRef.current = null;
      lfoGainRef.current = null;
      setLofiPlaying(false);
    } else {
      try {
        const ctx = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
        if (ctx.state === "suspended") {
          await ctx.resume();
        }
        setAudioCtx(ctx);

        const noiseBuffer = generateRainBuffer(ctx);
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        // Lowpass Rumble Path
        const rumbleFilter = ctx.createBiquadFilter();
        rumbleFilter.type = "lowpass";
        rumbleFilter.frequency.setValueAtTime(140, ctx.currentTime);
        const rumbleGain = ctx.createGain();
        rumbleGainRef.current = rumbleGain;

        // Bandpass Shower Path
        const showerFilter = ctx.createBiquadFilter();
        showerFilter.type = "bandpass";
        showerFilter.frequency.setValueAtTime(650, ctx.currentTime);
        showerFilter.Q.setValueAtTime(0.8, ctx.currentTime);
        const showerGain = ctx.createGain();
        showerGainRef.current = showerGain;

        // Highpass Sizzle Path
        const sizzleFilter = ctx.createBiquadFilter();
        sizzleFilter.type = "highpass";
        sizzleFilter.frequency.setValueAtTime(2800, ctx.currentTime);
        const sizzleGain = ctx.createGain();
        sizzleGainRef.current = sizzleGain;

        // Master Filter with slow modulating LFO
        const masterFilter = ctx.createBiquadFilter();
        masterFilter.type = "lowpass";
        filterRef.current = masterFilter;

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(1.0, ctx.currentTime);

        // Slow Modulating Wind LFO
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.02, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGainRef.current = lfoGain;

        lfo.connect(lfoGain);
        lfoGain.connect(masterFilter.frequency);

        // Connections
        noiseSource.connect(rumbleFilter);
        rumbleFilter.connect(rumbleGain);
        rumbleGain.connect(masterFilter);

        noiseSource.connect(showerFilter);
        showerFilter.connect(showerGain);
        showerGain.connect(masterFilter);

        noiseSource.connect(sizzleFilter);
        sizzleFilter.connect(sizzleGain);
        sizzleGain.connect(masterFilter);

        masterFilter.connect(masterGain);
        masterGain.connect(ctx.destination);

        // Set initial settings based on current state rainMode
        applyRainModeSettings(rainMode, ctx);

        lfo.start();
        noiseSource.start();

        setSynthNodes([noiseSource, lfo, rumbleFilter, showerFilter, sizzleFilter, masterFilter, rumbleGain, showerGain, sizzleGain, lfoGain]);
        setLofiPlaying(true);
      } catch (err) {
        console.error("Failed to initialize Web Audio Lofi Synth", err);
      }
    }
  };

  // PANIC BUTTON ACTION
  const handleTriggerPanic = () => {
    // 1. Play alert warning sound
    try {
      const ctx = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
      setTimeout(() => ctx.close(), 400);
    } catch {}

    // 2. Trigger screen shake
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);

    // 3. Pick random panic meme and open overlay
    const rand = PANIC_MEMES[Math.floor(Math.random() * PANIC_MEMES.length)];
    setPanicMeme(rand);
    setPanicActive(true);
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
    <div className={`relative min-h-screen flex flex-col bg-[#f8fafc] text-[#0f172a] font-sans antialiased retro-grid overflow-x-hidden ${
      isShaking ? "shake-screen" : ""
    }`}>
      {/* Background ambient decorative pastel glows */}
      <div className="ambient-glow top-[10%] left-[-100px]" />
      <div className="ambient-glow-rose bottom-[20%] right-[-100px]" />

      {/* Floating Collage Stickers (Decorative GenZ icons) */}
      <div className="absolute top-[15%] left-[2%] text-2xl md:text-4xl select-none opacity-15 md:opacity-25 pointer-events-none floating-sticker">🤡</div>
      <div className="absolute top-[50%] left-[1%] text-2xl md:text-4xl select-none opacity-15 md:opacity-25 pointer-events-none floating-sticker-delayed">💅</div>
      <div className="absolute top-[75%] left-[2%] text-2xl md:text-4xl select-none opacity-15 md:opacity-25 pointer-events-none floating-sticker">💀</div>
      <div className="absolute top-[20%] right-[1%] text-2xl md:text-4xl select-none opacity-15 md:opacity-25 pointer-events-none floating-sticker-delayed">🧠</div>
      <div className="absolute top-[60%] right-[1%] text-2xl md:text-4xl select-none opacity-15 md:opacity-25 pointer-events-none floating-sticker">👑</div>
      <div className="absolute top-[80%] right-[2%] text-2xl md:text-4xl select-none opacity-15 md:opacity-25 pointer-events-none floating-sticker-delayed">🧢</div>

      {/* HEADER SECTION (Responsive & collapsible) */}
      <header className="w-full border-b border-slate-200/80 bg-white/70 backdrop-blur-md sticky top-0 z-50 px-4 py-3">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3.5 sm:gap-4 w-full sm:w-auto justify-start">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-rose-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-105 flex-shrink-0">
              <BrainCircuit className="w-8 h-8 sm:w-9 sm:h-9 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 bg-clip-text text-transparent flex flex-row items-center justify-start gap-2 leading-none">
                <span>MindGlow</span>
                <span className="text-[11px] sm:text-xs text-indigo-600 font-bold px-2 py-0.5 bg-indigo-500/10 rounded-md border border-indigo-500/20">मनGlow</span>
              </h1>
              <p className="text-[9px] sm:text-[10px] text-slate-500 font-extrabold tracking-widest uppercase mt-1">Exam Vibe Check & Wellness Companion</p>
            </div>
          </div>

          {/* Navigation Controls (Mobile first design, wraps nicely) */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            <button
              onClick={() => setActiveTab("checkin")}
              aria-label="Vibe Check Screen"
              className={`text-xs px-3 py-2 rounded-xl border transition duration-200 flex items-center gap-1.5 cursor-pointer ${
                activeTab === "checkin"
                  ? "bg-indigo-600 text-white border-indigo-600 font-bold shadow-md shadow-indigo-500/20"
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
                  ? "bg-indigo-600 text-white border-indigo-600 font-bold shadow-md shadow-indigo-500/20"
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
                  ? "bg-indigo-600 text-white border-indigo-600 font-bold shadow-md shadow-indigo-500/20"
                  : "bg-white/90 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Chill Hub</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-5 md:py-8">

        {/* MOTIVATIONAL BANNER (Quotes & Memes) */}
        <div className="mb-5 p-4 glass-panel rounded-2xl border-l-4 border-l-purple-500 flex items-start gap-3 shadow-sm">
          <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-extrabold text-purple-700 block uppercase tracking-wider mb-0.5">Today&apos;s Daily Reset Quote</span>
            <p className="text-slate-600 italic">
              &ldquo;Why so serious? It&apos;s just an exam! With great mock tests comes great breathing responsibility. All is well, let&apos;s slay today!&rdquo; 🕷️🤡
            </p>
          </div>
        </div>

        {/* ==============================================
            SCREEN 1 & 2: VIBE CHECK-IN & AI GLOW UP PLAN
            ============================================== */}
        {activeTab === "checkin" && (
          <div className="space-y-6">
            
            {/* Simple Daily Input Box (Single Column for Mobile First ease of use) */}
            <section className="glass-panel rounded-2xl p-5 md:p-8 space-y-6 shadow-sm">
              <div className="border-b border-slate-200/80 pb-3 flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <MessageSquare className="w-4.5 h-4.5 text-indigo-500" />
                  <span>Start Your Vibe Check</span>
                </h2>
                
                {/* Panic & AI Badge Area */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTriggerPanic}
                    className="bg-rose-500 hover:bg-rose-600 text-white font-black text-[10px] px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-rose-500/15 cursor-pointer animate-bounce"
                  >
                    <AlertOctagon className="w-3.5 h-3.5 text-white" />
                    <span>🚨 PANIK BUTTON</span>
                  </button>
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 px-2.5 py-1.5 rounded-xl font-bold">
                    Gemini Active
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Select Mood Area */}
                <div className="space-y-2.5">
                  <label id="mood-label" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    How are you feeling? (Current Era)
                  </label>
                  <div className="grid grid-cols-5 gap-1.5" role="group" aria-labelledby="mood-label">
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
                          className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl border text-center transition duration-250 cursor-pointer ${colorStyles}`}
                        >
                          <span className="text-2xl mb-1" role="img" aria-hidden="true">
                            {m === "Happy" && "👑"}
                            {m === "Good" && "✨"}
                            {m === "Neutral" && "😐"}
                            {m === "Sad" && "😔"}
                            {m === "Stressed" && "😫"}
                          </span>
                          <span className="text-[9px] uppercase tracking-wide font-extrabold block">
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
                          <Mic className="w-3.5 h-3.5 text-indigo-500" />
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
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
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
                    <div className="text-xs text-purple-900 leading-relaxed font-semibold">
                      <strong className="text-purple-700 block uppercase tracking-wider text-[9px] mb-0.5">AI Coping Advice:</strong> 
                      {latestAnalysis.analysis.insight}
                    </div>
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
                
                {/* Visual Circle (Responsive sizing) */}
                <div className="relative w-32 h-32 md:w-44 md:h-44 flex items-center justify-center">
                  {breathingActive && (
                    <div className={`absolute inset-0 rounded-full border border-indigo-400/45 transition-all duration-1000 ${
                      breathingPhase === "Inhale" ? "scale-100 opacity-70" : 
                      breathingPhase === "Hold" ? "scale-105 opacity-100 animate-ping" : "scale-75 opacity-30"
                    }`} />
                  )}

                  <div className={`w-28 h-28 md:w-36 md:h-36 rounded-full bg-white border-2 flex flex-col items-center justify-center text-center shadow-lg transition-all duration-1000 ${
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
                        <span className={`text-2xl md:text-3xl font-extrabold tracking-tight ${
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

            {/* Interactive Lo-Fi Walkman Web Audio Synthesizer */}
            <section className="glass-panel rounded-2xl p-5 md:p-7 space-y-4 shadow-sm">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Music className="w-4.5 h-4.5 text-purple-600" />
                  <span>MindGlow Cassette Walkman (Continuous Rain)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Synthesize a live, soothing, continuous rain shower with wind gusts and pitter-patter raindrops directly in your browser. Fully offline, no external audio files required. Slay your syllabus in calm!
                </p>
              </div>

              {/* Cassette Visual Widget */}
              <div className="max-w-[280px] mx-auto bg-gradient-to-br from-indigo-800 to-purple-900 border-4 border-slate-900 p-4.5 rounded-2xl shadow-xl text-white space-y-4">
                
                {/* Cassette Label Header */}
                <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-700/60 pb-1.5">
                  <span>Side A - Calmed In</span>
                  <span>Continuous Rain ASMR</span>
                </div>

                {/* Cassette Window (Reels spinning) */}
                <div className="bg-slate-950 rounded-xl h-14 border border-slate-800 flex items-center justify-around px-5 relative shadow-inner">
                  {/* Left reel */}
                  <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center relative">
                    <div className={`w-3.5 h-3.5 rounded-full border-2 border-dashed border-purple-400 ${
                      lofiPlaying ? "cassette-spin" : ""
                    }`} />
                  </div>

                  {/* Tape visibility bar */}
                  <div className="absolute w-12 h-1.5 bg-yellow-400/80 rounded-full opacity-35" />

                  {/* Right reel */}
                  <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center relative">
                    <div className={`w-3.5 h-3.5 rounded-full border-2 border-dashed border-purple-400 ${
                      lofiPlaying ? "cassette-spin" : ""
                    }`} />
                  </div>
                </div>
                {/* Rain Preset Mode Selector (Real-Time Audio Channel Equalizer) */}
                <div className="space-y-1.5 pt-1 border-t border-slate-700/60">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block text-center">Select Heavy Rain Vibe:</span>
                  <div className="grid grid-cols-3 gap-1">
                    {(["downpour", "shower", "monsoon"] as const).map((m) => {
                      const isActive = rainMode === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => handleChangeRainMode(m)}
                          className={`text-[8px] font-black py-1.5 px-0.5 rounded-lg border transition duration-150 cursor-pointer text-center uppercase tracking-wide leading-none ${
                            isActive
                              ? "bg-indigo-500 border-indigo-400 text-white shadow-md shadow-indigo-500/20"
                              : "bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900"
                          }`}
                        >
                          {m === "downpour" && "🌧️ Downpour"}
                          {m === "shower" && "☔ Shower"}
                          {m === "monsoon" && "⚡ Monsoon"}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Control Player */}
                <div className="flex items-center justify-center gap-3.5 pt-1">
                  <button
                    onClick={handleToggleLofi}
                    className={`px-4.5 py-2 rounded-xl text-xs font-black shadow transition active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                      lofiPlaying 
                        ? "bg-rose-500 text-white hover:bg-rose-600" 
                        : "bg-emerald-400 text-slate-950 hover:bg-emerald-500"
                    }`}
                  >
                    {lofiPlaying ? (
                      <>
                        <Square className="w-3.5 h-3.5 text-white fill-white" />
                        <span>Eject Tape</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                        <span>Insert & Play Tape</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>

            {/* Bubble Pop-It Grid (Tension Release) */}
            <section className="glass-panel rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-pink-500" />
                  <h3 className="text-xs font-bold text-slate-800">Stress Pop-It Game (Satisfying clicks)</h3>
                </div>
                <button
                  onClick={resetBubbles}
                  className="text-[10px] text-indigo-600 font-bold hover:text-indigo-800 cursor-pointer"
                >
                  Reset Grid
                </button>
              </div>
              <p className="text-[11px] text-slate-500">Pop bubbles between syllabus milestones to flush out panik. Plays custom synth pops!</p>

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
                    className="bg-white/85 border border-slate-200 rounded-xl p-4 space-y-2 shadow-sm hover:border-indigo-300 transition duration-200"
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

      {/* PANIK OVERLAY MODAL (Satisfying Meme Reset Card) */}
      {panicActive && panicMeme && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-indigo-400 shadow-2xl p-6 max-w-sm w-full relative space-y-5 animate-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              onClick={() => setPanicActive(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Meme Content Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto text-rose-500">
                <AlertOctagon className="w-6 h-6 animate-pulse" />
              </div>
              <span className="text-[10px] text-rose-600 font-extrabold bg-rose-50 border border-rose-200 px-3 py-1 rounded-full uppercase inline-block shadow-inner">
                Emergency Meme Activated
              </span>
            </div>

            {/* Main Quote Card */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-center space-y-2 shadow-sm">
              <h4 className="text-base font-black text-slate-800 leading-snug">
                &ldquo;{panicMeme.quote}&rdquo;
              </h4>
              <span className="text-[10px] font-bold text-slate-400 block">— {panicMeme.memeName}</span>
            </div>

            {/* Slang comfort translation */}
            <div className="text-center space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                {panicMeme.translation}
              </p>
              
              <button
                onClick={() => {
                  setPanicActive(false);
                  setActiveTab("wellness");
                  startBreathing();
                }}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-indigo-500/15 transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Activity className="w-4 h-4" />
                <span>Go Slay Stress with Box Breathing 🧘</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
