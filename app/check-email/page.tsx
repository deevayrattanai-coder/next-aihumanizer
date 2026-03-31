"use client";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MailCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CheckEmail = () => {
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [otp, setOtp] = useState("");

  const verifyOtp = async () => {
    if (!email || !otp) {
      toast({
        title: "Missing info",
        description: "Enter email and OTP",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "signup",
      });

      if (error) throw error;

      toast({
        title: "Verified",
        description: "Your account is verified successfully.",
      });

      // ✅ redirect after success
      window.location.href = "/";
    } catch (error) {
      toast({
        title: "Invalid OTP",
        description: error.message || "Verification failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resend = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) throw error;

      toast({
        title: "Email sent",
        description: "Verification email has been resent.",
      });

      // ⏳ cooldown (30 sec)
      setCooldown(30);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend email.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-lg border border-border rounded-2xl p-8 shadow-xl text-center">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <MailCheck className="w-10 h-10 text-primary" />
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-semibold mb-2">Check your email</h2>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-6">
          We’ve sent you a verification link. Please verify your account before
          logging in.
        </p>

        {/* Input */}
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4"
        />

        <Input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="mb-4"
        />

        <Button
          onClick={verifyOtp}
          disabled={isLoading}
          className="w-full mb-3"
        >
          Verify OTP
        </Button>

        {/* Button */}
        <Button
          onClick={resend}
          disabled={isLoading || cooldown > 0}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Sending...
            </>
          ) : cooldown > 0 ? (
            `Resend in ${cooldown}s`
          ) : (
            "Resend Email"
          )}
        </Button>

        {/* Footer hint */}
        <p className="text-xs text-muted-foreground mt-4">
          Didn’t receive the email? Check spam folder.
        </p>
      </div>
    </div>
  );
};

export default CheckEmail;
