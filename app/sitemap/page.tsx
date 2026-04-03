import SitemapPage from "./sitemap";

export const metadata = {
  title: "Sitemap | DevAI Humanizer Website Structure",
  description:
    "Explore the complete sitemap of DevAI Humanizer. Easily navigate all pages, tools, and resources available on our website.",
  alternates: {
    canonical: "https://devaihumanizer.com/sitemap",
  },
};

const Sitemap = () => {
  return <SitemapPage />;
};

export default Sitemap;
