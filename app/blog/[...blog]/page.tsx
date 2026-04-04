import { supabase } from "@/integrations/supabase/client";
import BlogPostClient from "./BlogPostClient";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const { data: post } = await supabase
    .from("blog_posts")
    .select(
      "title, meta_title, meta_description, excerpt, featured_image, slug, published_at, created_at",
    )
    .eq("slug", params.slug)
    .eq("status", "published")
    .maybeSingle();

  if (!post) {
    return {
      title: "Post Not Found",
      description: "This blog post does not exist.",
    };
  }

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      url: `https://devaihumanizer.com/blog/${post.slug}`,
      type: "article",
      publishedTime: post.published_at || post.created_at,
      images: post.featured_image
        ? [
            {
              url: post.featured_image,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      images: post.featured_image ? [post.featured_image] : [],
    },
    alternates: {
      canonical: `https://devaihumanizer.com/blog/${post.slug}`,
    },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  return <BlogPostClient slug={params.slug} />;
}
