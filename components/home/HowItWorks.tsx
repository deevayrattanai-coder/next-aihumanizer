import { motion } from "framer-motion";
import { ClipboardPaste, Cpu, FileCheck } from "lucide-react";

const steps = [
  {
    icon: ClipboardPaste,
    title: "Paste Your Text",
    description: "Copy your AI-generated content from ChatGPT, Gemini, Claude, or any AI tool and paste it into our editor.",
  },
  {
    icon: Cpu,
    title: "Click Humanize",
    description: "Our advanced algorithms analyze and restructure your text, adding natural language patterns and human-like variations.",
  },
  {
    icon: FileCheck,
    title: "Get Human Text",
    description: "Receive naturally flowing content that bypasses AI detectors while preserving your original meaning and intent.",
  },
];

const HowItWorks = () => {
  return (
    <section className="section-padding bg-surface section-glow-divider">
      <div className="container-tight px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Transform your AI content in three simple steps. No complicated settings, no learning curve.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative glass-card-premium p-6 sm:p-8 text-center group"
            >
              <div className="absolute top-4 right-4 text-5xl font-display font-bold text-muted/50">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-6 mx-auto group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.2)] transition-all duration-500">
                <step.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
