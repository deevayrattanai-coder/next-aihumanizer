"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  RefreshCw,
  ArrowUpDown,
  Ban,
  CreditCard,
  Save,
  ShieldOff,
  X,
  Calendar,
  FileText,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";

interface UserRow {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  plan: string;
  words_used: number;
  lifetime_limit: number;
  last_activity: string | null;
  total_runs: number;
  expires_at: string | null;
  is_banned: boolean;
  created_at: string | null;
}

const AdminUserManagement = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<
    "words_used" | "total_runs" | "last_activity"
  >("words_used");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [userHistory, setUserHistory] = useState([]);
  const [userPayments, setUserPayments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const [usageRes, profilesRes, historyRes] = await Promise.all([
      supabase
        .from("user_word_usage")
        .select(
          "user_id, words_used, lifetime_limit, plan, updated_at, expires_at, created_at",
        ),
      supabase.from("profiles").select("user_id, full_name, avatar_url"),
      supabase.from("humanization_history").select("user_id, created_at"),
    ]);

    const usage = usageRes.data ?? [];
    const profiles = profilesRes.data ?? [];
    const history = historyRes.data ?? [];

    const historyMap = new Map<string, { runs: number; last: string | null }>();
    history.forEach((h) => {
      const e = historyMap.get(h.user_id) || { runs: 0, last: null };
      e.runs += 1;
      if (!e.last || h.created_at > e.last) e.last = h.created_at;
      historyMap.set(h.user_id, e);
    });

    const merged: UserRow[] = usage.map((u) => {
      const p = profiles.find((pr) => pr.user_id === u.user_id);
      const h = historyMap.get(u.user_id);
      return {
        user_id: u.user_id,
        full_name: p?.full_name || null,
        avatar_url: p?.avatar_url || null,
        email: null,
        plan: u.plan,
        words_used: u.words_used,
        lifetime_limit: u.lifetime_limit,
        last_activity: h?.last || u.updated_at,
        total_runs: h?.runs || 0,
        expires_at: u.expires_at || null,
        is_banned: u.lifetime_limit === 0 && u.plan === "banned",
        created_at: u.created_at || null,
      };
    });

    setUsers(merged);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, []);

  const openUserDetail = async (user: UserRow) => {
    setSelectedUser(user);
    setDetailLoading(true);
    try {
      const [histRes, payRes] = await Promise.all([
        supabase
          .from("humanization_history")
          .select("id, word_count, is_retry, created_at")
          .eq("user_id", user.user_id)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("payment_orders")
          .select(
            "id, amount, currency, words, status, payment_type, plan_key, created_at",
          )
          .eq("user_id", user.user_id)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);
      setUserHistory(histRes.data ?? []);
      setUserPayments(payRes.data ?? []);
    } catch {}
    setDetailLoading(false);
  };

  const filtered = users
    .filter((u) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        u.full_name?.toLowerCase().includes(q) ||
        u.user_id.includes(q) ||
        u.plan.includes(q)
      );
    })
    .sort((a, b) => {
      let aVal, bVal;
      if (sortBy === "words_used") {
        aVal = a.words_used;
        bVal = b.words_used;
      } else if (sortBy === "total_runs") {
        aVal = a.total_runs;
        bVal = b.total_runs;
      } else {
        aVal = a.last_activity || "";
        bVal = b.last_activity || "";
      }
      if (sortDir === "asc") return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(col);
      setSortDir("desc");
    }
  };

  const saveUser = async () => {
    if (!editingUser) return;
    setSaving(true);
    const { error } = await supabase
      .from("user_word_usage")
      .update({
        plan: editingUser.plan,
        words_used: editingUser.words_used,
        lifetime_limit: editingUser.lifetime_limit,
        expires_at: editingUser.expires_at,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", editingUser.user_id);

    if (error) {
      toast.error(error.message || "Failed to update");
    } else {
      toast.success(
        `Updated ${editingUser.full_name || editingUser.user_id.slice(0, 8)}`,
      );
      setEditingUser(null);
      fetchUsers();
    }
    setSaving(false);
  };

  const banUser = async (user: UserRow) => {
    const isBanned = user.plan === "banned";
    const newPlan = isBanned ? "free" : "banned";
    const newLimit = isBanned ? 1500 : 0;

    const { error } = await supabase
      .from("user_word_usage")
      .update({
        plan: newPlan,
        lifetime_limit: newLimit,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.user_id);

    if (error) {
      toast.error("Failed to update user");
    } else {
      toast.success(isBanned ? "User unbanned" : "User banned");
      fetchUsers();
    }
  };

  const addWords = async (user: UserRow, amount: number) => {
    const newLimit = user.lifetime_limit + amount;
    const { error } = await supabase
      .from("user_word_usage")
      .update({
        lifetime_limit: newLimit,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.user_id);

    if (error) {
      toast.error("Failed to add words");
    } else {
      toast.success(
        `Added ${amount.toLocaleString()} words to ${user.full_name || "user"}`,
      );
      fetchUsers();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  const bannedCount = users.filter((u) => u.plan === "banned").length;
  const paidCount = users.filter(
    (u) => !["free", "banned"].includes(u.plan),
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">
            User Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {users.length} users · {paidCount} paid · {bannedCount} banned
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search users…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-60 h-9 text-xs"
            />
          </div>
          <Button variant="outline" size="sm" onClick={fetchUsers}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Edit Panel */}
      {editingUser && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-display font-bold text-foreground flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              Editing:{" "}
              {editingUser.full_name || editingUser.user_id.slice(0, 12)}
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={saveUser} disabled={saving}>
                <Save className="w-3.5 h-3.5 mr-1" />{" "}
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs">Plan</Label>
              <Input
                value={editingUser.plan}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, plan: e.target.value })
                }
                className="mt-1 h-9 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Word Limit</Label>
              <Input
                type="number"
                value={editingUser.lifetime_limit}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    lifetime_limit: parseInt(e.target.value) || 0,
                  })
                }
                className="mt-1 h-9 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Words Used</Label>
              <Input
                type="number"
                value={editingUser.words_used}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    words_used: parseInt(e.target.value) || 0,
                  })
                }
                className="mt-1 h-9 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Expires At</Label>
              <Input
                type="datetime-local"
                value={
                  editingUser.expires_at
                    ? editingUser.expires_at.slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    expires_at: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : null,
                  })
                }
                className="mt-1 h-9 text-xs"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* User Detail Panel */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-panel p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold text-primary-foreground">
                  {selectedUser.full_name
                    ? selectedUser.full_name[0].toUpperCase()
                    : "?"}
                </div>
                <div>
                  <h3 className="text-sm font-display font-bold text-foreground">
                    {selectedUser.full_name || "Anonymous"}
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {selectedUser.user_id}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedUser(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* User Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
              <div className="p-3 rounded-xl bg-accent/30">
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Plan
                </p>
                <p className="text-sm font-semibold text-foreground mt-1 capitalize">
                  {selectedUser.plan}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-accent/30">
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <CreditCard className="w-3 h-3" /> Words
                </p>
                <p className="text-sm font-semibold text-foreground mt-1">
                  {selectedUser.words_used.toLocaleString()} /{" "}
                  {selectedUser.lifetime_limit.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-accent/30">
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Last Active
                </p>
                <p className="text-sm font-semibold text-foreground mt-1">
                  {selectedUser.last_activity
                    ? format(
                        new Date(selectedUser.last_activity),
                        "MMM d, HH:mm",
                      )
                    : "—"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-accent/30">
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Joined
                </p>
                <p className="text-sm font-semibold text-foreground mt-1">
                  {selectedUser.created_at
                    ? format(new Date(selectedUser.created_at), "MMM d, yyyy")
                    : "—"}
                </p>
              </div>
            </div>

            {selectedUser.expires_at && (
              <div className="mb-5 p-3 rounded-xl bg-accent/30">
                <p className="text-[10px] text-muted-foreground">
                  Plan Expires
                </p>
                <p className="text-sm font-semibold text-foreground mt-1">
                  {format(
                    new Date(selectedUser.expires_at),
                    "MMM d, yyyy h:mm a",
                  )}
                </p>
              </div>
            )}

            {detailLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-4 h-4 text-muted-foreground animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent Humanizations */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                    Recent Humanizations ({userHistory.length})
                  </h4>
                  <div className="max-h-[200px] overflow-y-auto space-y-1">
                    {userHistory.length === 0 ? (
                      <p className="text-xs text-muted-foreground/50 py-4 text-center">
                        No history
                      </p>
                    ) : (
                      userHistory.map((h) => (
                        <div
                          key={h.id}
                          className="flex items-center justify-between px-3 py-2 rounded-lg bg-accent/20 text-xs"
                        >
                          <span className="font-mono text-foreground">
                            {h.word_count} words{" "}
                            {h.is_retry && (
                              <span className="text-primary">(retry)</span>
                            )}
                          </span>
                          <span className="text-muted-foreground">
                            {format(new Date(h.created_at), "MMM d, HH:mm")}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Payment History */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                    Payment History ({userPayments.length})
                  </h4>
                  <div className="max-h-[200px] overflow-y-auto space-y-1">
                    {userPayments.length === 0 ? (
                      <p className="text-xs text-muted-foreground/50 py-4 text-center">
                        No payments
                      </p>
                    ) : (
                      userPayments.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between px-3 py-2 rounded-lg bg-accent/20 text-xs"
                        >
                          <div>
                            <span className="font-mono text-foreground">
                              {p.currency} {(p.amount / 100).toFixed(2)}
                            </span>
                            <span className="text-muted-foreground ml-2">
                              {p.words.toLocaleString()} words
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] ${p.status === "paid" ? "bg-emerald-400/15 text-emerald-400" : "bg-muted text-muted-foreground"}`}
                            >
                              {p.status}
                            </span>
                            <span className="text-muted-foreground">
                              {format(new Date(p.created_at), "MMM d")}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-panel overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Plan
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort("words_used")}
                >
                  <span className="flex items-center justify-end gap-1">
                    Words <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort("total_runs")}
                >
                  <span className="flex items-center justify-end gap-1">
                    Runs <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                  Usage
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort("last_activity")}
                >
                  <span className="flex items-center justify-end gap-1">
                    Last Active <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const usagePct =
                  u.lifetime_limit > 0
                    ? Math.round((u.words_used / u.lifetime_limit) * 100)
                    : 0;
                const isBanned = u.plan === "banned";
                return (
                  <tr
                    key={u.user_id}
                    className={`border-b border-border/30 hover:bg-accent/30 transition-colors cursor-pointer ${isBanned ? "opacity-50" : ""}`}
                    onClick={() => openUserDetail(u)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0 ${isBanned ? "bg-destructive" : "bg-gradient-to-br from-primary to-secondary"}`}
                        >
                          {isBanned ? (
                            <Ban className="w-3.5 h-3.5" />
                          ) : u.full_name ? (
                            u.full_name[0].toUpperCase()
                          ) : (
                            "?"
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-foreground">
                            {u.full_name || "Anonymous"}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {u.user_id.slice(0, 12)}…
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          isBanned
                            ? "bg-destructive/15 text-destructive"
                            : u.plan === "free"
                              ? "bg-muted text-muted-foreground"
                              : "bg-primary/15 text-primary"
                        }`}
                      >
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-mono text-foreground">
                      {u.words_used.toLocaleString()} /{" "}
                      {u.lifetime_limit.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-mono text-foreground">
                      {u.total_runs}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${usagePct > 85 ? "bg-destructive" : "bg-primary"}`}
                            style={{ width: `${Math.min(usagePct, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono w-8">
                          {usagePct}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-[10px] text-muted-foreground">
                      {u.last_activity
                        ? format(new Date(u.last_activity), "MMM d, HH:mm")
                        : "—"}
                    </td>
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 px-2"
                          onClick={() => setEditingUser({ ...u })}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 px-2"
                          onClick={() => addWords(u, 1000)}
                        >
                          +1K
                        </Button>
                        <Button
                          variant={isBanned ? "default" : "destructive"}
                          size="sm"
                          className="text-xs h-7 px-2"
                          onClick={() => banUser(u)}
                        >
                          {isBanned ? (
                            <ShieldOff className="w-3 h-3" />
                          ) : (
                            <Ban className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminUserManagement;
