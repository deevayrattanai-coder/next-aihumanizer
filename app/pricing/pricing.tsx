"use client";
import Navbar from "@/components/layout/Navbar";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Check, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import TopUpSlider from "@/components/TopUpSlider";
import { supabase } from "@/integrations/supabase/client";
import { useRazorpay } from "@/hooks/useRazorpay";

interface PlanData {
  id: string;
  plan_key: string;
  name: string;
  monthly_price: number | null;
  annual_price: number | null;
  original_monthly_price: number | null;
  word_limit: number;
  features: string[];
  description: string;
  cta_text: string;
  is_popular: boolean;
  is_enterprise: boolean;
  sort_order: number;
}

const PricingPage = () => {
  const [mounted, setMounted] = useState(false); // ✅ add mounted state
  const [isAnnual, setIsAnnual] = useState(true);
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [discountLabel, setDiscountLabel] = useState("SAVE 25%");
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const { pay } = useRazorpay();
  const router = useRouter();

  // ✅ set mounted after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchPricing = async () => {
      const [plansRes, settingsRes] = await Promise.all([
        supabase.from("pricing_plans").select("*").order("sort_order"),
        supabase
          .from("site_settings")
          .select("*")
          .eq("key", "annual_discount_label"),
      ]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setPlans((plansRes.data as any[]) ?? []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const label = (settingsRes.data as any[])?.[0]?.value;
      if (label) setDiscountLabel(label);
      setLoading(false);
    };
    fetchPricing();
  }, []);

  // ✅ don't render anything until mounted to avoid hydration mismatch
  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background" suppressHydrationWarning>
      <AnnouncementBar />
      <Navbar />
      <main>
        <section className="section-padding">
          <div className="container-tight px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Everything You Need to{" "}
                <span className="gradient-text">Write Better</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Choose the plan that fits your needs. Start free with 1,500
                words, upgrade anytime.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-center gap-4 mb-12"
            >
              <span
                className={`text-sm font-medium transition-colors ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}
              >
                Monthly
              </span>
              <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
              <span
                className={`text-sm font-medium transition-colors ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}
              >
                Annual
              </span>
              {isAnnual && (
                <span className="ml-1 px-2.5 py-0.5 bg-primary/20 text-primary text-xs font-bold rounded-full">
                  {discountLabel}
                </span>
              )}
            </motion.div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-6 h-6 text-muted-foreground animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
                {plans.map((plan, i) => {
                  const monthlyPrice = plan.monthly_price;
                  const annualPrice = plan.annual_price;
                  const displayPrice = isAnnual ? annualPrice : monthlyPrice;
                  const calculatedPrice = isAnnual
                    ? annualPrice * 12
                    : monthlyPrice;
                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`relative flex flex-col p-6 rounded-2xl ${plan.is_popular ? "glow-border glass-card-premium" : "glass-card-premium"}`}
                    >
                      {plan.is_popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full whitespace-nowrap">
                          MOST POPULAR
                        </div>
                      )}
                      <div className="mb-5">
                        <h3 className="text-lg font-display font-semibold mb-1">
                          {plan.name}
                        </h3>
                        {displayPrice != null ? (
                          <div className="flex items-baseline gap-2 mb-1">
                            {displayPrice && (
                              <span className="text-muted-foreground text-sm line-through">
                                ${plan.original_monthly_price!.toFixed(2)}
                              </span>
                            )}
                            <span className="text-4xl font-display font-bold">
                              ${displayPrice.toFixed(2)}
                            </span>
                            <span className="text-muted-foreground text-sm">
                              /month
                            </span>
                          </div>
                        ) : (
                          <div className="mb-1">
                            <span className="text-2xl font-display font-bold">
                              Custom Pricing
                            </span>
                          </div>
                        )}
                        {isAnnual && displayPrice != null && (
                          <p className="text-xs text-muted-foreground">
                            Billed annually
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-2">
                          {plan.description}
                        </p>
                      </div>
                      <Button
                        variant={plan.is_popular ? "hero" : "glass"}
                        size="lg"
                        className="w-full mb-6"
                        disabled={processingPlan === plan.id}
                        onClick={async () => {
                          if (processingPlan) return;
                          if (plan.is_enterprise) {
                            router.push("/contact");
                            return;
                          }
                          if (displayPrice == null) {
                            router.push("/contact");
                            return;
                          }
                          if (displayPrice === 0) {
                            router.push("/login?mode=signup");
                            return;
                          }
                          try {
                            setProcessingPlan(plan.id);
                            await pay({
                              amount: calculatedPrice,
                              payment_type: "subscription",
                              plan_key: plan.plan_key,
                              billing_cycle: isAnnual ? "annual" : "monthly",
                              onSuccess: () => router.push("/dashboard"),
                            });
                          } finally {
                            setProcessingPlan(null);
                          }
                        }}
                      >
                        {processingPlan === plan.id
                          ? "Processing..."
                          : plan.cta_text}
                      </Button>
                      <div className="border-t border-border pt-5">
                        <ul className="space-y-3 flex-1">
                          {plan.features.map((f) => (
                            <li
                              key={f}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
            <TopUpSlider />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PricingPage;
