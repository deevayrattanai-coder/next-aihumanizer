"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ArrowLeft, Calendar, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import DOMPurify from "dompurify";

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
  created_at: string;
}

const BlogPostClient = ({ slug }: { slug: string }) => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  console.log("Fetched post:", post, slug);
  useEffect(() => {
    const fetchPost = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (data) setPost(data);
      setLoading(false);
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="animate-pulse text-muted-foreground">Loading…</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="text-center py-32">
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            Post Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            This blog post does not exist or has not been published yet.
          </p>
          <Link href="/blog" className="text-primary hover:underline">
            ← Back to Blog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }
  console.log("Fetched post:", post);
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </motion.div>

        {/* Featured Image */}
        {post.featured_image && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 rounded-2xl overflow-hidden"
          >
            <Image
              src={post.featured_image}
              alt={post.featured_image_alt || post.title}
              className="w-full aspect-video object-cover"
              width={800}
              height={450}
            />
          </motion.div>
        )}

        {/* Title & Date */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground leading-tight mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {new Date(post.published_at || post.created_at).toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              },
            )}
          </div>
        </motion.div>

        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="prose prose-invert prose-orange max-w-none
            prose-headings:font-display prose-headings:text-foreground prose-headings:mt-10 prose-headings:mb-4
            prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:border-b prose-h2:border-border prose-h2:pb-3
            prose-h3:text-xl md:prose-h3:text-2xl
            prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:text-base md:prose-p:text-lg prose-p:mb-5
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-strong:text-foreground
            prose-li:text-muted-foreground prose-li:text-base md:prose-li:text-lg prose-li:leading-relaxed
            prose-ul:my-6 prose-ol:my-6
            prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-blockquote:italic"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
        />

        {/* Divider */}
        <div className="my-12 md:my-16 border-t border-border" />

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center"
        >
          <div className="glass-panel p-8 md:p-12 rounded-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
            <div className="relative z-10">
              <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
                Ready to Humanize Your AI Content?
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-6 text-base md:text-lg">
                Transform your AI-generated text into natural, undetectable
                human writing in seconds. Try Dev AI Humanizer for free today.
              </p>
              <Link href="/">
                <Button size="lg" className="text-base px-8 py-6 font-semibold">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Humanizing Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </article>

      <Footer />
    </div>
  );
};

export default BlogPostClient;
