import BlogPage from "./blog";

export const metadata = {
  title: "AI Writing Tips & SEO Guides | DevAI Humanizer Blog",
  description:
    "Read expert tips on AI writing, SEO, and content marketing. Learn how to humanize AI text and create engaging, high-ranking content.",
  alternates: {
    canonical: "https://devaihumanizer.com/blog",
  },
  openGraph: {
    title: "AI Writing Tips & SEO Guides | DevAI Humanizer Blog",
    description:
      "Read expert tips on AI writing, SEO, and content marketing. Learn how to humanize AI text and create engaging, high-ranking content.",
    url: "https://devaihumanizer.com/blog",
    siteName: "Dev AI Humanizer",
    type: "website",
  },
};

const Blog = () => {
  return <BlogPage />;
};

export default Blog;
