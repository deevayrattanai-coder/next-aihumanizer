"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Eye, FileText } from "lucide-react";
import BlogEditor from "./BlogEditor";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  meta_title: string;
  meta_description: string;
  featured_image: string;
  featured_image_alt?: string;
  status: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

const BlogManager = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load posts");
    } else {
      setPosts(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete post");
    } else {
      toast.success("Post deleted");
      fetchPosts();
    }
  };

  if (creating || editingPost) {
    return (
      <BlogEditor
        post={editingPost}
        onSave={() => {
          setEditingPost(null);
          setCreating(false);
          fetchPosts();
        }}
        onCancel={() => {
          setEditingPost(null);
          setCreating(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">
            Blog Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create, edit, and manage blog posts
          </p>
        </div>
        <Button onClick={() => setCreating(true)} size="sm">
          <Plus className="w-4 h-4 mr-1" /> New Post
        </Button>
      </div>

      {loading ? (
        <div className="text-muted-foreground text-center py-12">
          Loading posts…
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No blog posts yet</p>
          <Button onClick={() => setCreating(true)}>
            <Plus className="w-4 h-4 mr-1" /> Create your first post
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="glass-panel p-4 flex items-center justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-foreground truncate">
                    {post.title}
                  </h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      post.status === "published"
                        ? "bg-[hsl(160_60%_50%/0.2)] text-[hsl(160,60%,50%)]"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {post.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  /{post.slug} ·{" "}
                  {new Date(post.updated_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`/blog/${post.slug}`, "_blank")}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingPost(post)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(post.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogManager;
