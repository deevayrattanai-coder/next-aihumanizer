import { motion } from "framer-motion";
import { ShieldCheck, CheckCircle } from "lucide-react";

const detectors = [
  { name: "Turnitin", logo: "assets/logos/detectors/turnitin.png" },
  { name: "Copyleaks", logo: "assets/logos/detectors/copyleaks.png" },
  { name: "GPTZero", logo: "assets/logos/detectors/gptzero.png" },
  { name: "QuillBot", logo: "assets/logos/detectors/quillbot.png" },
  { name: "ZeroGPT", logo: "assets/logos/detectors/zerogpt.png" },
  { name: "Originality", logo: "assets/logos/detectors/originality.png" },
  { name: "Grammarly", logo: "assets/logos/detectors/grammarly.png" },
  { name: "Sapling", logo: "assets/logos/detectors/sapling.png" },
];

const DetectionScore = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="glass-panel mt-4 overflow-hidden"
    >
      {/* Top: Score + Message */}
      <div className="flex items-center gap-4 p-4 border-b border-border/50">
        {/* Circular score */}
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="3"
            />
            <motion.circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="97.4"
              initial={{ strokeDashoffset: 97.4 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-display font-bold text-primary">
            100%
          </span>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-sm font-display font-semibold text-foreground">
              100% Human Content
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Your humanized text is fully undetectable by all major AI detection
            tools.
          </p>
        </div>
      </div>

      {/* Bottom: Detector badges */}
      <div className="px-4 py-3">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2.5">
          Verified human across all major detectors
        </p>
        <div className="flex flex-wrap gap-2">
          {detectors.map((d, i) => (
            <motion.div
              key={d.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.08, duration: 0.3 }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[hsl(var(--glass))] border border-[hsl(var(--glass-border)/0.3)] group hover:border-primary/30 transition-colors"
            >
              <img
                src={d.logo}
                alt={d.name}
                className="w-4 h-4 rounded-sm object-contain"
              />
              <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {d.name}
              </span>
              <CheckCircle className="w-3 h-3 text-emerald-400" />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default DetectionScore;
