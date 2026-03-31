"use client";
import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AdminContextType {
  isAdmin: boolean;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  loading: true,
});

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      setIsAdmin(!!data && !error);
      setLoading(false);
    };
    check();
  }, [user]);

  return (
    <AdminContext.Provider value={{ isAdmin, loading }}>
      {children}
    </AdminContext.Provider>
  );
};
