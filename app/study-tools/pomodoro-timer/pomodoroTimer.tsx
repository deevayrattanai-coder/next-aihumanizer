"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  Plus,
  Trash2,
  Check,
  Timer,
  Coffee,
  TreePine,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  Clock,
  Brain,
  Target,
  Zap,
  BookOpen,
  CheckCircle2,
  ListTodo,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  pomodoros: number;
  estimatedPomodoros: number;
}

interface TimerSettings {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  longBreakInterval: number;
  soundEnabled: boolean;
  volume: number;
  notificationsEnabled: boolean;
}

const DEFAULT_SETTINGS: TimerSettings = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  longBreakInterval: 4,
  soundEnabled: true,
  volume: 80,
  notificationsEnabled: false,
};

const MODE_CONFIG = {
  pomodoro: { label: "Pomodoro", icon: Timer, color: "hsl(var(--primary))" },
  shortBreak: { label: "Short Break", icon: Coffee, color: "hsl(142 71% 45%)" },
  longBreak: { label: "Long Break", icon: TreePine, color: "hsl(199 89% 48%)" },
};

const PomodoroTimerPage = () => {
  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [showTaskEstimate, setShowTaskEstimate] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalTime = settings[mode] * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pomodoro-settings");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch {}
    }
    const savedTasks = localStorage.getItem("pomodoro-tasks");
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch {}
    }
    const savedPomodoros = localStorage.getItem("pomodoro-completed");
    if (savedPomodoros) setCompletedPomodoros(parseInt(savedPomodoros) || 0);
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("pomodoro-settings", JSON.stringify(settings));
  }, [settings]);
  useEffect(() => {
    localStorage.setItem("pomodoro-tasks", JSON.stringify(tasks));
  }, [tasks]);
  useEffect(() => {
    localStorage.setItem("pomodoro-completed", String(completedPomodoros));
  }, [completedPomodoros]);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            // eslint-disable-next-line react-hooks/immutability
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  // Update document title
  useEffect(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    document.title = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")} — ${MODE_CONFIG[mode].label} | DevAIHumanizer`;
    return () => {
      document.title = "DevAIHumanizer";
    };
  }, [timeLeft, mode]);

  const playSound = useCallback(() => {
    if (!settings.soundEnabled) return;
    try {
      const ctx = new window.AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.value = (settings.volume / 100) * 0.3;
      osc.frequency.value = 830;
      osc.type = "sine";
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        gain2.gain.value = (settings.volume / 100) * 0.3;
        osc2.frequency.value = 1050;
        osc2.type = "sine";
        osc2.start();
        osc2.stop(ctx.currentTime + 0.3);
      }, 200);
    } catch {}
  }, [settings.soundEnabled, settings.volume]);

  const sendNotification = useCallback(
    (title: string, body: string) => {
      if (
        settings.notificationsEnabled &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification(title, { body, icon: "/logos/logo-icon.png" });
      }
    },
    [settings.notificationsEnabled],
  );

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    playSound();

    if (mode === "pomodoro") {
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);
      if (activeTaskId) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === activeTaskId ? { ...t, pomodoros: t.pomodoros + 1 } : t,
          ),
        );
      }
      sendNotification("Pomodoro Complete! 🎉", "Time for a break.");
      if (newCount % settings.longBreakInterval === 0) {
        // eslint-disable-next-line react-hooks/immutability
        switchMode("longBreak");
        if (settings.autoStartBreaks) setIsRunning(true);
      } else {
        switchMode("shortBreak");
        if (settings.autoStartBreaks) setIsRunning(true);
      }
    } else {
      sendNotification("Break Over! 💪", "Time to focus.");
      switchMode("pomodoro");
      if (settings.autoStartPomodoros) setIsRunning(true);
    }
  }, [
    mode,
    completedPomodoros,
    activeTaskId,
    settings,
    playSound,
    sendNotification,
  ]);

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(settings[newMode] * 60);
    setIsRunning(false);
  };

  const resetTimer = () => {
    setTimeLeft(settings[mode] * 60);
    setIsRunning(false);
  };

  const addTask = () => {
    if (!newTaskText.trim()) return;
    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: newTaskText.trim(),
        completed: false,
        pomodoros: 0,
        estimatedPomodoros: 1,
      },
    ]);
    setNewTaskText("");
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (activeTaskId === id) setActiveTaskId(null);
  };

  const updateEstimate = (id: string, est: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, estimatedPomodoros: Math.max(1, est) } : t,
      ),
    );
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const perm = await Notification.requestPermission();
      setSettings((prev) => ({
        ...prev,
        notificationsEnabled: perm === "granted",
      }));
    }
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const modeColor =
    mode === "pomodoro" ? "primary" : mode === "shortBreak" ? "emerald" : "sky";

  return (
    <div className="min-h-screen bg-background relative">
      <Navbar />

      <main className="relative z-10">
        {/* Breadcrumb */}
        <div className="container-tight px-4 pt-6 pb-2">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              href="/study-tools"
              className="hover:text-primary transition-colors"
            >
              Study Tools
            </Link>
            <span>/</span>
            <span className="text-foreground">Pomodoro Timer</span>
          </nav>
        </div>

        {/* Timer Section */}
        <section className="py-8 md:py-12">
          <div className="container-tight px-4">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,640px)_1fr] gap-6 items-start">
              {/* Left Ad Space - reserved for future ad integration */}
              <div className="hidden lg:block" />

              {/* Timer Core */}
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                    Pomodoro Timer
                  </h1>
                  <p className="text-muted-foreground">
                    Stay focused and boost your productivity
                  </p>
                </div>

                {/* Mode Tabs */}
                <div className="flex items-center justify-center gap-2">
                  {(Object.keys(MODE_CONFIG) as TimerMode[]).map((m) => {
                    const cfg = MODE_CONFIG[m];
                    const Icon = cfg.icon;
                    return (
                      <button
                        key={m}
                        onClick={() => switchMode(m)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                          mode === m
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                            : "bg-surface text-muted-foreground hover:text-foreground hover:bg-accent border border-border/30",
                        )}
                        style={
                          mode === m
                            ? { backgroundColor: cfg.color }
                            : undefined
                        }
                      >
                        <Icon className="w-4 h-4" />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>

                {/* Timer Display */}
                <motion.div
                  className="flex flex-col items-center"
                  key={mode}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative w-[320px] h-[320px] flex items-center justify-center">
                    <svg
                      className="absolute inset-0 w-full h-full -rotate-90"
                      viewBox="0 0 320 320"
                    >
                      <circle
                        cx="160"
                        cy="160"
                        r="140"
                        fill="none"
                        stroke="hsl(var(--border)/0.3)"
                        strokeWidth="8"
                      />
                      <circle
                        cx="160"
                        cy="160"
                        r="140"
                        fill="none"
                        stroke={MODE_CONFIG[mode].color}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000 ease-linear"
                      />
                    </svg>
                    <div className="text-center z-10">
                      <div className="font-display text-7xl font-bold text-foreground tabular-nums tracking-tight">
                        {String(mins).padStart(2, "0")}:
                        {String(secs).padStart(2, "0")}
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        Session #{completedPomodoros + 1}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={resetTimer}
                    className="rounded-full h-12 w-12"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={() => setIsRunning(!isRunning)}
                    size="xl"
                    className="rounded-full px-12 shadow-lg transition-all duration-300"
                    style={{ backgroundColor: MODE_CONFIG[mode].color }}
                  >
                    {isRunning ? (
                      <Pause className="w-5 h-5 mr-2" />
                    ) : (
                      <Play className="w-5 h-5 mr-2" />
                    )}
                    {isRunning ? "Pause" : "Start"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSettings(!showSettings)}
                    className="rounded-full h-12 w-12"
                  >
                    <Settings className="w-5 h-5" />
                  </Button>
                </div>

                {/* Completed Pomodoros */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {Array.from({ length: Math.min(completedPomodoros, 12) }).map(
                    (_, i) => (
                      <div
                        key={i}
                        className="w-3 h-3 rounded-full bg-primary"
                        style={{ backgroundColor: MODE_CONFIG.pomodoro.color }}
                      />
                    ),
                  )}
                  {completedPomodoros > 12 && (
                    <span className="text-xs text-muted-foreground">
                      +{completedPomodoros - 12} more
                    </span>
                  )}
                  {completedPomodoros > 0 && (
                    <span className="text-xs text-muted-foreground ml-2">
                      {completedPomodoros} pomodoro
                      {completedPomodoros > 1 ? "s" : ""} completed
                    </span>
                  )}
                </div>

                {/* Settings Panel */}
                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <Card className="p-6 bg-surface border-border/30 space-y-5">
                        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                          <Settings className="w-4 h-4" /> Timer Settings
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            {
                              key: "pomodoro" as const,
                              label: "Pomodoro",
                              min: 1,
                              max: 60,
                            },
                            {
                              key: "shortBreak" as const,
                              label: "Short Break",
                              min: 1,
                              max: 30,
                            },
                            {
                              key: "longBreak" as const,
                              label: "Long Break",
                              min: 1,
                              max: 60,
                            },
                          ].map(({ key, label, min, max }) => (
                            <div key={key}>
                              <label className="text-xs text-muted-foreground mb-1 block">
                                {label} (min)
                              </label>
                              <Input
                                type="number"
                                min={min}
                                max={max}
                                value={settings[key]}
                                onChange={(e) => {
                                  const val = Math.min(
                                    max,
                                    Math.max(
                                      min,
                                      parseInt(e.target.value) || min,
                                    ),
                                  );
                                  setSettings((prev) => ({
                                    ...prev,
                                    [key]: val,
                                  }));
                                  if (key === mode) setTimeLeft(val * 60);
                                }}
                                className="bg-background"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm text-foreground">
                              Auto-start breaks
                            </label>
                            <Switch
                              checked={settings.autoStartBreaks}
                              onCheckedChange={(v) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  autoStartBreaks: v,
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <label className="text-sm text-foreground">
                              Auto-start pomodoros
                            </label>
                            <Switch
                              checked={settings.autoStartPomodoros}
                              onCheckedChange={(v) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  autoStartPomodoros: v,
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <label className="text-sm text-foreground">
                              Long break interval
                            </label>
                            <Input
                              type="number"
                              min={2}
                              max={10}
                              value={settings.longBreakInterval}
                              onChange={(e) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  longBreakInterval: Math.min(
                                    10,
                                    Math.max(2, parseInt(e.target.value) || 4),
                                  ),
                                }))
                              }
                              className="w-20 bg-background"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <label className="text-sm text-foreground flex items-center gap-2">
                              {settings.soundEnabled ? (
                                <Volume2 className="w-4 h-4" />
                              ) : (
                                <VolumeX className="w-4 h-4" />
                              )}
                              Sound
                            </label>
                            <Switch
                              checked={settings.soundEnabled}
                              onCheckedChange={(v) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  soundEnabled: v,
                                }))
                              }
                            />
                          </div>
                          {settings.soundEnabled && (
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">
                                Volume: {settings.volume}%
                              </label>
                              <Slider
                                value={[settings.volume]}
                                onValueChange={([v]) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    volume: v,
                                  }))
                                }
                                min={0}
                                max={100}
                                step={5}
                              />
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <label className="text-sm text-foreground">
                              Desktop notifications
                            </label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={requestNotificationPermission}
                            >
                              {settings.notificationsEnabled
                                ? "Enabled ✓"
                                : "Enable"}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Task List */}
                <Card className="p-5 bg-surface border-border/30">
                  <h3 className="font-display font-semibold text-foreground flex items-center gap-2 mb-4">
                    <ListTodo className="w-4 h-4" /> Tasks
                  </h3>
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="What are you working on?"
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addTask()}
                      className="bg-background"
                    />
                    <Button onClick={addTask} size="icon" className="shrink-0">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {tasks.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No tasks yet. Add one above!
                      </p>
                    )}
                    {tasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                          activeTaskId === task.id
                            ? "border-primary/50 bg-primary/5"
                            : "border-border/30 hover:border-border/60",
                          task.completed && "opacity-60",
                        )}
                        onClick={() =>
                          setActiveTaskId(
                            task.id === activeTaskId ? null : task.id,
                          )
                        }
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTask(task.id);
                          }}
                          className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                            task.completed
                              ? "bg-primary border-primary"
                              : "border-muted-foreground/40",
                          )}
                        >
                          {task.completed && (
                            <Check className="w-3 h-3 text-primary-foreground" />
                          )}
                        </button>
                        <span
                          className={cn(
                            "flex-1 text-sm",
                            task.completed &&
                              "line-through text-muted-foreground",
                          )}
                        >
                          {task.text}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {task.pomodoros}/{task.estimatedPomodoros}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowTaskEstimate(
                              showTaskEstimate === task.id ? null : task.id,
                            );
                          }}
                          className="text-muted-foreground hover:text-foreground p-1"
                        >
                          {showTaskEstimate === task.id ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTask(task.id);
                          }}
                          className="text-muted-foreground hover:text-destructive p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}
                    {tasks.length > 0 && tasks.every((t) => t.completed) && (
                      <p className="text-sm text-center text-primary py-2">
                        All tasks completed! 🎉
                      </p>
                    )}
                  </div>
                  {tasks.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/30 flex justify-between text-xs text-muted-foreground">
                      <span>
                        Done: {tasks.filter((t) => t.completed).length}/
                        {tasks.length}
                      </span>
                      <button
                        onClick={() =>
                          setTasks((prev) => prev.filter((t) => !t.completed))
                        }
                        className="hover:text-destructive transition-colors"
                      >
                        Clear completed
                      </button>
                    </div>
                  )}
                </Card>

                {/* Keyboard Shortcuts */}
                <Card className="p-4 bg-surface border-border/30">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Keyboard Shortcuts
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      ["Space", "Start / Pause"],
                      ["R", "Reset Timer"],
                      ["1", "Pomodoro"],
                      ["2", "Short Break"],
                      ["3", "Long Break"],
                      ["S", "Settings"],
                    ].map(([key, action]) => (
                      <div key={key} className="flex items-center gap-2">
                        <kbd className="px-2 py-0.5 rounded bg-background border border-border/50 text-xs font-mono">
                          {key}
                        </kbd>
                        <span className="text-muted-foreground text-xs">
                          {action}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Right Ad Space - reserved for future ad integration */}
              <div className="hidden lg:block" />
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-12 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-y border-border/30">
          <div className="container-tight px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <Badge variant="secondary" className="text-xs">
                Recommended Tool
              </Badge>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              Need to Humanize AI-Generated Text?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              After your study session, use our AI Humanizer to transform
              AI-generated content into natural, human-sounding text that
              bypasses all AI detectors.
            </p>
            <Button asChild variant="hero" size="lg">
              <Link href="/#humanizer">
                Try AI Humanizer Free <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="py-16">
          <div className="container-tight px-4 max-w-4xl mx-auto">
            <article className="prose prose-invert max-w-none">
              <h2 className="font-display text-3xl font-bold text-foreground mb-6">
                What is the Pomodoro Technique?
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                The Pomodoro Technique is a time management method developed by
                Francesco Cirillo in the late 1980s. It uses a timer to break
                work into intervals, traditionally 25 minutes in length,
                separated by short breaks. Each interval is known as a pomodoro
                from the Italian word for tomato, after the tomato-shaped
                kitchen timer that Cirillo used as a university student.
              </p>

              <h3 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-primary" /> How Does the
                Pomodoro Timer Work?
              </h3>
              <ol className="space-y-3 text-muted-foreground mb-8">
                {[
                  {
                    title: "Add tasks",
                    desc: "Write down what you want to accomplish today.",
                  },
                  {
                    title: "Set the timer",
                    desc: "Set the Pomodoro timer for 25 minutes and focus on a single task.",
                  },
                  {
                    title: "Work until the timer rings",
                    desc: "Focus entirely on the task. Avoid all distractions.",
                  },
                  {
                    title: "Take a short break",
                    desc: "When the timer rings, take a 5-minute break to recharge.",
                  },
                  {
                    title: "Every 4 pomodoros, take a longer break",
                    desc: "After four work sessions, take a 15–30 minute break.",
                  },
                ].map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 text-primary text-sm font-bold shrink-0">
                      {i + 1}
                    </span>
                    <div>
                      <strong className="text-foreground">{step.title}</strong>{" "}
                      — {step.desc}
                    </div>
                  </li>
                ))}
              </ol>

              <h3 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary" /> The Science Behind
                the Pomodoro Technique
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The attention span is the ability to concentrate on a single
                task. The greater our concentration, the easier it will be to
                complete the task. Studies have estimated that the optimal focus
                interval lasts approximately 20–25 minutes.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                It is natural to be distracted in search of new information, but
                it is also possible to focus again by refreshing the attention
                span through short breaks. This is the core principle behind the
                Pomodoro Technique — working with your brain natural rhythms
                rather than against them.
              </p>

              <h3 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6 text-primary" /> Benefits of Using a
                Pomodoro Timer
              </h3>
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {[
                  {
                    title: "Improved Focus",
                    desc: "Eliminates multitasking and trains deep concentration.",
                  },
                  {
                    title: "Better Time Estimation",
                    desc: "Learn how long tasks actually take over time.",
                  },
                  {
                    title: "Reduced Burnout",
                    desc: "Regular breaks prevent mental fatigue and exhaustion.",
                  },
                  {
                    title: "Increased Accountability",
                    desc: "Track your productive sessions and measure progress.",
                  },
                  {
                    title: "Combat Procrastination",
                    desc: "Starting is easier when you commit to just 25 minutes.",
                  },
                  {
                    title: "Work-Life Balance",
                    desc: "Clear boundaries between focused work and rest periods.",
                  },
                ].map((benefit) => (
                  <Card
                    key={benefit.title}
                    className="p-4 bg-surface border-border/30"
                  >
                    <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />{" "}
                      {benefit.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {benefit.desc}
                    </p>
                  </Card>
                ))}
              </div>

              <h3 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary" /> Who Uses the
                Pomodoro Technique?
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The Pomodoro Technique is used by students, developers, writers,
                designers, and professionals worldwide. Many of your favorite
                YouTubers, influencers, and entrepreneurs use this technique to
                stay productive and manage their time effectively.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                If you find yourself easily distracted and procrastinating, this
                may be your antidote. Whether you are studying for exams,
                working on a project, or writing content — the Pomodoro Timer
                helps you stay on track and accomplish more in less time.
              </p>

              <h3 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-primary" /> What to Do During
                Pomodoro Breaks?
              </h3>
              <ul className="space-y-2 text-muted-foreground mb-8">
                {[
                  "Stretch or do light exercises to refresh your body",
                  "Grab a glass of water or a healthy snack",
                  "Step away from the screen and rest your eyes",
                  "Take a short walk or practice deep breathing",
                  "Avoid checking social media — save that for longer breaks",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                Features of Our Pomodoro Timer
              </h3>
              <div className="grid md:grid-cols-2 gap-3 mb-8">
                {[
                  "Customizable Pomodoro, short break, and long break durations",
                  "Built-in task manager to track your to-do list",
                  "Auto-start options for breaks and work sessions",
                  "Desktop notification alerts when timer completes",
                  "Sound notifications with adjustable volume",
                  "Session counter to track your daily progress",
                  "Keyboard shortcuts for hands-free control",
                  "Clean, distraction-free design",
                  "Works on all devices — desktop, tablet, and mobile",
                  "No sign-up required — completely free",
                ].map((feature) => (
                  <div
                    key={feature}
                    className="flex items-start gap-2 text-muted-foreground text-sm"
                  >
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        {/* Second CTA */}
        <section className="py-12 mb-8">
          <div className="container-tight px-4">
            <Card className="p-8 md:p-10 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 text-center">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
                Finished Studying? Humanize Your AI Content
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-6">
                Use DevAIHumanizer to convert AI-generated essays, assignments,
                and content into natural human writing. Bypass Turnitin,
                GPTZero, and all AI detectors with a 99.8% success rate.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild variant="hero" size="lg">
                  <Link href="/#humanizer">
                    <Sparkles className="w-4 h-4 mr-2" /> Try AI Humanizer Free
                  </Link>
                </Button>
                <Button asChild variant="glass" size="lg">
                  <Link href="/pricing">View Pricing Plans</Link>
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PomodoroTimerPage;
