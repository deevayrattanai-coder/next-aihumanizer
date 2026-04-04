import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Timer,
  ArrowRight,
  Sparkles,
  BookOpen,
  FileText,
  Brain,
} from "lucide-react";

const tools = [
  {
    title: "Pomodoro Timer",
    description:
      "Stay focused with the Pomodoro Technique. Customizable intervals, task management, break reminders, and session tracking.",
    icon: Timer,
    path: "/study-tools/pomodoro-timer",
    badge: "Popular",
    available: true,
  },
  {
    title: "Study Planner",
    description:
      "Organize your study schedule with an intelligent planner that adapts to your learning pace.",
    icon: BookOpen,
    path: "#",
    badge: "Coming Soon",
    available: false,
  },
  {
    title: "Note Summarizer",
    description:
      "Condense lengthy notes into concise, digestible summaries powered by AI.",
    icon: FileText,
    path: "#",
    badge: "Coming Soon",
    available: false,
  },
  {
    title: "Flashcard Generator",
    description:
      "Create flashcards automatically from your notes and study materials.",
    icon: Brain,
    path: "#",
    badge: "Coming Soon",
    available: false,
  },
];

const StudyToolsPage = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <Navbar />

      <main className="relative z-10">
        <section className="py-16 md:py-24">
          <div className="container-tight px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <Badge variant="secondary" className="mb-4">
                Free Tools
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Study Tools
              </h1>
              <p className="text-lg text-muted-foreground">
                Free productivity and study tools to help you focus, learn, and
                achieve more.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Card
                    key={tool.title}
                    className={`p-6 bg-surface border-border/30 transition-all duration-300 ${
                      tool.available
                        ? "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
                        : "opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <Badge
                        variant={tool.available ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {tool.badge}
                      </Badge>
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                      {tool.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {tool.description}
                    </p>
                    {tool.available ? (
                      <Button
                        asChild
                        variant="default"
                        size="sm"
                        className="w-full"
                      >
                        <Link href={tool.path}>
                          Open Tool <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled
                      >
                        Coming Soon
                      </Button>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 mb-8">
          <div className="container-tight px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              Need to Humanize AI-Generated Text?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Transform AI-generated content into natural, human-sounding text
              that bypasses all AI detectors.
            </p>
            <Button asChild variant="hero" size="lg">
              <Link href="/#humanizer">
                Try AI Humanizer Free <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default StudyToolsPage;
