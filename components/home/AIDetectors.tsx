import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

const detectors = [
  { name: "Turnitin", logo: "/logos/detectors/turnitin.png" },
  { name: "Copyleaks", logo: "/logos/detectors/copyleaks.png" },
  { name: "ZeroGPT", logo: "/logos/detectors/zerogpt.png" },
  { name: "QuillBot", logo: "/logos/detectors/quillbot.png" },
  { name: "Grammarly", logo: "/logos/detectors/grammarly.png" },
  { name: "GPTZero", logo: "/logos/detectors/gptzero.png" },
  { name: "Originality.ai", logo: "/logos/detectors/originality.png" },
  { name: "Sapling", logo: "/logos/detectors/sapling.png" },
];

const AIDetectors = () => {
  return (
    <section className="py-16 px-4 section-glow-divider">
      <div className="container-tight">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold mb-2">
            Bypass All Major <span className="gradient-text">AI Content Detectors</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Our humanization engine is built to pass every leading detection tool with a 99.8% success rate.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap justify-center gap-3 sm:gap-4 max-w-3xl mx-auto"
        >
          {detectors.map((detector, i) => (
            <motion.div
              key={detector.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 * i }}
              className="glass-card-premium px-3 sm:px-5 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium text-foreground"
            >
              <img
                src={detector.logo}
                alt={`${detector.name} logo`}
                className="w-6 h-6 rounded object-contain"
              />
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              {detector.name}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AIDetectors;
