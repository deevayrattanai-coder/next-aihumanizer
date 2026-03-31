import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import {
  FileText,
  Cpu,
  User,
  Coins,
  ShieldCheck,
  Scale,
  AlertTriangle,
  Mail,
} from "lucide-react";

const sections = [
  {
    icon: FileText,
    title: "1. Acceptance of Terms",
    content:
      "By accessing or using DevAIHumanizer, you agree to be bound by these Terms of Service. If you do not agree, please do not use our service. We reserve the right to modify these terms at any time, and your continued use constitutes acceptance of any changes. Material changes will be communicated with at least 30 days' advance notice.",
  },
  {
    icon: Cpu,
    title: "2. Service Description",
    content:
      'DevAIHumanizer provides an AI-powered text humanization service that transforms machine-generated content into natural, human-like writing. The service is provided "as is" and we do not guarantee specific results or outcomes from using our humanization technology. We continuously improve our algorithms and the output quality may vary across different types of content.',
  },
  {
    icon: User,
    title: "3. User Accounts",
    content:
      "You must provide accurate and complete information when creating an account. You are responsible for maintaining the security of your account credentials and for all activities that occur under your account. You must be at least 18 years old to use our service. We reserve the right to suspend or terminate accounts that violate these terms without prior notice.",
  },
  {
    icon: Coins,
    title: "4. Usage Limits & Credits",
    content:
      "Free accounts receive a limited word quota. Paid plans offer expanded quotas as described on our Pricing page. Word credits are non-transferable and may expire based on your plan terms. Unused credits do not roll over between billing cycles unless explicitly stated. We reserve the right to modify pricing and credit structures with at least 30 days' notice.",
  },
  {
    icon: ShieldCheck,
    title: "5. Acceptable Use",
    content:
      "You agree not to use our service for any unlawful purpose, to generate content that infringes on intellectual property rights, to attempt to reverse-engineer our humanization algorithms, to abuse or overload our systems, to scrape or bulk-extract data, or to resell access to our service without authorization. Violation of these terms may result in immediate account termination.",
  },
  {
    icon: Scale,
    title: "6. Intellectual Property",
    content:
      "You retain ownership of content you submit and the humanized output. DevAIHumanizer retains all rights to its technology, algorithms, and platform. Our branding, logos, and website content are protected by applicable intellectual property laws. You grant us a limited, temporary license to process your content solely for the purpose of providing the humanization service.",
  },
  {
    icon: AlertTriangle,
    title: "7. Limitation of Liability",
    content:
      "DevAIHumanizer shall not be liable for any indirect, incidental, or consequential damages arising from your use of our service. Our total liability shall not exceed the amount paid by you in the twelve months preceding any claim. We are not responsible for how you use the humanized content or any consequences arising from its submission to third-party platforms or institutions.",
  },
  {
    icon: Coins,
    title: "8. Refund Policy",
    content:
      "All payments made to DevAIHumanizer are final and strictly non-refundable. We do not offer refunds, credits, or exchanges under any circumstances — including dissatisfaction with results, unused credits, accidental purchases, or change of mind. The effectiveness of the tool depends on user input and usage. We recommend testing the free tier before purchasing. For full details, please read our dedicated Refund Policy page.",
  },
  {
    icon: Mail,
    title: "9. Contact",
    content:
      "For questions about these Terms of Service, please contact us through our Contact page or email us at legal@devaihumanizer.com.",
  },
];

const Terms = () => {
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
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Terms of Service
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

export default Terms;
