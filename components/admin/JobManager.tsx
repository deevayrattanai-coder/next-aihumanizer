"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, X, ChevronDown, ChevronUp } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  short_description: string;
  full_description: string;
  requirements: string[];
  responsibilities: string[];
  is_active: boolean;
  created_at: string;
}

const emptyJob = {
  title: "",
  department: "",
  location: "Remote",
  type: "Full-time",
  short_description: "",
  full_description: "",
  requirements: [""],
  responsibilities: [""],
  is_active: true,
};

const JobManager = () => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyJob);
  const [saving, setSaving] = useState(false);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from("job_postings")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setJobs(data);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchJobs();
  }, []);

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      requirements: form.requirements.filter((r) => r.trim()),
      responsibilities: form.responsibilities.filter((r) => r.trim()),
    };

    if (editing) {
      const { error } = await supabase
        .from("job_postings")
        .update(payload)
        .eq("id", editing);
      if (error) toast.error(error.message);
      else toast.success("Job updated");
    } else {
      const { error } = await supabase.from("job_postings").insert(payload);
      if (error) toast.error(error.message);
      else toast.success("Job created");
    }
    setSaving(false);
    setEditing(null);
    setCreating(false);
    setForm(emptyJob);
    fetchJobs();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this job posting?")) return;
    await supabase.from("job_postings").delete().eq("id", id);
    toast.success("Job deleted");
    fetchJobs();
  };

  const handleEdit = (job: JobPosting) => {
    setEditing(job.id);
    setCreating(true);
    setForm({
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      short_description: job.short_description,
      full_description: job.full_description,
      requirements: job.requirements.length ? job.requirements : [""],
      responsibilities: job.responsibilities.length
        ? job.responsibilities
        : [""],
      is_active: job.is_active,
    });
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase
      .from("job_postings")
      .update({ is_active: !active })
      .eq("id", id);
    fetchJobs();
  };

  const addListItem = (field: "requirements" | "responsibilities") => {
    setForm((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const updateListItem = (
    field: "requirements" | "responsibilities",
    index: number,
    value: string,
  ) => {
    setForm((prev) => {
      const arr = [...prev[field]];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  };

  const removeListItem = (
    field: "requirements" | "responsibilities",
    index: number,
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  if (loading)
    return <div className="text-muted-foreground text-sm">Loading jobs...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold">Job Postings</h2>
        {!creating && (
          <Button
            size="sm"
            onClick={() => {
              setCreating(true);
              setEditing(null);
              setForm(emptyJob);
            }}
          >
            <Plus className="w-4 h-4 mr-1" /> New Position
          </Button>
        )}
      </div>

      {creating && (
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold">
              {editing ? "Edit Position" : "New Position"}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCreating(false);
                setEditing(null);
                setForm(emptyJob);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Title *</label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g. Senior AI/ML Engineer"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Department
              </label>
              <Input
                value={form.department}
                onChange={(e) =>
                  setForm((p) => ({ ...p, department: e.target.value }))
                }
                placeholder="e.g. Engineering"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Location</label>
              <Input
                value={form.location}
                onChange={(e) =>
                  setForm((p) => ({ ...p, location: e.target.value }))
                }
                placeholder="e.g. Remote"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Type</label>
              <Input
                value={form.type}
                onChange={(e) =>
                  setForm((p) => ({ ...p, type: e.target.value }))
                }
                placeholder="e.g. Full-time"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Short Description
            </label>
            <Textarea
              value={form.short_description}
              onChange={(e) =>
                setForm((p) => ({ ...p, short_description: e.target.value }))
              }
              rows={2}
              placeholder="Brief one-liner for the listing card"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Full Description
            </label>
            <Textarea
              value={form.full_description}
              onChange={(e) =>
                setForm((p) => ({ ...p, full_description: e.target.value }))
              }
              rows={5}
              placeholder="Detailed job description shown on expand"
            />
          </div>

          {/* Responsibilities */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Responsibilities
            </label>
            {form.responsibilities.map((r, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <Input
                  value={r}
                  onChange={(e) =>
                    updateListItem("responsibilities", i, e.target.value)
                  }
                  placeholder={`Responsibility ${i + 1}`}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeListItem("responsibilities", i)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addListItem("responsibilities")}
            >
              <Plus className="w-3 h-3 mr-1" /> Add
            </Button>
          </div>

          {/* Requirements */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Requirements
            </label>
            {form.requirements.map((r, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <Input
                  value={r}
                  onChange={(e) =>
                    updateListItem("requirements", i, e.target.value)
                  }
                  placeholder={`Requirement ${i + 1}`}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeListItem("requirements", i)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addListItem("requirements")}
            >
              <Plus className="w-3 h-3 mr-1" /> Add
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={form.is_active}
              onCheckedChange={(v) => setForm((p) => ({ ...p, is_active: v }))}
            />
            <span className="text-sm">Active (visible on careers page)</span>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving
              ? "Saving..."
              : editing
                ? "Update Position"
                : "Create Position"}
          </Button>
        </div>
      )}

      {/* Job list */}
      <div className="space-y-3">
        {jobs.length === 0 && !creating && (
          <p className="text-muted-foreground text-sm text-center py-8">
            No job postings yet. Create your first one!
          </p>
        )}
        {jobs.map((job) => (
          <div
            key={job.id}
            className="glass-panel p-5 flex items-center justify-between gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-display font-semibold text-foreground truncate">
                  {job.title}
                </h4>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${job.is_active ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}
                >
                  {job.is_active ? "Active" : "Draft"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {job.department} · {job.location} · {job.type}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleActive(job.id, job.is_active)}
                title={job.is_active ? "Deactivate" : "Activate"}
              >
                {job.is_active ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleEdit(job)}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(job.id)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobManager;
