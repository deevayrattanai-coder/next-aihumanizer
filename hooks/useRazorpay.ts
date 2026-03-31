"use client";
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

interface PaymentOptions {
  amount: number;
  payment_type: "topup" | "subscription";
  plan_key?: string;
  words?: number;
  billing_cycle?: "monthly" | "annual";
  onSuccess?: () => void;
}

export const useRazorpay = () => {
  const router = useRouter();

  const pay = useCallback(async (options: PaymentOptions) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      toast.error("Please log in to make a payment");
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    if (!accessToken) {
      toast.error("Session expired. Please log in again.");
      return;
    }

    if (!window.Razorpay) {
      await new Promise<void>((resolve, reject) => {
        const RAZORPAY_SRC = "https://checkout.razorpay.com/v1/checkout.js";
        const allowedHost = "checkout.razorpay.com";
        try {
          const url = new URL(RAZORPAY_SRC);
          if (url.hostname !== allowedHost) {
            reject(new Error("Untrusted script source"));
            return;
          }
        } catch {
          reject(new Error("Invalid script URL"));
          return;
        }
        const script = document.createElement("script");
        script.src = RAZORPAY_SRC;
        script.crossOrigin = "anonymous";
        script.referrerPolicy = "no-referrer";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Razorpay"));
        document.head.appendChild(script);
      });
    }

    const amountInCents = Math.round(options.amount * 100);

    const { data, error } = await supabase.functions.invoke(
      "razorpay-create-order",
      {
        body: {
          amount: amountInCents,
          currency: "INR",
          payment_type: options.payment_type,
          plan_key: options.plan_key,
          words: options.words || 0,
          billing_cycle: options.billing_cycle,
        },
      }
    );

    if (error || !data?.order_id) {
      toast.error(data?.error || "Failed to create order");
      return;
    }

    // ✅ Fixed: replaced import.meta.env with process.env
    const supabaseFunctionsUrl = process.env.NEXT_PUBLIC_SUPABASE_URL + "/functions/v1";

    const safeKeyId = typeof data.key_id === "string" ? data.key_id.replace(/[<>"'`]/g, "") : "";
    const safeOrderId = typeof data.order_id === "string" ? data.order_id.replace(/[<>"'`]/g, "") : "";
    const safeAmount = typeof data.amount === "number" ? data.amount : 0;
    const safeCurrency = typeof data.currency === "string" ? data.currency.replace(/[^A-Z]/g, "") : "INR";
    const safeEmail = typeof user.email === "string" ? user.email.replace(/[<>"'`]/g, "") : "";

    const rzp = new window.Razorpay({
      key: safeKeyId,
      amount: safeAmount,
      currency: safeCurrency,
      order_id: safeOrderId,
      name: "DevAIHumanizer",
      description:
        options.payment_type === "topup"
          ? "Top-up words"
          : "Subscription plan",
      prefill: { email: safeEmail },

      handler: async (response) => {
        try {
          const orderId = typeof response?.razorpay_order_id === "string" ? response.razorpay_order_id : null;
          const paymentId = typeof response?.razorpay_payment_id === "string" ? response.razorpay_payment_id : null;
          const signature = typeof response?.razorpay_signature === "string" ? response.razorpay_signature : null;

          const safePattern = /^[a-zA-Z0-9_]+$/;
          if (
            !orderId || !paymentId || !signature ||
            !safePattern.test(orderId) ||
            !safePattern.test(paymentId) ||
            !safePattern.test(signature)
          ) {
            toast.error("Invalid payment response. Please contact support.");
            return;
          }

          const verifyRes = await fetch(
            `${supabaseFunctionsUrl}/razorpay-verify-payment`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
                // ✅ Fixed: replaced import.meta.env with process.env
                apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              },
              body: JSON.stringify({
                razorpay_order_id: orderId,
                razorpay_payment_id: paymentId,
                razorpay_signature: signature,
              }),
            }
          );

          if (!verifyRes.ok) {
            toast.error("Payment verification failed");
            return;
          }

          toast.success("Payment successful! Credits updated.");
          options.onSuccess?.();
        } catch (err) {
          toast.error("Payment verification failed. Please contact support.");
        }
      },
      theme: { color: "#6366f1" },
    });

    rzp.on("payment.failed", (response) => {
      const rawDesc = response?.error?.description;
      const safeDesc =
        typeof rawDesc === "string"
          ? rawDesc.replace(/[<>"'`]/g, "").slice(0, 200)
          : "Payment failed. Please try again.";
      toast.error(safeDesc);
    });

    rzp.open();
  }, [router]); // ✅ Fixed: added router to deps

  return { pay };
};