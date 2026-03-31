import { motion } from "framer-motion";

const institutions = [
  { name: "Harvard University", logo: "/logos/institutions/harvard.png" },
  { name: "Stanford University", logo: "/logos/institutions/stanford.png" },
  { name: "MIT", logo: "/logos/institutions/mit.png" },
  { name: "University of Oxford", logo: "/logos/institutions/oxford.png" },
  { name: "University of Leeds", logo: "/logos/institutions/leeds.png" },
  { name: "IIT Delhi", logo: "/logos/institutions/iitdelhi.png" },
  { name: "University of Oregon", logo: "/logos/institutions/oregon.png" },
  { name: "Columbia University", logo: "/logos/institutions/columbia.png" },
];

const TrustedInstitutions = () => {
  return (
    <section className="py-16 px-4 section-glow-divider">
      <div className="container-tight">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-muted-foreground mb-8 font-medium tracking-wide uppercase"
        >
          Supporting writers at top institutions
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-x-6 sm:gap-x-10 gap-y-4 sm:gap-y-6 max-w-4xl mx-auto"
        >
          {institutions.map((inst, i) => (
            <motion.div
              key={inst.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 * i }}
              className="flex items-center gap-2.5 group"
            >
              <img
                src={inst.logo}
                alt={`${inst.name} logo`}
                className="w-7 h-7 rounded object-contain transition-transform duration-300 group-hover:scale-110"
              />
              <span className="text-muted-foreground/60 font-display font-semibold text-xs sm:text-sm md:text-base tracking-tight whitespace-nowrap group-hover:text-muted-foreground transition-colors duration-300">
                {inst.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TrustedInstitutions;
