"use client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Cookie, Shield, Settings, Globe, Mail } from "lucide-react";

const cookieTypes = [
  {
    name: "Essential Cookies",
    description:
      "Required for authentication, session management, and core functionality. These cannot be disabled as they are necessary for the website to function properly.",
    examples: "Session tokens, CSRF protection, authentication state",
    required: true,
  },
  {
    name: "Preference Cookies",
    description:
      "Remember your settings such as theme preference (dark/light mode), language selections, and display preferences for a more personalized experience.",
    examples: "Theme selection, layout preferences, language settings",
    required: false,
  },
  {
    name: "Analytics Cookies",
    description:
      "Help us understand how visitors interact with our website, which pages are most popular, and how to improve our service. All analytics data is anonymized.",
    examples: "Page visit counts, session duration, navigation patterns",
    required: false,
  },
];

const sections = [
  {
    icon: Settings,
    title: "Managing Cookies",
    content:
      "Most web browsers allow you to control cookies through their settings. You can set your browser to refuse cookies or alert you when cookies are being sent. Note that disabling essential cookies may affect the functionality of our service. You can also clear existing cookies from your browser at any time. Each browser has different methods for managing cookies — check your browser's help documentation for specific instructions.",
  },
  {
    icon: Globe,
    title: "Third-Party Cookies",
    content:
      "We may use third-party services that set their own cookies, such as analytics providers. These third parties have their own privacy and cookie policies which govern their use of cookies. We carefully vet our third-party partners to ensure they meet our privacy standards. We do not allow third-party advertising cookies on our platform.",
  },
  {
    icon: Mail,
    title: "Contact Us",
    content:
      "If you have questions about our use of cookies, please reach out through our Contact page. We are committed to transparency about our data practices and will be happy to provide additional information about how we use cookies.",
  },
];

const CookiePolicyPage = () => {
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
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center mx-auto mb-5">
                <Cookie className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Cookie Policy
              </h1>
              <p className="text-muted-foreground">
                Last updated: March 3, 2026
              </p>
            </div>

            {/* What are cookies */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card-premium p-6 md:p-8 mb-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-semibold text-foreground mb-3">
                    What Are Cookies?
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Cookies are small text files stored on your device when you
                    visit a website. They help the website remember your
                    preferences, keep you logged in, and understand how you
                    interact with the site. Cookies are widely used across the
                    internet and are essential for modern web functionality.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Cookie types */}
            <div className="space-y-4 mb-6">
              <h2 className="text-xl font-display font-semibold text-foreground px-2">
                Cookies We Use
              </h2>
              {cookieTypes.map((cookie, i) => (
                <motion.div
                  key={cookie.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  className="glass-card-premium p-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display font-semibold text-foreground">
                      {cookie.name}
                    </h3>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${cookie.required ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}
                    >
                      {cookie.required ? "Required" : "Optional"}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-2">
                    {cookie.description}
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    <span className="font-medium">Examples:</span>{" "}
                    {cookie.examples}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Other sections */}
            <div className="space-y-6">
              {sections.map((section, i) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="glass-card-premium p-6 md:p-8"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <section.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-display font-semibold text-foreground mb-3">
                        {section.title}
                      </h2>
                      <p className="text-muted-foreground leading-relaxed text-sm">
                        {section.content}
                      </p>
                    </div>
                  </div>
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

export default CookiePolicyPage;
