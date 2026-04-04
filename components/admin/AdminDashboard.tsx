"use client";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  LogOut,
  BarChart3,
  FileText,
  Settings,
  KeyRound,
  Briefcase,
  Users,
  Tag,
  DollarSign,
  X,
  Shield,
  Activity,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  AlertTriangle,
  Megaphone,
  Eye,
  EyeOff,
  Mail,
} from "lucide-react";
import AdminAnalytics from "./AdminAnalytics";
import BlogManager from "./BlogManager";
import JobManager from "./JobManager";
import AdminUserManagement from "./AdminUserManagement";
import AdminRevenue from "./AdminRevenue";
import AdminContentModeration from "./AdminContentModeration";
import AdminSystemHealth from "./AdminSystemHealth";
import AdminFeedback from "./AdminFeedback";
import AdminFailedLogs from "./AdminFailedLogs";
import AdminAnnouncements from "./AdminAnnouncements";
import AdminPricingManager from "./AdminPricingManager";
import AdminContactSubmissions from "./AdminContactSubmissions";

type Tab =
  | "analytics"
  | "blog"
  | "jobs"
  | "users"
  | "revenue"
  | "moderation"
  | "health"
  | "feedback"
  | "failed"
  | "announcements"
  | "pricing"
  | "contacts";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("analytics");
  const [showSettings, setShowSettings] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [changingName, setChangingName] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pwError, setPwError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleChangePassword = async () => {
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setPwError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setConfirmError("Passwords do not match");
      return;
    }

    setPwError("");
    setConfirmError("");

    setChangingPassword(true);
    const { data, error } = await supabase.functions.invoke("admin-password", {
      body: { new_password: newPassword },
    });

    if (error || (data && data.error)) {
      toast.error(data?.error || error?.message || "Failed to change password");
    } else {
      toast.success("Password changed successfully!");
      setNewPassword("");
      setConfirmPassword("");
    }

    setChangingPassword(false);
  };

  const handleChangeName = async () => {
    if (!newDisplayName.trim()) {
      toast.error("Please enter a display name");
      return;
    }
    setChangingName(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      setChangingName(false);
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: newDisplayName.trim() })
      .eq("user_id", user.id);
    if (error) {
      toast.error("Failed to update display name");
    } else {
      toast.success("Display name updated!");
      setNewDisplayName("");
    }
    setChangingName(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tabs: { id: Tab; label: string; icon: any; section?: string }[] = [
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      section: "Overview",
    },
    { id: "users", label: "Users", icon: Users },
    { id: "revenue", label: "Revenue", icon: DollarSign },
    { id: "pricing", label: "Pricing", icon: Tag },
    {
      id: "feedback",
      label: "Feedback",
      icon: MessageSquare,
      section: "Management",
    },
    { id: "moderation", label: "Moderation", icon: Shield },
    { id: "failed", label: "Failed Logs", icon: AlertTriangle },
    { id: "announcements", label: "Announcements", icon: Megaphone },
    { id: "contacts", label: "Contacts", icon: Mail },
    { id: "blog", label: "Blog", icon: FileText, section: "Content" },
    { id: "jobs", label: "Jobs", icon: Briefcase },
    { id: "health", label: "System Health", icon: Activity, section: "System" },
  ];

  const validatePassword = (value: string) => {
    if (!value) return "Password is required";
    if (value.length < 8 || value.length > 20) {
      return "Password must be 8–20 characters.";
    }
    if (!/[A-Z]/.test(value)) {
      return "Must include uppercase letter.";
    }
    if (!/[a-z]/.test(value)) {
      return "Must include lowercase letter.";
    }
    if (!/\d/.test(value)) {
      return "Must include a number.";
    }
    if (!/[^A-Za-z0-9]/.test(value)) {
      return "Must include a special character.";
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`${sidebarCollapsed ? "w-16" : "w-56"} bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))] flex flex-col transition-all duration-300 sticky top-0 h-screen z-50`}
      >
        <div className="px-4 py-5 border-b border-[hsl(var(--sidebar-border))] flex items-center justify-between">
          {!sidebarCollapsed && (
            <h1 className="text-sm font-display font-bold text-[hsl(var(--sidebar-foreground))]">
              Admin Panel
            </h1>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-[hsl(var(--sidebar-foreground)/0.5)] hover:text-[hsl(var(--sidebar-foreground))] transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {tabs.map((tab, i) => {
            const showSection =
              tab.section && (i === 0 || tabs[i - 1]?.section !== tab.section);
            return (
              <div key={tab.id}>
                {showSection && !sidebarCollapsed && (
                  <p className="text-[10px] text-[hsl(var(--sidebar-foreground)/0.4)] uppercase tracking-wider font-medium px-3 pt-4 pb-1.5">
                    {tab.section}
                  </p>
                )}
                {showSection && sidebarCollapsed && i > 0 && (
                  <div className="border-t border-[hsl(var(--sidebar-border))] my-2 mx-2" />
                )}
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-[hsl(var(--sidebar-primary)/0.15)] text-[hsl(var(--sidebar-primary))]"
                      : "text-[hsl(var(--sidebar-foreground)/0.6)] hover:text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))]"
                  }`}
                  title={sidebarCollapsed ? tab.label : undefined}
                >
                  <tab.icon className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>{tab.label}</span>}
                </button>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-[hsl(var(--sidebar-border))] p-2 space-y-0.5">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[hsl(var(--sidebar-foreground)/0.6)] hover:text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] transition-all"
            title={sidebarCollapsed ? "Settings" : undefined}
          >
            <Settings className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Settings</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-all"
            title={sidebarCollapsed ? "Logout" : undefined}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {showSettings && (
            <div className="glass-panel p-6 mb-6 relative">
              <button
                onClick={() => setShowSettings(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <KeyRound className="w-5 h-5 text-primary" />
                    <h2 className="text-base font-display font-bold text-foreground">
                      Change Password
                    </h2>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative mt-1">
                        <Input
                          id="new-password"
                          type={showNewPw ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => {
                            const value = e.target.value;
                            setNewPassword(value);
                            setPwError(validatePassword(value));
                          }}
                          placeholder="Min 6 characters"
                          className="pr-10"
                        />
                        {pwError && (
                          <p className="text-xs text-destructive my-1">
                            {pwError}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowNewPw(!showNewPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showNewPw ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <div className="relative mt-1">
                        <Input
                          id="confirm-password"
                          type={showConfirmPw ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => {
                            const value = e.target.value;
                            setConfirmPassword(value);
                            if (newPassword !== value) {
                              setConfirmError("Passwords do not match");
                            } else {
                              setConfirmError("");
                            }
                          }}
                          className="pr-10"
                        />
                        {confirmError && (
                          <p className="text-xs text-destructive my-1">
                            {confirmError}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowConfirmPw(!showConfirmPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showConfirmPw ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <Button
                      onClick={handleChangePassword}
                      disabled={
                        changingPassword ||
                        !!pwError ||
                        !!confirmError ||
                        !newPassword ||
                        !confirmPassword
                      }
                      size="sm"
                    >
                      {changingPassword ? "Updating…" : "Update Password"}
                    </Button>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-secondary" />
                    <h2 className="text-base font-display font-bold text-foreground">
                      Change Display Name
                    </h2>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="new-name">New Display Name</Label>
                      <Input
                        id="new-name"
                        type="text"
                        value={newDisplayName}
                        onChange={(e) => setNewDisplayName(e.target.value)}
                        placeholder="Enter your name"
                        className="mt-1"
                      />
                    </div>
                    <Button
                      onClick={handleChangeName}
                      disabled={changingName}
                      size="sm"
                    >
                      {changingName ? "Updating…" : "Update Name"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "analytics" && <AdminAnalytics />}
          {activeTab === "users" && <AdminUserManagement />}
          {activeTab === "revenue" && <AdminRevenue />}
          {activeTab === "feedback" && <AdminFeedback />}
          {activeTab === "moderation" && <AdminContentModeration />}
          {activeTab === "failed" && <AdminFailedLogs />}
          {activeTab === "announcements" && <AdminAnnouncements />}
          {activeTab === "pricing" && <AdminPricingManager />}
          {activeTab === "contacts" && <AdminContactSubmissions />}
          {activeTab === "blog" && <BlogManager />}
          {activeTab === "jobs" && <JobManager />}
          {activeTab === "health" && <AdminSystemHealth />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
