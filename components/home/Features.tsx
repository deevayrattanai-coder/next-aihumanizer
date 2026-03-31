import { motion } from "framer-motion";
import { Shield, Zap, Brain, Globe, Lock, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Bypass AI Detectors",
    description: "Our humanized text passes all major AI detection tools including GPTZero, Turnitin, Originality.ai, and Copyleaks with a 99.8% success rate.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Transform thousands of words in seconds. Our optimized engine processes content instantly so you never have to wait.",
  },
  {
    icon: Brain,
    title: "Context-Aware Rewriting",
    description: "Unlike simple paraphrasers, our AI understands context, tone, and nuance — delivering rewrites that read like they were written by a skilled human author.",
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    description: "Humanize content in over 30 languages. Our models are trained on diverse linguistic datasets to ensure natural output in every supported language.",
  },
  {
    icon: Lock,
    title: "Privacy First",
    description: "Your content is never stored or used for training. All processing happens in real-time, and data is deleted immediately after conversion.",
  },
  {
    icon: BarChart3,
    title: "SEO Optimized Output",
    description: "Our humanizer preserves keyword density and readability scores, ensuring your content remains search-engine friendly after transformation.",
  },
];

const Features = () => {
  return (
    <section className="section-padding section-glow-divider">
      <div className="container-tight px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-4">
            Why Choose <span className="gradient-text">DevAIHumanizer?</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The most advanced AI humanization engine on the market. We don't just paraphrase — we transform your content into genuinely human prose.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card-premium p-6 sm:p-8 group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center mb-5 group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.2)] transition-all duration-500">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-display font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
