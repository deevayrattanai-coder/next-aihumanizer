"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Zap, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRazorpay } from "@/hooks/useRazorpay";

const TopUpSlider = () => {
  const { pay } = useRazorpay();
  const [pricePerWord, setPricePerWord] = useState(0.0017565);
  const [isPaying, setIsPaying] = useState(false);
  const [minWords, setMinWords] = useState(2500);
  const [maxWords, setMaxWords] = useState(25000);
  const [step, setStep] = useState(500);
  const [words, setWords] = useState(2500);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value");
      const settings = data ?? [];
      const get = (k: string) => settings.find((s) => s.key === k)?.value;
      if (get("topup_price_per_word"))
        setPricePerWord(parseFloat(get("topup_price_per_word")));
      if (get("topup_min_words")) {
        const v = parseInt(get("topup_min_words"));
        setMinWords(v);
        setWords(v);
      }
      if (get("topup_max_words")) setMaxWords(parseInt(get("topup_max_words")));
      if (get("topup_step")) setStep(parseInt(get("topup_step")));
    };
    fetchSettings();
  }, []);

  const cost = (words * pricePerWord).toFixed(2);

  const handlePayment = async () => {
    if (isPaying) return;

    setIsPaying(true);

    try {
      await pay({
        amount: parseFloat(cost),
        payment_type: "topup",
        words,
        onSuccess: () => window.location.reload(),
      });
    } catch (error) {
      throw new Error("Payment failed");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <motion.div
      id="topup"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="max-w-2xl mx-auto mt-16"
    >
      <div className="glass-panel p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary)/0.15)] flex items-center justify-center">
            <Plus className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold">Top Up Words</h3>
            <p className="text-xs text-muted-foreground">
              Need more words? Add credits instantly at ${pricePerWord}/word.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Words</span>
              <span className="text-2xl font-display font-bold text-foreground">
                {words.toLocaleString()}
              </span>
            </div>
            <Slider
              value={[words]}
              onValueChange={([v]) => setWords(v)}
              min={minWords}
              max={maxWords}
              step={step}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{minWords.toLocaleString()}</span>
              <span>{maxWords.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-accent/50 border border-border/50">
            <div>
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="text-3xl font-display font-bold text-foreground">
                ${cost}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                One-time payment · No subscription required
              </p>
            </div>
            <Button
              variant="hero"
              size="lg"
              className="gap-2"
              onClick={handlePayment}
              disabled={isPaying}
            >
              <Zap className="w-4 h-4" />
              Buy Now
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Top-up credits are added to your current balance and follow the same
            expiry as your active plan.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default TopUpSlider;
