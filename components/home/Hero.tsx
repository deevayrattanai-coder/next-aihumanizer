"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const rotatingPhrases = [
  "Robotic AI Text",
  "ChatGPT Content",
  "Machine-Written Essays",
  "AI-Generated Copy",
  "Bot-Produced Articles",
];

const TYPING_SPEED = 80;
const DELETING_SPEED = 40;
const PAUSE_AFTER_TYPE = 2000;
const PAUSE_AFTER_DELETE = 400;

const Hero = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [displayText, setDisplayText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const currentPhrase = rotatingPhrases[phraseIndex];

    // Clear any previous timeout before scheduling a new one
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!isDeleting) {
      if (displayText.length < currentPhrase.length) {
        // Still typing
        timeoutRef.current = setTimeout(() => {
          setDisplayText(currentPhrase.slice(0, displayText.length + 1));
        }, TYPING_SPEED);
      } else {
        // Done typing — pause then start deleting
        timeoutRef.current = setTimeout(() => {
          setIsDeleting(true);
        }, PAUSE_AFTER_TYPE);
      }
    } else {
      if (displayText.length > 0) {
        // Still deleting
        timeoutRef.current = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, DELETING_SPEED);
      } else {
        // ✅ FIX: All setState calls are inside setTimeout (never synchronous)
        timeoutRef.current = setTimeout(() => {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % rotatingPhrases.length);
        }, PAUSE_AFTER_DELETE);
      }
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [displayText, isDeleting, phraseIndex]);

  const handleStartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login?mode=signup");
    } else {
      const el = document.getElementById("humanizer");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="relative min-h-[85vh] md:min-h-screen flex items-center justify-center overflow-hidden py-16 md:py-0">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-48 md:w-96 h-48 md:h-96 bg-secondary/10 rounded-full blur-[80px] md:blur-[120px] animate-pulse-glow" />
        <div
          className="absolute bottom-1/4 right-1/4 w-48 md:w-96 h-48 md:h-96 bg-primary/10 rounded-full blur-[80px] md:blur-[120px] animate-pulse-glow"
          style={{ animationDelay: "1.5s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-gradient-to-br from-secondary/5 to-primary/5 rounded-full blur-[100px] md:blur-[150px]" />
      </div>

      {/* Grid pattern with fade-out */}
      <div
        className="absolute inset-0 hero-grid-pattern"
        style={{
          maskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 50%, transparent 100%)",
        }}
      />

      <div className="relative container-tight px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Trusted by 50,000+ writers worldwide
            </span>
          </motion.div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-display font-bold leading-[1.15] mb-4 md:mb-6">
            Turn{" "}
            <span className="gradient-text">
              {displayText}
              <span className="inline-block w-[3px] h-[0.85em] bg-primary ml-1 align-middle animate-[blink_1s_step-end_infinite]" />
            </span>
            <br />
            Into <span className="gradient-text">Real Human Writing</span>
          </h1>

          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 md:mb-10 leading-relaxed px-2">
            Our advanced AI humanizer transforms machine-generated content into
            naturally flowing, undetectable human text — preserving meaning
            while adding authentic voice and style.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="hero"
              size="xl"
              onClick={handleStartClick}
              className="flex items-center gap-2 cursor-pointer"
            >
              Start Humanizing Free
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="glass" size="xl" asChild>
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-10 md:mt-16 flex items-center justify-center gap-6 md:gap-8 flex-wrap"
          >
            {[
              { label: "AI Detection Bypass", value: "99.8%" },
              { label: "Words Humanized", value: "50M+" },
              { label: "Active Users", value: "50K+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-display font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
