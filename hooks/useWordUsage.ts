"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const DEFAULT_LIMIT = 1500;

export interface WordUsage {
  wordsUsed: number;
  lifetimeLimit: number;
  remaining: number;
  plan: string;
  loading: boolean;
  expired: boolean;
  expiresAt: string | null;
  usagePercent: number;
}

export const useWordUsage = () => {
  const { user } = useAuth();
  const [wordsUsed, setWordsUsed] = useState(0);
  const [lifetimeLimit, setLifetimeLimit] = useState(DEFAULT_LIMIT);
  const [plan, setPlan] = useState("free");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true); 

  const isExpired = plan !== "free" && expiresAt ? new Date(expiresAt) <= new Date() : false;

  const fetchUsage = useCallback(async () => {
    if (!user) {
      setTimeout(() => {
        setWordsUsed(0);
        setLifetimeLimit(DEFAULT_LIMIT);
        setPlan("free");
        setExpiresAt(null);
        setLoading(false);
      }, 0);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("user_word_usage")
      .select("words_used, lifetime_limit, plan, expires_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!isMounted.current) return; 

    if (error) {
      toast.error("Failed to fetch word usage");
      setLoading(false);
      return;
    }

    if (data) {
      setWordsUsed(data.words_used ?? 0);
      setLifetimeLimit(data.lifetime_limit ?? DEFAULT_LIMIT);
      setPlan(data.plan ?? "free");
      setExpiresAt(data.expires_at ?? null);
    } else {
      const { error: insertError } = await supabase
        .from("user_word_usage")
        .insert({
          user_id: user.id,
          words_used: 0,
          lifetime_limit: DEFAULT_LIMIT,
          plan: "free",
        });

      if (insertError) {
        toast.error("Failed to initialize word usage");
      }

      setWordsUsed(0);
      setLifetimeLimit(DEFAULT_LIMIT);
      setPlan("free");
      setExpiresAt(null);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    isMounted.current = true;

    // ✅ defer fetchUsage call to avoid synchronous setState in effect body
    const timer = setTimeout(() => {
      fetchUsage();
    }, 0);

    return () => {
      isMounted.current = false;
      clearTimeout(timer);
    };
  }, [fetchUsage]);

  const addUsage = useCallback(
    async (words: number) => {
      if (!user) return;
      const newTotal = wordsUsed + words;
      const { error } = await supabase
        .from("user_word_usage")
        .update({ words_used: newTotal })
        .eq("user_id", user.id);

      if (error) {
        toast.error("Failed to update word usage");
        return;
      }
      setWordsUsed(newTotal);
    },
    [user, wordsUsed],
  );

  const effectiveRemaining = isExpired ? 0 : Math.max(0, lifetimeLimit - wordsUsed);
  const usagePercent = lifetimeLimit > 0 ? Math.min(100, (wordsUsed / lifetimeLimit) * 100) : 0;

  return {
    wordsUsed,
    lifetimeLimit,
    remaining: effectiveRemaining,
    plan,
    loading,
    expired: isExpired,
    expiresAt,
    usagePercent,
    addUsage,
    refetch: fetchUsage,
  };
};