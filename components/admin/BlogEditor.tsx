"use client";
import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Bold,
  Italic,
  Underline,
  Link,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  ArrowLeft,
  Save,
  Send,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  meta_title: string;
  meta_description: string;
  featured_image: string;
  status: string;
  published_at: string | null;
}

interface Props {
  post: BlogPost | null;
  onSave: () => void;
  onCancel: () => void;
}

const BlogEditor = ({ post, onSave, onCancel }: Props) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [metaTitle, setMetaTitle] = useState(post?.meta_title ?? "");
  const [metaDesc, setMetaDesc] = useState(post?.meta_description ?? "");
  const [featuredImage, setFeaturedImage] = useState(
    post?.featured_image ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!post) {
      setSlug(generateSlug(val));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

    const { error } = await supabase.storage
      .from("blog-images")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

    if (error) {
      toast.error("Upload failed: " + error.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("blog-images")
      .getPublicUrl(fileName);

    setFeaturedImage(urlData.publicUrl);
    toast.success("Image uploaded!");
    setUploading(false);
  };

  const removeImage = () => {
    setFeaturedImage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const insertTag = useCallback(
    (before: string, after: string) => {
      const el = document.getElementById(
        "content-editor",
      ) as HTMLTextAreaElement;
      if (!el) return;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const selected = content.substring(start, end);
      const newContent =
        content.substring(0, start) +
        before +
        selected +
        after +
        content.substring(end);
      setContent(newContent);
      setTimeout(() => {
        el.focus();
        el.selectionStart = start + before.length;
        el.selectionEnd = end + before.length;
      }, 0);
    },
    [content],
  );

  const handleSave = async (status: "draft" | "published") => {
    if (!title.trim() || !slug.trim()) {
      toast.error("Title and slug are required");
      return;
    }

    setSaving(true);
    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      content,
      meta_title: metaTitle.trim() || title.trim(),
      meta_description: metaDesc.trim(),
      featured_image: featuredImage.trim(),
      status,
      ...(status === "published" && !post?.published_at
        ? { published_at: new Date().toISOString() }
        : {}),
      ...(post ? {} : { author_id: user?.id }),
    };

    let error;
    if (post) {
      ({ error } = await supabase
        .from("blog_posts")
        .update(payload)
        .eq("id", post.id));
    } else {
      ({ error } = await supabase.from("blog_posts").insert(payload));
    }

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(
        status === "published" ? "Post published!" : "Draft saved!",
      );
      onSave();
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-3 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-lg z-50">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave("draft")}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-1" /> Save Draft
          </Button>
          <Button
            size="sm"
            onClick={() => handleSave("published")}
            disabled={saving}
          >
            <Send className="w-4 h-4 mr-1" /> Publish
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Your blog post title"
              className="mt-1 text-lg"
            />
          </div>

          <div>
            <Label htmlFor="slug">Slug</Label>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-sm text-muted-foreground">/blog/</span>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="your-post-slug"
              />
            </div>
          </div>

          <div>
            <Label>Content</Label>
            <div className="flex items-center gap-1 mt-1 mb-1 flex-wrap">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertTag("<b>", "</b>")}
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertTag("<i>", "</i>")}
              >
                <Italic className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertTag("<u>", "</u>")}
              >
                <Underline className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertTag("<h2>", "</h2>")}
              >
                <Heading1 className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertTag("<h3>", "</h3>")}
              >
                <Heading2 className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const url = prompt("Enter link URL:");
                  if (url)
                    insertTag(
                      `<a href="${url}" class="text-primary underline">`,
                      "</a>",
                    );
                }}
              >
                <Link className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertTag("<ul>\n<li>", "</li>\n</ul>")}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertTag("<ol>\n<li>", "</li>\n</ol>")}
              >
                <ListOrdered className="w-4 h-4" />
              </Button>
            </div>
            <Textarea
              id="content-editor"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your blog post content here… (HTML supported)"
              className="min-h-[400px] font-mono text-sm"
            />
          </div>

          <div>
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary for blog listing pages"
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        {/* Sidebar - SEO */}
        <div className="space-y-5">
          <div className="glass-panel p-5 space-y-4">
            <h3 className="font-display font-semibold text-foreground text-sm uppercase tracking-wide">
              SEO Settings
            </h3>
            <div>
              <Label htmlFor="meta-title">Meta Title</Label>
              <Input
                id="meta-title"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="SEO title (defaults to post title)"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {metaTitle.length}/60 characters
              </p>
            </div>
            <div>
              <Label htmlFor="meta-desc">Meta Description</Label>
              <Textarea
                id="meta-desc"
                value={metaDesc}
                onChange={(e) => setMetaDesc(e.target.value)}
                placeholder="SEO description for search engines"
                className="mt-1"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {metaDesc.length}/160 characters
              </p>
            </div>
          </div>

          {/* Featured Image Upload */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="font-display font-semibold text-foreground text-sm uppercase tracking-wide">
              <ImageIcon className="w-4 h-4 inline mr-1" />
              Featured Image
            </h3>

            {featuredImage ? (
              <div className="relative group">
                <img
                  src={featuredImage}
                  alt="Featured"
                  className="w-full h-40 object-cover rounded-lg border border-border"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 rounded-full bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload image
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, WebP · Max 5MB
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />

            {featuredImage && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="w-4 h-4 mr-1" />
                {uploading ? "Uploading…" : "Replace Image"}
              </Button>
            )}
          </div>

          {/* Preview card */}
          <div className="glass-panel p-5">
            <h3 className="font-display font-semibold text-foreground text-sm uppercase tracking-wide mb-3">
              Search Preview
            </h3>
            <div className="space-y-1">
              <p className="text-sm text-primary truncate">
                {metaTitle || title || "Post Title"}
              </p>
              <p className="text-xs text-green-400 truncate">
                testhumanizer.lovable.app/blog/{slug || "your-slug"}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {metaDesc ||
                  excerpt ||
                  "Your meta description will appear here…"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
