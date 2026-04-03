"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  MapPin,
  Clock,
  ArrowRight,
  ChevronDown,
  Rocket,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  short_description: string;
  full_description: string;
  requirements: string[];
  responsibilities: string[];
}

const perks = [
  {
    icon: Rocket,
    title: "Fully Remote",
    desc: "Work from anywhere in the world — your home, a café in Lisbon, or a beach in Bali. We believe great talent isn't bound by geography. Our team spans 15+ countries and we've built a culture that thrives on async collaboration and trust.",
  },
  {
    icon: DollarSign,
    title: "Competitive Pay",
    desc: "We offer top-of-market compensation packages with equity options for full-time positions. We benchmark our salaries against leading tech companies to ensure you're fairly rewarded. Annual reviews and performance bonuses keep your growth on track.",
  },
  {
    icon: TrendingUp,
    title: "Growth Culture",
    desc: "Every team member gets a dedicated learning budget for courses, conferences, and certifications. We run internal tech talks, pair programming sessions, and mentorship programs. Your career path is shaped by your ambitions, not rigid hierarchies.",
  },
];

const CareersPage = () => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data } = await supabase
        .from("job_postings")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (data) setJobs(data);
      setLoading(false);
    };
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Navbar />
      <main className="pt-8 pb-16">
        <div className="container-tight px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Join the <span className="gradient-text">Future of AI</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              We are building the most advanced AI humanization platform in the
              world. Join our remote-first team and help shape the future of
              human-AI collaboration.
            </p>
          </motion.div>

          {/* Perks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20"
          >
            {perks.map((perk, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.1 }}
                className="glass-card-premium p-8 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center mx-auto mb-4">
                  <perk.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-display font-semibold text-foreground mb-3">
                  {perk.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {perk.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Open Positions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-display font-bold mb-8 text-center">
              Open Positions
            </h2>

            {loading ? (
              <p className="text-muted-foreground text-center py-8">
                Loading positions...
              </p>
            ) : jobs.length === 0 ? (
              <div className="glass-panel p-10 text-center">
                <p className="text-muted-foreground">
                  No open positions right now. Check back soon or send us your
                  resume!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((pos, i) => (
                  <motion.div
                    key={pos.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="glass-card-premium overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedJob(expandedJob === pos.id ? null : pos.id)
                      }
                      className="w-full p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left"
                    >
                      <div className="flex-1">
                        <h3 className="text-lg font-display font-semibold text-foreground mb-1">
                          {pos.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-3">
                          {pos.short_description}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5" />
                            {pos.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {pos.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {pos.type}
                          </span>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-muted-foreground transition-transform duration-300 shrink-0 ${expandedJob === pos.id ? "rotate-180" : ""}`}
                      />
                    </button>

                    <AnimatePresence>
                      {expandedJob === pos.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 pt-2 border-t border-border/30 space-y-5">
                            {pos.full_description && (
                              <div>
                                <h4 className="font-display font-semibold text-foreground mb-2">
                                  About the Role
                                </h4>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                  {pos.full_description}
                                </p>
                              </div>
                            )}
                            {pos.responsibilities?.length > 0 &&
                              pos.responsibilities[0] && (
                                <div>
                                  <h4 className="font-display font-semibold text-foreground mb-2">
                                    Responsibilities
                                  </h4>
                                  <ul className="space-y-1.5">
                                    {pos.responsibilities.map((r, j) => (
                                      <li
                                        key={j}
                                        className="flex items-start gap-2 text-sm text-muted-foreground"
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                        {r}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            {pos.requirements?.length > 0 &&
                              pos.requirements[0] && (
                                <div>
                                  <h4 className="font-display font-semibold text-foreground mb-2">
                                    Requirements
                                  </h4>
                                  <ul className="space-y-1.5">
                                    {pos.requirements.map((r, j) => (
                                      <li
                                        key={j}
                                        className="flex items-start gap-2 text-sm text-muted-foreground"
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 shrink-0" />
                                        {r}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            <Button variant="hero" size="sm" asChild>
                              <Link
                                href={`/contact?type=job&role=${encodeURIComponent(pos.title)}`}
                                className="gap-2"
                              >
                                Apply Now <ArrowRight className="w-4 h-4" />
                              </Link>
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-16 glass-card-premium p-10"
          >
            <h3 className="text-xl font-display font-semibold mb-2">
              Do not see a match?
            </h3>
            <p className="text-muted-foreground mb-6">
              We are always looking for exceptional people. Send us your resume
              and tell us how you would contribute.
            </p>
            <Button variant="hero" asChild>
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CareersPage;
