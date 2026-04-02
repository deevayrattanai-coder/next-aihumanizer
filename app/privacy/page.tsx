"use client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import {
  Shield,
  Eye,
  Lock,
  Share2,
  Cookie,
  UserCheck,
  RefreshCw,
  Mail,
} from "lucide-react";

const sections = [
  {
    icon: Eye,
    title: "1. Information We Collect",
    content:
      "We collect information you provide directly, such as your name, email address, and account credentials when you register. We also collect usage data including text submitted for humanization (processed in real-time and not permanently stored), word usage statistics, and general interaction patterns with our platform. We automatically collect device information, browser type, IP address (anonymized), and referral URLs for analytics and security purposes.",
  },
  {
    icon: Shield,
    title: "2. How We Use Your Information",
    content:
      "Your information is used to provide and improve our AI humanization service, manage your account and word usage quotas, communicate important updates about our service, and ensure the security and integrity of our platform. We analyze aggregated usage patterns to improve our humanization algorithms and user experience. We never use your submitted content for model training purposes.",
  },
  {
    icon: Lock,
    title: "3. Data Security",
    content:
      "We implement industry-standard security measures to protect your personal information. All data transmission is encrypted using TLS 1.3 protocols. Your submitted text is processed in real-time and we do not retain copies of your original or humanized content beyond your personal history log. Our infrastructure is hosted on enterprise-grade cloud platforms with SOC 2 compliance, regular security audits, and automated threat detection.",
  },
  {
    icon: Share2,
    title: "4. Data Sharing",
    content:
      "We do not sell, trade, or rent your personal information to third parties. We may share anonymized, aggregated data for analytical purposes. We may disclose information when required by law or to protect our rights and the safety of our users. Our third-party service providers (payment processors, analytics) are bound by strict data processing agreements.",
  },
  {
    icon: Cookie,
    title: "5. Cookies & Tracking",
    content:
      "We use essential cookies for authentication and session management. Analytics cookies help us understand how users interact with our platform. You can manage cookie preferences through your browser settings. For detailed information, please see our Cookie Policy. We do not use cookies for cross-site tracking or advertising purposes.",
  },
  {
    icon: UserCheck,
    title: "6. Your Rights",
    content:
      "You have the right to access, correct, or delete your personal data at any time. You may request a copy of all data we hold about you. You can opt out of non-essential communications. Under GDPR, CCPA, and other applicable privacy laws, you have rights including data portability, restriction of processing, and the right to object. To exercise these rights, please contact us through our Contact page.",
  },
  {
    icon: RefreshCw,
    title: "7. Changes to This Policy",
    content:
      'We may update this Privacy Policy periodically. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. Continued use of our service after changes constitutes acceptance of the revised policy. We will provide 30 days\' notice for significant changes.',
  },
  {
    icon: Mail,
    title: "8. Contact Us",
    content:
      "If you have any questions about this Privacy Policy, please reach out to us via our Contact page or email us at privacy@devaihumanizer.com. We aim to respond to all privacy-related inquiries within 48 hours.",
  },
];

const Privacy = () => {
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
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Privacy Policy
              </h1>
              <p className="text-muted-foreground">
                Last updated: March 3, 2026
              </p>
            </div>

            <div className="space-y-6">
              {sections.map((section, i) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
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

export default Privacy;
