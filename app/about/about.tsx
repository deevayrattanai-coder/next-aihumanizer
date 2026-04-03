"use client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import { motion } from "framer-motion";
import { Target, Heart, Users, Lightbulb } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Mission-Driven",
    description:
      "We believe everyone deserves access to tools that help them communicate authentically, regardless of whether they use AI assistance.",
  },
  {
    icon: Heart,
    title: "Privacy First",
    description:
      "Your content is yours. We never store, share, or use your text for any purpose beyond the immediate humanization process.",
  },
  {
    icon: Users,
    title: "Community Focused",
    description:
      "Built by writers, for writers. We listen to our community of 50,000+ users to continuously improve our humanization engine.",
  },
  {
    icon: Lightbulb,
    title: "Innovation Led",
    description:
      "Our research team constantly pushes the boundaries of NLP to stay ahead of AI detectors and deliver the most natural output possible.",
  },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Navbar />
      <main>
        <section className="section-padding">
          <div className="container-tight px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
                Making AI Content{" "}
                <span className="gradient-text">Human Again</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                DevAIHumanizer was founded with a simple belief: AI is a tool
                for augmenting human creativity, not replacing it. Our mission
                is to bridge the gap between machine-generated efficiency and
                the authentic warmth of human expression.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="section-padding bg-surface section-glow-divider">
          <div className="container-tight px-4">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-display font-bold mb-6">
                  Our Story
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    In 2023, as AI-generated content exploded across the
                    internet, a growing problem emerged: AI detectors were
                    flagging legitimate content, and the gap between AI-written
                    and human-written text was becoming a barrier for millions
                    of content creators, students, and professionals.
                  </p>
                  <p>
                    Our founding team — a group of computational linguists, NLP
                    researchers, and experienced content strategists — set out
                    to solve this problem. We did not want to just spin text or
                    swap synonyms. We wanted to truly understand what makes
                    human writing feel human, and then teach our algorithms to
                    replicate those patterns.
                  </p>
                  <p>
                    After months of research and development, DevAIHumanizer was
                    born. Today, we serve over 50,000 users across 120+
                    countries, processing millions of words every month. Our
                    humanization engine has been refined through continuous
                    feedback and iterative improvement, achieving a 99.8% AI
                    detection bypass rate — the highest in the industry.
                  </p>
                  <p>
                    We are not just building a tool. We are building a future
                    where AI and human creativity work seamlessly together,
                    where the origin of an idea matters more than the tool used
                    to express it.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Founder Section */}
        <section className="section-padding section-glow-divider">
          <div className="container-tight px-4">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-display font-bold mb-8 text-center">
                  Meet the <span className="gradient-text">Leadership</span>
                </h2>
                <div className="space-y-6">
                  <div className="glass-card-premium p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                      <span className="text-4xl font-display font-bold text-primary-foreground">
                        DR
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-display font-bold mb-1">
                        Deevay Rattan Puri
                      </h3>
                      <p className="text-primary font-medium text-sm mb-4">
                        Founder & CEO
                      </p>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Deevay Rattan Puri is the visionary behind
                        DevAIHumanizer. With a deep passion for artificial
                        intelligence and content technology, Deevay founded
                        DevAIHumanizer to bridge the gap between AI efficiency
                        and authentic human expression. Under his leadership,
                        the platform has grown to serve over 50,000 users across
                        120+ countries, processing millions of words every
                        month. Deevay believes that AI should augment human
                        creativity — not replace it — and is committed to
                        building tools that empower writers, students, and
                        professionals worldwide.
                      </p>
                    </div>
                  </div>
                  <div className="glass-card-premium p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center shrink-0">
                      <span className="text-4xl font-display font-bold text-primary-foreground">
                        PP
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-display font-bold mb-1">
                        Pankaj Pal
                      </h3>
                      <p className="text-secondary font-medium text-sm mb-4">
                        Co-Founder & CTO
                      </p>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Pankaj Pal is the technical mastermind powering
                        DevAIHumanizer. As Co-Founder and CTO, Pankaj leads the
                        engineering and research teams, architecting the
                        advanced NLP engine that drives our industry-leading
                        99.8% AI detection bypass rate. With deep expertise in
                        computational linguistics and machine learning, Pankaj
                        ensures the platform remains at the cutting edge —
                        continuously refining humanization algorithms to stay
                        ahead of evolving AI detectors while maintaining the
                        natural quality users expect.
                      </p>
                    </div>
                  </div>
                  <div className="glass-card-premium p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shrink-0">
                      <span className="text-4xl font-display font-bold text-primary-foreground">
                        VG
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-display font-bold mb-1">
                        Vipul Goel
                      </h3>
                      <p
                        className="font-medium text-sm mb-4"
                        style={{ color: "#f97316" }}
                      >
                        Co-Founder & CMO
                      </p>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Vipul Goel drives the marketing vision behind
                        DevAIHumanizer. As CMO, Vipul leads brand strategy,
                        growth initiatives, and user acquisition across 120+
                        countries. With a keen understanding of digital
                        marketing, content strategy, and data-driven campaigns,
                        Vipul ensures DevAIHumanizer reaches the writers,
                        students, and professionals who need it most — building
                        a brand that stands for authenticity in the age of AI.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="section-padding section-glow-divider">
          <div className="container-tight px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Our <span className="gradient-text">Values</span>
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {values.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card-premium p-8"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center mb-4">
                    <v.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-display font-semibold mb-2">
                    {v.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {v.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
