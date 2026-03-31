"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const CTABanner = () => {
  const { user } = useAuth();
  const router = useRouter();
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login?mode=signup");
    } else {
      const el = document.getElementById("humanizer");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="section-padding">
      <div className="container-tight px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl md:rounded-3xl p-8 sm:p-12 md:p-16 text-center glass-card-premium"
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-secondary/8 to-primary/5" />
          <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.08)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.08)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-[100px]" />

          <div className="relative">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold mb-4 text-balance">
              Ready to Make Your AI Content{" "}
              <span className="gradient-text">Undetectable?</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6 md:mb-8 text-base md:text-lg">
              Join 50,000+ writers who trust DevAIHumanizer to transform their
              content. Start with 2,000 free words today.
            </p>
            <Button
              variant="hero"
              size="xl"
              onClick={handleClick}
              className="gap-2 cursor-pointer"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTABanner;
