"use client";
import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Image from "next/image";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapLink from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ArrowLeft,
  Save,
  Send,
  Upload,
  X,
  Image as ImageIcon,
  Quote,
  Code,
  Minus,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import UnderlineExtension from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";

// ─── Types (unchanged from original) ─────────────────────────────────────────
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
  published_at: string | null;
}

interface Props {
  post: BlogPost | null;
  onSave: () => void;
  onCancel: () => void;
}

// ─── SEO Score Helper ─────────────────────────────────────────────────────────
function getSeoScore(data: {
  title: string;
  metaTitle: string;
  metaDesc: string;
  content: string;
  slug: string;
  featuredImage: string;
  featuredImageAlt: string;
  excerpt: string;
}) {
  const checks: { label: string; pass: boolean; tip: string }[] = [
    {
      label: "Title present",
      pass: data.title.trim().length > 0,
      tip: "Add a post title",
    },
    {
      label: "Title length (40–70 chars)",
      pass:
        (data.metaTitle || data.title).length >= 40 &&
        (data.metaTitle || data.title).length <= 70,
      tip: "Keep meta title between 40–70 characters",
    },
    {
      label: "Meta description (120–160 chars)",
      pass: data.metaDesc.length >= 120 && data.metaDesc.length <= 160,
      tip: "Write a 120–160 character meta description",
    },
    {
      label: "Content length (>300 words)",
      pass: data.content.split(/\s+/).filter(Boolean).length > 300,
      tip: "Write at least 300 words for better SEO",
    },
    {
      label: "Slug is set",
      pass: data.slug.trim().length > 0,
      tip: "Set a URL-friendly slug",
    },
    {
      label: "Featured image",
      pass: data.featuredImage.length > 0,
      tip: "Add a featured image",
    },
    {
      label: "Image alt text",
      pass: data.featuredImageAlt.trim().length > 0,
      tip: "Add alt text to featured image",
    },
    {
      label: "Excerpt present",
      pass: data.excerpt.trim().length > 0,
      tip: "Write a short excerpt",
    },
  ];
  const passed = checks.filter((c) => c.pass).length;
  const score = Math.round((passed / checks.length) * 100);
  return { score, checks };
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width="56" height="56" viewBox="0 0 56 56">
      <circle
        cx="28"
        cy="28"
        r={r}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="4"
      />
      <circle
        cx="28"
        cy="28"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 28 28)"
        style={{ transition: "stroke-dasharray 0.4s ease" }}
      />
      <text
        x="28"
        y="33"
        textAnchor="middle"
        fontSize="12"
        fontWeight="600"
        fill={color}
      >
        {score}
      </text>
    </svg>
  );
}

// ─── Toolbar Button ───────────────────────────────────────────────────────────
function ToolbarBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded hover:bg-accent transition-colors ${
        active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const BlogEditor = ({ post, onSave, onCancel }: Props) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [metaTitle, setMetaTitle] = useState(post?.meta_title ?? "");
  const [metaDesc, setMetaDesc] = useState(post?.meta_description ?? "");
  const [featuredImage, setFeaturedImage] = useState(
    post?.featured_image ?? "",
  );
  const [featuredImageAlt, setFeaturedImageAlt] = useState(
    post?.featured_image_alt ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Tiptap editor ──────────────────────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      UnderlineExtension,
      TiptapLink.configure({ openOnClick: false }),
      TiptapImage.configure({ inline: false }),
      Placeholder.configure({
        placeholder: "Write your blog post content here…",
      }),
      CharacterCount,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: post?.content ?? "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none min-h-[420px] px-5 py-4 focus:outline-none",
      },
    },
  });

  const contentText = editor?.getText() ?? "";
  const wordCount = contentText.split(/\s+/).filter(Boolean).length;

  // ── Slug generator ─────────────────────────────────────────────────────────
  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!post) setSlug(generateSlug(val));
  };

  // ── Image upload (unchanged logic) ────────────────────────────────────────
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
    setFeaturedImageAlt("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Insert inline image into editor ───────────────────────────────────────
  const handleInlineImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-inline-${Math.random().toString(36).substring(2)}.${ext}`;
    const { error } = await supabase.storage
      .from("blog-images")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });
    if (error) {
      toast.error("Upload failed: " + error.message);
      return;
    }
    const { data: urlData } = supabase.storage
      .from("blog-images")
      .getPublicUrl(fileName);
    editor.chain().focus().setImage({ src: urlData.publicUrl }).run();
    toast.success("Image inserted!");
  };

  const inlineImageRef = useRef<HTMLInputElement>(null);

  // ── Save (unchanged logic, reads from editor) ──────────────────────────────
  const handleSave = async (status: "draft" | "published") => {
    if (!title.trim() || !slug.trim()) {
      toast.error("Title and slug are required");
      return;
    }
    setSaving(true);
    const htmlContent = editor?.getHTML() ?? "";
    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      content: htmlContent,
      meta_title: metaTitle.trim() || title.trim(),
      meta_description: metaDesc.trim(),
      featured_image: featuredImage.trim(),
      featured_image_alt: featuredImageAlt.trim(),
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

  // ── SEO score ──────────────────────────────────────────────────────────────
  const seo = getSeoScore({
    title,
    metaTitle,
    metaDesc,
    content: contentText,
    slug,
    featuredImage,
    featuredImageAlt,
    excerpt,
  });

  // ── Toolbar link handler ───────────────────────────────────────────────────
  const handleSetLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="border-b border-border px-6 py-3 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-lg z-50">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {wordCount} words
          </span>
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
        {/* ── Main content ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
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

          {/* Slug */}
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

          {/* Rich text editor */}
          <div>
            <Label>Content</Label>
            <div className="mt-1 border border-border rounded-lg overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/40 flex-wrap">
                <ToolbarBtn
                  title="Undo"
                  onClick={() => editor.chain().focus().undo().run()}
                >
                  <Undo className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                  title="Redo"
                  onClick={() => editor.chain().focus().redo().run()}
                >
                  <Redo className="w-4 h-4" />
                </ToolbarBtn>
                <span className="w-px h-5 bg-border mx-1" />
                <ToolbarBtn
                  title="Heading 1"
                  active={editor.isActive("heading", { level: 1 })}
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 1 }).run()
                  }
                >
                  <Heading1 className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                  title="Heading 2"
                  active={editor.isActive("heading", { level: 2 })}
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                  }
                >
                  <Heading2 className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                  title="Heading 3"
                  active={editor.isActive("heading", { level: 3 })}
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 3 }).run()
                  }
                >
                  <Heading3 className="w-4 h-4" />
                </ToolbarBtn>
                <span className="w-px h-5 bg-border mx-1" />
                <ToolbarBtn
                  title="Bold"
                  active={editor.isActive("bold")}
                  onClick={() => editor.chain().focus().toggleBold().run()}
                >
                  <Bold className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                  title="Italic"
                  active={editor.isActive("italic")}
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                  <Italic className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                  title="Underline"
                  active={editor.isActive("underline")}
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                >
                  <UnderlineIcon className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                  title="Inline code"
                  active={editor.isActive("code")}
                  onClick={() => editor.chain().focus().toggleCode().run()}
                >
                  <Code className="w-4 h-4" />
                </ToolbarBtn>
                <span className="w-px h-5 bg-border mx-1" />
                <ToolbarBtn
                  title="Bullet list"
                  active={editor.isActive("bulletList")}
                  onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                  }
                >
                  <List className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                  title="Numbered list"
                  active={editor.isActive("orderedList")}
                  onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                  }
                >
                  <ListOrdered className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                  title="Blockquote"
                  active={editor.isActive("blockquote")}
                  onClick={() =>
                    editor.chain().focus().toggleBlockquote().run()
                  }
                >
                  <Quote className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                  title="Horizontal rule"
                  onClick={() =>
                    editor.chain().focus().setHorizontalRule().run()
                  }
                >
                  <Minus className="w-4 h-4" />
                </ToolbarBtn>
                <span className="w-px h-5 bg-border mx-1" />
                <ToolbarBtn
                  title="Align left"
                  active={editor.isActive({ textAlign: "left" })}
                  onClick={() =>
                    editor.chain().focus().setTextAlign("left").run()
                  }
                >
                  <AlignLeft className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                  title="Align center"
                  active={editor.isActive({ textAlign: "center" })}
                  onClick={() =>
                    editor.chain().focus().setTextAlign("center").run()
                  }
                >
                  <AlignCenter className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                  title="Align right"
                  active={editor.isActive({ textAlign: "right" })}
                  onClick={() =>
                    editor.chain().focus().setTextAlign("right").run()
                  }
                >
                  <AlignRight className="w-4 h-4" />
                </ToolbarBtn>
                <span className="w-px h-5 bg-border mx-1" />
                <ToolbarBtn
                  title="Link"
                  active={editor.isActive("link")}
                  onClick={handleSetLink}
                >
                  <LinkIcon className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                  title="Insert image"
                  onClick={() => inlineImageRef.current?.click()}
                >
                  <ImageIcon className="w-4 h-4" />
                </ToolbarBtn>
                <input
                  ref={inlineImageRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleInlineImageUpload}
                />
              </div>

              {/* Editor area */}
              <EditorContent editor={editor} />

              {/* Footer bar */}
              <div className="flex items-center justify-between px-4 py-1.5 border-t border-border bg-muted/30 text-xs text-muted-foreground">
                <span>
                  {wordCount} words ·{" "}
                  {editor.storage.characterCount?.characters() ?? 0} characters
                </span>
                <span
                  className={
                    wordCount < 300 ? "text-amber-500" : "text-green-500"
                  }
                >
                  {wordCount < 300
                    ? `${300 - wordCount} more words recommended`
                    : "Good length"}
                </span>
              </div>
            </div>
          </div>

          {/* Excerpt */}
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

        {/* ── Sidebar ── */}
        <div className="space-y-5">
          {/* SEO Score */}
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-foreground text-sm uppercase tracking-wide">
                SEO Score
              </h3>
              <ScoreRing score={seo.score} />
            </div>
            <div className="space-y-2">
              {seo.checks.map((c) => (
                <div key={c.label} className="flex items-start gap-2">
                  {c.pass ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p
                      className={`text-xs font-medium ${c.pass ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {c.label}
                    </p>
                    {!c.pass && (
                      <p className="text-xs text-muted-foreground">{c.tip}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SEO Settings */}
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
              <div className="flex justify-between mt-1">
                <p className="text-xs text-muted-foreground">
                  {metaTitle.length}/60 characters
                </p>
                <p
                  className={`text-xs ${metaTitle.length > 60 ? "text-red-500" : metaTitle.length >= 40 ? "text-green-500" : "text-amber-500"}`}
                >
                  {metaTitle.length > 60
                    ? "Too long"
                    : metaTitle.length >= 40
                      ? "Good"
                      : "Too short"}
                </p>
              </div>
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
              <div className="flex justify-between mt-1">
                <p className="text-xs text-muted-foreground">
                  {metaDesc.length}/160 characters
                </p>
                <p
                  className={`text-xs ${metaDesc.length > 160 ? "text-red-500" : metaDesc.length >= 120 ? "text-green-500" : "text-amber-500"}`}
                >
                  {metaDesc.length > 160
                    ? "Too long"
                    : metaDesc.length >= 120
                      ? "Good"
                      : "Too short"}
                </p>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="font-display font-semibold text-foreground text-sm uppercase tracking-wide">
              <ImageIcon className="w-4 h-4 inline mr-1" />
              Featured Image
            </h3>
            {featuredImage ? (
              <div className="relative group">
                <Image
                  src={featuredImage}
                  alt="Featured"
                  className="w-full h-40 object-cover rounded-lg border border-border"
                  width={400}
                  height={200}
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
              <>
                <div>
                  <Label htmlFor="image-alt">Image Alt Text</Label>
                  <Input
                    id="image-alt"
                    value={featuredImageAlt}
                    onChange={(e) => setFeaturedImageAlt(e.target.value)}
                    placeholder="Describe the image for SEO & accessibility"
                    className="mt-1"
                  />
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-muted-foreground">
                      {featuredImageAlt.length}/125 characters · Important for
                      SEO
                    </p>
                  </div>
                </div>
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
              </>
            )}
          </div>

          {/* Search Preview */}
          <div className="glass-panel p-5">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-display font-semibold text-foreground text-sm uppercase tracking-wide">
                Search Preview
              </h3>
              <Info className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div className="bg-background rounded-lg border border-border p-3 space-y-1">
              <p className="text-sm text-blue-500 truncate font-medium">
                {metaTitle || title || "Post Title"}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 truncate">
                devaihumanizer.com/blog/{slug || "your-slug"}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {metaDesc ||
                  excerpt ||
                  "Your meta description will appear here…"}
              </p>
            </div>
            {/* Mobile preview */}
            <p className="text-xs text-muted-foreground mt-3 mb-2">
              Mobile preview
            </p>
            <div className="bg-background rounded-lg border border-border p-3 max-w-[280px] space-y-1">
              <p className="text-xs text-green-600 dark:text-green-400 truncate">
                devaihumanizer.com
              </p>
              <p className="text-sm text-blue-500 font-medium line-clamp-2">
                {metaTitle || title || "Post Title"}
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
