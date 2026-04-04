"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Quote, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import React from "react";

interface TestimonialData {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
}

// Fallback testimonials if DB is empty
const fallbackTestimonials: TestimonialData[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    role: "Content Marketing Manager",
    text: "DevAIHumanizer has completely transformed our content workflow. We produce 3x more articles now, and every single one passes AI detection.",
    rating: 5,
  },
  {
    id: "2",
    name: "James Chen",
    role: "Freelance Writer",
    text: "As a freelance writer, I use AI to draft initial ideas, then DevAIHumanizer to polish them into authentic human prose. My clients can't tell the difference.",
    rating: 5,
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    role: "Digital Agency Owner",
    text: "We tested every humanizer on the market. DevAIHumanizer is the only one that consistently bypasses GPTZero and Turnitin while maintaining quality.",
    rating: 5,
  },
  {
    id: "4",
    name: "Michael Thompson",
    role: "SEO Specialist",
    text: "DevAIHumanizer has been a game-changer for our content strategy. The humanized content performs significantly better in search rankings.",
    rating: 5,
  },
  {
    id: "5",
    name: "Michael Rodriguez",
    role: "Digital Marketer",
    text: "A text about how DevAIHumanizer has helped improve our content quality.",
    rating: 5,
  },
];

const Testimonials = () => {
  const [testimonials, setTestimonials] =
    useState<TestimonialData[]>(fallbackTestimonials);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data } = await supabase
        .from("testimonials")
        .select("id, name, role, text, rating")
        .eq("is_active", true)
        .order("sort_order");
      if (data && data.length > 0) {
        setTestimonials(data);
      }
    };
    fetchTestimonials();
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", skipSnaps: false },
    [
      Autoplay({
        delay: 4000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ],
  );

  return (
    <section className="section-padding bg-surface overflow-hidden section-glow-divider">
      <div className="container-tight px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-4">
            Loved by <span className="gradient-text">Thousands</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
            See what writers, marketers, and content creators say about
            DevAIHumanizer.
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex -ml-4">
            {testimonials.map((t, i) => (
              <div
                key={t.id}
                className="min-w-0 shrink-0 grow-0 basis-full md:basis-1/2 lg:basis-1/3 pl-4"
              >
                <TestimonialCard testimonial={t} index={i} />
              </div>
            ))}
          </div>
        </div>

        {/* Dot indicators */}
        <DotIndicators emblaApi={emblaApi} count={testimonials.length} />

        {/* Show more button → reviews page */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <Link href="/reviews">
            <Button
              variant="outline"
              className="gap-2 border-border/50 text-muted-foreground hover:text-foreground"
            >
              Show more reviews
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

/* Dot indicators component */
const DotIndicators = ({
  emblaApi,
  count,
}: {
  emblaApi: ReturnType<typeof useEmblaCarousel>[1];
  count: number;
}) => {
  const [selected, setSelected] = React.useState(0);

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const dotCount = Math.min(count, 10);

  return (
    <div className="flex justify-center gap-1.5 mt-6">
      {Array.from({ length: dotCount }).map((_, i) => (
        <button
          key={i}
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            i === selected ? "bg-primary w-6" : "bg-muted-foreground/30"
          }`}
          onClick={() => emblaApi?.scrollTo(i)}
          aria-label={`Go to slide ${i + 1}`}
        />
      ))}
    </div>
  );
};

const TestimonialCard = ({
  testimonial: t,
  index,
}: {
  testimonial: TestimonialData;
  index: number;
}) => (
  <div className="glass-panel p-5 md:p-6 rounded-xl group hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 relative h-full">
    <Quote className="absolute top-4 right-4 w-6 h-6 text-primary/10 group-hover:text-primary/20 transition-colors" />
    <div className="flex items-center gap-0.5 mb-3">
      {Array.from({ length: t.rating }).map((_, j) => (
        <Star key={j} className="w-3.5 h-3.5 fill-primary text-primary" />
      ))}
    </div>
    <p className="text-sm leading-relaxed text-foreground/90 mb-4">{t.text}</p>
    <div>
      <p className="font-display font-semibold text-sm text-foreground">
        {t.name}
      </p>
      <p className="text-xs text-muted-foreground">{t.role}</p>
    </div>
  </div>
);

export default Testimonials;
