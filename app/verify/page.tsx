"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRouter } from "next/navigation";

const Verify = () => {
  const router = useRouter();
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setStatus("Email verified! Redirecting...");
        setTimeout(() => router.push("/"), 2000);
      } else {
        setStatus("Verification failed or expired.");
      }
    };

    checkUser();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <h2 className="text-xl">{status}</h2>
    </div>
  );
};

export default Verify;
