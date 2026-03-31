"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation"; // ✅ replaced useLocation
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User, Clock, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SiteSearch from "@/components/SiteSearch";
import logoIcon from "@/assets/logo-icon.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Pricing", path: "/pricing" },
  { label: "Blog", path: "/blog" },
  { label: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname(); // ✅ replaced location
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<{
    full_name: string | null;
    avatar_url: string | null;
  } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) setProfile(data);
    };

    fetchProfile();
  }, [user]);

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) return user.email[0].toUpperCase();
    return "U";
  };

  const displayName =
    profile?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 border-b border-border/50">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
      <div className="relative container-tight flex items-center justify-between h-16 px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={logoIcon}
            alt="DevAiHumanizer"
            className="h-8 w-8 object-contain"
          />
          <span className="font-display font-bold text-lg tracking-tight">
            <span className="text-secondary">Dev</span>
            <span className="text-primary">AIHumanizer</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path} // ✅ changed to= to href=
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.path // ✅ replaced location.pathname
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-1">
          <SiteSearch />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-accent transition-colors group">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-primary-foreground">
                      {getInitials()}
                    </div>
                  )}
                  <ChevronDown className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-foreground">
                    {displayName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard" // ✅ changed to= to href=
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-4 h-4" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/history" // ✅ changed to= to href=
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Clock className="w-4 h-4" /> History
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/profile" // ✅ changed to= to href=
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-4 h-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={signOut}
                  className="flex items-center gap-2 cursor-pointer text-destructive"
                >
                  <LogOut className="w-4 h-4" /> Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <Link href="/login?mode=signup">Get Started Free</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex lg:hidden items-center gap-1">
          <SiteSearch />
          <button
            className="text-foreground p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path} // ✅ changed to= to href=
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.path // ✅ replaced location.pathname
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 flex flex-col gap-2">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-2">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-primary-foreground">
                          {getInitials()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {displayName}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      <User className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link
                      href="/history"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      <Clock className="w-4 h-4" /> History
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        signOut();
                        setMobileOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Log Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" asChild>
                      <Link href="/login" onClick={() => setMobileOpen(false)}>
                        Log In
                      </Link>
                    </Button>
                    <Button variant="hero" asChild>
                      <Link
                        href="/login?mode=signup"
                        onClick={() => setMobileOpen(false)}
                      >
                        Get Started Free
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
