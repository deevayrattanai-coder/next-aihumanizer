"use client";
import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Sparkles, Bot, User, GripVertical } from "lucide-react";

const aiText = `Artificial intelligence has significantly transformed the landscape of modern education. The implementation of AI-powered tools has enabled educators to personalize learning experiences for students. Furthermore, the utilization of machine learning algorithms has facilitated the automation of administrative tasks, thereby allowing teachers to focus more on pedagogical activities. It is important to note that the integration of these technologies requires careful consideration of ethical implications and data privacy concerns.`;

const humanText = `AI has genuinely changed how we think about education today. Teachers now have tools that help them tailor lessons to each student's needs — something that would've been nearly impossible a decade ago. And with routine admin work getting handled automatically, there's finally more room to actually focus on teaching. That said, we can't ignore the real questions around ethics and keeping student data safe. Those conversations matter just as much as the tech itself.`;

const BeforeAfterShowcase = () => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      updatePosition(e.clientX);
    },
    [updatePosition],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      updatePosition(e.clientX);
    },
    [updatePosition],
  );

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
    setSliderPos(50);
  }, []);

  return (
    <section className="section-padding section-glow-divider">
      <div className="container-tight px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            See the <span className="gradient-text">Transformation</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
            Drag the slider to reveal the difference between robotic AI text and
            naturally humanized content.
          </p>
        </motion.div>

        {/* Floating labels */}
        <div className="flex justify-between mb-3 px-1 gap-2">
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
            <Bot className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-destructive shrink-0" />
            <span className="text-[10px] sm:text-xs font-display font-semibold text-destructive truncate">
              AI-Generated
            </span>
            <span className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-full bg-destructive/15 text-destructive font-medium hidden sm:inline">
              Detectable
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
            <span className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-full bg-emerald-400/15 text-emerald-400 font-medium hidden sm:inline">
              100% Human
            </span>
            <span className="text-[10px] sm:text-xs font-display font-semibold text-emerald-400 truncate">
              Humanized
            </span>
            <User className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-emerald-400 shrink-0" />
          </div>
        </div>

        {/* Slider container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          ref={containerRef}
          className="relative glass-panel overflow-hidden rounded-xl select-none touch-none cursor-col-resize"
          style={{ minHeight: 220 }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* AI side (full width, clipped by slider) */}
          <div
            className="absolute inset-0 p-5 md:p-8 bg-destructive/[0.03]"
            style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
          >
            <p className="text-sm md:text-base leading-relaxed text-muted-foreground pr-6">
              {aiText}
            </p>
          </div>

          {/* Human side (full width, clipped by slider) */}
          <div
            className="absolute inset-0 p-5 md:p-8 bg-emerald-500/[0.03]"
            style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
          >
            <p className="text-sm md:text-base leading-relaxed text-foreground pl-6">
              {humanText}
            </p>
          </div>

          {/* Invisible spacer for height */}
          <div className="p-5 md:p-8 invisible" aria-hidden>
            <p className="text-sm md:text-base leading-relaxed">
              {aiText.length > humanText.length ? aiText : humanText}
            </p>
          </div>

          {/* Divider line + handle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-primary/60 z-10 pointer-events-none"
            style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 pointer-events-none">
              <GripVertical className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
        </motion.div>

        {/* Bottom tag */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs md:text-sm font-medium text-primary">
              Drag to compare — same meaning, completely natural tone
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BeforeAfterShowcase;
