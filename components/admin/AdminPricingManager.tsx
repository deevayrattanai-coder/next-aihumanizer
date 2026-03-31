"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { DollarSign, Save, RefreshCw, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface PlanRow {
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
  is_active: boolean;
}

interface SettingRow {
  key: string;
  value: string;
  label: string;
}

const AdminPricingManager = () => {
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [settings, setSettings] = useState<SettingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [plansRes, settingsRes] = await Promise.all([
      supabase.from("pricing_plans").select("*").order("sort_order"),
      supabase.from("site_settings").select("*"),
    ]);
    setPlans(plansRes.data ?? []);
    setSettings(settingsRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updatePlan = (id: string, field: keyof PlanRow, value) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  };

  const addFeature = (planId: string) => {
    setPlans((prev) =>
      prev.map((p) =>
        p.id === planId ? { ...p, features: [...p.features, ""] } : p,
      ),
    );
  };

  const updateFeature = (planId: string, index: number, value: string) => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id !== planId) return p;
        const features = [...p.features];
        features[index] = value;
        return { ...p, features };
      }),
    );
  };

  const removeFeature = (planId: string, index: number) => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id !== planId) return p;
        const features = p.features.filter((_, i) => i !== index);
        return { ...p, features };
      }),
    );
  };

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s)),
    );
  };

  const savePlans = async () => {
    setSaving(true);
    try {
      for (const plan of plans) {
        // Filter out empty features
        const cleanFeatures = plan.features.filter((f) => f.trim() !== "");
        const { error } = await supabase
          .from("pricing_plans")
          .update({
            name: plan.name,
            monthly_price: plan.monthly_price,
            annual_price: plan.annual_price,
            original_monthly_price: plan.original_monthly_price,
            word_limit: plan.word_limit,
            features: cleanFeatures,
            description: plan.description,
            cta_text: plan.cta_text,
            is_popular: plan.is_popular,
            is_enterprise: plan.is_enterprise,
            sort_order: plan.sort_order,
            is_active: plan.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq("id", plan.id);
        if (error) throw error;
      }

      for (const setting of settings) {
        const { error } = await supabase
          .from("site_settings")
          .update({
            value: setting.value,
            updated_at: new Date().toISOString(),
          })
          .eq("key", setting.key);
        if (error) throw error;
      }

      toast.success("Pricing updated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to save");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">
            Pricing Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Edit plans, prices, and top-up settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reload
          </Button>
          <Button size="sm" onClick={savePlans} disabled={saving}>
            <Save className="w-3.5 h-3.5 mr-1" />{" "}
            {saving ? "Saving…" : "Save All"}
          </Button>
        </div>
      </div>

      {/* Global Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6"
      >
        <h3 className="text-sm font-display font-bold text-foreground mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" /> Global Settings
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {settings.map((s) => (
            <div key={s.key}>
              <Label className="text-xs">{s.label || s.key}</Label>
              <Input
                value={s.value}
                onChange={(e) => updateSetting(s.key, e.target.value)}
                className="mt-1 h-9 text-xs"
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Plans */}
      {plans.map((plan, idx) => (
        <motion.div
          key={plan.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="glass-panel p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-display font-bold text-foreground">
              {plan.name}{" "}
              <span className="text-muted-foreground font-normal">
                ({plan.plan_key})
              </span>
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label className="text-xs">Popular</Label>
                <Switch
                  checked={plan.is_popular}
                  onCheckedChange={(v) => updatePlan(plan.id, "is_popular", v)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs">Active</Label>
                <Switch
                  checked={plan.is_active}
                  onCheckedChange={(v) => updatePlan(plan.id, "is_active", v)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
            <div>
              <Label className="text-xs">Name</Label>
              <Input
                value={plan.name}
                onChange={(e) => updatePlan(plan.id, "name", e.target.value)}
                className="mt-1 h-9 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Monthly Price ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={plan.monthly_price ?? ""}
                onChange={(e) =>
                  updatePlan(
                    plan.id,
                    "monthly_price",
                    e.target.value ? parseFloat(e.target.value) : null,
                  )
                }
                className="mt-1 h-9 text-xs"
                placeholder="null = custom"
              />
            </div>
            <div>
              <Label className="text-xs">Annual Price ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={plan.annual_price ?? ""}
                onChange={(e) =>
                  updatePlan(
                    plan.id,
                    "annual_price",
                    e.target.value ? parseFloat(e.target.value) : null,
                  )
                }
                className="mt-1 h-9 text-xs"
                placeholder="null = custom"
              />
            </div>
            <div>
              <Label className="text-xs">Word Limit</Label>
              <Input
                type="number"
                value={plan.word_limit}
                onChange={(e) =>
                  updatePlan(
                    plan.id,
                    "word_limit",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="mt-1 h-9 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">CTA Text</Label>
              <Input
                value={plan.cta_text}
                onChange={(e) =>
                  updatePlan(plan.id, "cta_text", e.target.value)
                }
                className="mt-1 h-9 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Sort Order</Label>
              <Input
                type="number"
                value={plan.sort_order}
                onChange={(e) =>
                  updatePlan(
                    plan.id,
                    "sort_order",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="mt-1 h-9 text-xs"
              />
            </div>
          </div>

          <div className="mb-4">
            <Label className="text-xs">Description</Label>
            <Input
              value={plan.description}
              onChange={(e) =>
                updatePlan(plan.id, "description", e.target.value)
              }
              className="mt-1 h-9 text-xs"
            />
          </div>

          {/* Features - individual items with + button */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs">Features</Label>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => addFeature(plan.id)}
              >
                <Plus className="w-3 h-3 mr-1" /> Add Feature
              </Button>
            </div>
            <div className="space-y-2">
              {plan.features.map((feature, fi) => (
                <div key={fi} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-5 shrink-0">
                    {fi + 1}.
                  </span>
                  <Input
                    value={feature}
                    onChange={(e) => updateFeature(plan.id, fi, e.target.value)}
                    className="h-8 text-xs flex-1"
                    placeholder="Enter feature text..."
                  />
                  <button
                    onClick={() => removeFeature(plan.id, fi)}
                    className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {plan.features.length === 0 && (
                <p className="text-xs text-muted-foreground italic py-2">
                  No features added. Click Add Feature to start.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AdminPricingManager;
