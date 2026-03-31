import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import Link from "next/link";

// Dynamic route config — only public, indexable pages
const sitemapSections = [
  {
    title: "Main Pages",
    links: [
      { label: "Home", path: "/" },
      { label: "About Us", path: "/about" },
      { label: "Pricing", path: "/pricing" },
      { label: "Contact", path: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", path: "/blog" },
      { label: "Reviews", path: "/reviews" },
      { label: "Careers", path: "/careers" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", path: "/privacy" },
      { label: "Terms of Service", path: "/terms" },
      { label: "Refund Policy", path: "/refund-policy" },
      { label: "Cookie Policy", path: "/cookies" },
    ],
  },
];

const Sitemap = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-8 pb-16">
        <div className="container-tight px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Sitemap
              </h1>
              <p className="text-muted-foreground">
                A complete overview of all pages on DevAIHumanizer.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {sitemapSections.map((section, i) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="glass-card-premium p-6"
                >
                  <h2 className="text-lg font-display font-semibold text-foreground mb-4">
                    {section.title}
                  </h2>
                  <ul className="space-y-2.5">
                    {section.links.map((link) => (
                      <li key={link.path}>
                        <Link
                          href={link.path}
                          className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2 group"
                        >
                          <span className="w-1 h-1 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" />
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Sitemap;
