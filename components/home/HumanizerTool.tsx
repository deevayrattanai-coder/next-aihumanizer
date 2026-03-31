"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Check,
  Loader2,
  Sparkles,
  AlertCircle,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Send,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWordUsage } from "@/hooks/useWordUsage";
import { supabase } from "@/integrations/supabase/client";
import UsageWarningBanner from "@/components/UsageWarningBanner";
import FileUpload from "@/components/home/FileUpload";
import DiffView from "@/components/home/DiffView";
import DetectionScore from "@/components/home/DetectionScore";
import { toast } from "sonner";

const countWords = (text: string) =>
  text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

const countSyllables = (word: string): number => {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const m = word.match(/[aeiouy]{1,2}/g);
  return m ? m.length : 1;
};

const fleschKincaid = (text: string): { grade: number; label: string } => {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  if (words.length === 0 || sentences.length === 0)
    return { grade: 0, label: "N/A" };
  const syllables = words.reduce((s, w) => s + countSyllables(w), 0);
  const grade =
    0.39 * (words.length / sentences.length) +
    11.8 * (syllables / words.length) -
    15.59;
  const rounded = Math.max(0, Math.round(grade * 10) / 10);
  let label = "College";
  if (rounded <= 5) label = "Easy";
  else if (rounded <= 8) label = "Middle School";
  else if (rounded <= 12) label = "High School";
  else label = "College+";
  return { grade: rounded, label };
};

const computeUniqueness = (original: string, humanized: string): number => {
  const origWords = original
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const humWords = humanized
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  if (origWords.length === 0) return 100;
  let changed = 0;
  const minLen = Math.min(origWords.length, humWords.length);
  for (let i = 0; i < minLen; i++) {
    if (origWords[i] !== humWords[i]) changed++;
  }
  changed += Math.abs(origWords.length - humWords.length);
  return Math.min(
    100,
    Math.round((changed / Math.max(origWords.length, humWords.length)) * 100),
  );
};

const extractText = (raw: unknown): string => {
  if (!raw) return "";
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (
      trimmed.startsWith("{") ||
      trimmed.startsWith("[") ||
      trimmed.startsWith('"')
    ) {
      try {
        return extractText(JSON.parse(trimmed));
      } catch {
        toast.error("Failed to parse text as JSON, returning original string");
      }
    }
    return trimmed;
  }
  if (Array.isArray(raw)) return extractText(raw[0]);
  if (typeof raw === "object" && raw !== null) {
    const obj = raw as Record<string, unknown>;
    for (const key of [
      "finalText",
      "humanizedText",
      "text",
      "output",
      "response",
      "result",
      "content",
      "message",
      "data",
    ]) {
      if (
        typeof obj[key] === "string" &&
        (obj[key] as string).trim().length > 0
      )
        return extractText(obj[key]);
    }
    for (const val of Object.values(obj)) {
      if (typeof val === "string" && val.trim().length > 20)
        return extractText(val);
    }
  }
  return String(raw);
};

type Tone = "academic" | "casual" | "professional" | "creative";

const toneOptions: { value: Tone; label: string; emoji: string }[] = [
  { value: "academic", label: "Academic", emoji: "🎓" },
  { value: "casual", label: "Casual", emoji: "💬" },
  { value: "professional", label: "Professional", emoji: "💼" },
  { value: "creative", label: "Creative", emoji: "🎨" },
];

const HumanizerTool = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tone, setTone] = useState<Tone>("professional");
  const [feedbackGiven, setFeedbackGiven] = useState<"up" | "down" | null>(
    null,
  );
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [lastHistoryId, setLastHistoryId] = useState<string | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const router = useRouter();
  const {
    wordsUsed,
    lifetimeLimit,
    remaining,
    plan,
    expired,
    loading: usageLoading,
    addUsage,
  } = useWordUsage();

  const inputWords = countWords(inputText);

  const MAX_RETRIES = 3;

  const attemptHumanize = async (attempt: number): Promise<string> => {
    const { data, error } = await supabase.functions.invoke("humanize-relay", {
      body: { text: inputText },
    });
    if (error) throw new Error(error.message || "Humanization request failed");
    const humanized = extractText(data);
    if (!humanized) throw new Error("No humanized text was returned");
    return humanized;
  };

  const handleHumanize = async () => {
    if (!user) {
      toast.error("Please log in to humanize your text");
      router.push("/login");
      return;
    }
    if (inputWords === 0) {
      toast.error("No input text provided for humanization");
      return;
    }
    if (expired && plan !== "free") {
      toast.error(
        "Your credits have expired. Please renew or upgrade your plan.",
      );
      router.push("/pricing");
      return;
    }
    if (inputWords > remaining) {
      toast.error("Word limit exceeded. Please upgrade for more.");
      router.push("/pricing");
      return;
    }

    setIsProcessing(true);
    setOutputText("");
    setFeedbackGiven(null);
    setShowFeedbackInput(false);
    setFeedbackMessage("");

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const humanized = await attemptHumanize(attempt);
        setOutputText(humanized);

        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || null;

        const { data: insertedRow } = await supabase
          .from("humanization_history")
          .insert({
            user_id: user.id,
            original_text: inputText,
            humanized_text: humanized,
            word_count: inputWords,
            is_retry: outputText.length > 0,
            user_timezone: tz,
          })
          .select("id")
          .single();

        if (insertedRow) setLastHistoryId(insertedRow.id);

        await addUsage(inputWords);
        setIsProcessing(false);
        return; // Success — exit
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error");
        toast.error(`Attempt ${attempt} failed. Retrying...`);
        if (attempt < MAX_RETRIES) {
          // Wait briefly before retrying
          await new Promise((r) => setTimeout(r, 1500));
        }
      }
    }

    // All retries failed — log and show user-friendly message
    if (user && lastError) {
      try {
        await supabase.from("failed_humanizations").insert({
          user_id: user.id,
          error_message: lastError.message,
          input_word_count: inputWords,
          input_preview: inputText.slice(0, 200),
        });
      } catch {
        toast.error("Failed to log humanization error to database");
      }
    }
    toast.error(
      "Humanization failed after multiple attempts. Please try again later.",
    );
    setIsProcessing(false);
  };

  const handleCopy = async () => {
    if (!outputText) return;
    await navigator.clipboard.writeText(outputText);
    setCopied(true);
    toast.success("Humanized text copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = async (rating: "up" | "down") => {
    if (!user) return;
    setFeedbackGiven(rating);
    setShowFeedbackInput(true);
    try {
      await supabase.from("user_feedback").insert({
        user_id: user.id,
        history_id: lastHistoryId,
        rating,
      });
    } catch {
      toast.error("Failed to submit feedback");
    }
  };

  const handleFeedbackMessage = async () => {
    if (!user || !feedbackMessage.trim()) return;
    try {
      await supabase.from("user_feedback").insert({
        user_id: user.id,
        history_id: lastHistoryId,
        rating: feedbackGiven || "up",
        message: feedbackMessage.trim(),
      });
    } catch {
      toast.error("Failed to submit feedback message");
    }
    setShowFeedbackInput(false);
    setFeedbackMessage("");
    toast.success("Feedback submitted");
  };

  const readabilityScore = outputText ? fleschKincaid(outputText) : null;
  const uniqueness = outputText
    ? computeUniqueness(inputText, outputText)
    : null;

  return (
    <section id="humanizer" className="section-padding">
      <div className="container-tight px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Paste. Humanize. <span className="gradient-text">Done.</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Simply paste your AI-generated text below, click humanize, and get
            naturally flowing content in seconds.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-1.5"
        >
          <div className="px-4 pt-3">
            <UsageWarningBanner />
          </div>

          {user && (
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
              <span className="text-xs text-muted-foreground">
                Lifetime usage:{" "}
                <span className="font-mono font-medium text-foreground">
                  {wordsUsed.toLocaleString()}
                </span>{" "}
                / {lifetimeLimit.toLocaleString()} words
              </span>
              <span
                className={`text-xs font-mono ${remaining <= 0 ? "text-destructive" : "text-muted-foreground"}`}
              >
                {remaining.toLocaleString()} remaining
              </span>
            </div>
          )}

          {/* Tone Selector */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 overflow-x-auto scrollbar-hide">
            <span className="text-xs text-muted-foreground mr-1 shrink-0">
              Tone:
            </span>
            {toneOptions.map((t) => (
              <button
                key={t.value}
                onClick={() => setTone(t.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 shrink-0 ${
                  tone === t.value
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "bg-[hsl(var(--glass))] text-muted-foreground border border-transparent hover:text-foreground hover:bg-[hsl(var(--glass)/0.8)]"
                }`}
              >
                <span>{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
            {/* Input */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <span className="text-sm font-medium text-muted-foreground">
                  AI Text (Input)
                </span>
                <span
                  className={`text-xs font-mono ${inputWords > remaining ? "text-destructive" : "text-muted-foreground"}`}
                >
                  {inputWords.toLocaleString()} words{" "}
                  {remaining < Infinity
                    ? `(${remaining.toLocaleString()} left)`
                    : ""}
                </span>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your AI-generated content here or upload a file..."
                className="flex-1 min-h-[200px] sm:min-h-[280px] lg:min-h-[380px] p-3 sm:p-4 bg-transparent text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none text-sm leading-relaxed"
              />
              {inputWords > remaining && remaining >= 0 && (
                <div className="flex items-center gap-2 px-4 py-2 text-destructive text-xs">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>
                    Exceeds your remaining words.{" "}
                    <a href="/pricing" className="underline">
                      Upgrade
                    </a>{" "}
                    for more.
                  </span>
                </div>
              )}
              {/* File Upload + Humanize Button row */}
              <div className="flex flex-col sm:flex-row items-stretch gap-2 px-4 py-3 border-t border-border/50">
                <div className="flex-1">
                  <FileUpload onTextExtracted={(text) => setInputText(text)} />
                </div>
                <Button
                  variant="hero"
                  size="lg"
                  onClick={handleHumanize}
                  disabled={isProcessing || inputWords === 0 || usageLoading}
                  className="w-full sm:w-auto sm:min-w-[160px] shrink-0"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Humanize Text
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Output */}
            <div
              className="flex flex-col bg-accent/30 rounded-xl"
              ref={outputRef}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-3 border-b border-border/50 gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Humanized Text (Output)
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {readabilityScore && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-medium">
                      Grade {readabilityScore.grade} · {readabilityScore.label}
                    </span>
                  )}
                  {uniqueness !== null && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">
                      {uniqueness}% unique
                    </span>
                  )}
                  {outputText && (
                    <span className="text-xs font-mono text-muted-foreground">
                      {countWords(outputText).toLocaleString()} words
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-1 min-h-[200px] sm:min-h-[280px] lg:min-h-[380px] max-h-[380px] p-3 sm:p-4 relative overflow-y-auto">
                {isProcessing ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                      <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">
                        Humanizing your content...
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Applying natural language patterns
                      </p>
                    </div>
                  </div>
                ) : outputText ? (
                  <article className="text-sm leading-relaxed text-foreground space-y-4">
                    {outputText.split(/\n\n+/).map((paragraph, i) => (
                      <p key={i}>
                        {paragraph.split(/\n/).map((line, j, arr) => (
                          <span key={j}>
                            {line}
                            {j < arr.length - 1 && <br />}
                          </span>
                        ))}
                      </p>
                    ))}
                  </article>
                ) : (
                  <p className="text-sm text-muted-foreground/40 italic">
                    Your humanized content will appear here...
                  </p>
                )}
              </div>
              {outputText && !isProcessing && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
                  {/* Feedback */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleFeedback("up")}
                      className={`p-1.5 rounded-lg transition-colors ${feedbackGiven === "up" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleFeedback("down")}
                      className={`p-1.5 rounded-lg transition-colors ${feedbackGiven === "down" ? "bg-destructive/20 text-destructive" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={handleHumanize}
                      className="gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Retry
                    </Button>
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={handleCopy}
                      className="gap-2"
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      {copied ? "Copied" : "Copy All"}
                    </Button>
                  </div>
                </div>
              )}
              {/* Feedback message input */}
              <AnimatePresence>
                {showFeedbackInput && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-4 pb-3 overflow-hidden"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={feedbackMessage}
                        onChange={(e) => setFeedbackMessage(e.target.value)}
                        placeholder="Tell us more (optional)..."
                        className="flex-1 text-xs bg-[hsl(var(--glass))] border border-[hsl(var(--glass-border)/0.3)] rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleFeedbackMessage()
                        }
                      />
                      <button
                        onClick={handleFeedbackMessage}
                        className="p-2 rounded-lg bg-primary/15 text-primary hover:bg-primary/25 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Detection Score & Diff View — shown after humanization */}
          {outputText && !isProcessing && (
            <div className="px-4 pb-4">
              <DetectionScore />
              <DiffView original={inputText} humanized={outputText} />
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default HumanizerTool;
