"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/SEOHead";

const NotFound = () => {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="404 — Page Not Found | DevAIHumanizer"
        description="The page you're looking for doesn't exist."
      />
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-lg"
        >
          <div className="relative mb-8">
            <span className="text-[8rem] sm:text-[10rem] font-display font-bold leading-none gradient-text select-none">
              404
            </span>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-bold mb-3">
            Page Not Found
          </h1>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            The page{" "}
            <span className="font-mono text-sm text-foreground/70">
              {pathname}
            </span>{" "}
            doesn&apos;t exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button variant="hero" size="lg" asChild>
              <Link href="/">
                <Home className="w-4 h-4 mr-2" /> Back to Home
              </Link>
            </Button>
            <Button variant="glass" size="lg" asChild>
              <Link href="/contact">
                <Search className="w-4 h-4 mr-2" /> Contact Support
              </Link>
            </Button>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
