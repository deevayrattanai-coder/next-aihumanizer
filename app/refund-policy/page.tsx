import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import {
  BanIcon,
  ShieldAlert,
  Info,
  CreditCard,
  AlertTriangle,
  Scale,
  Mail,
  FileText,
} from "lucide-react";

const sections = [
  {
    icon: BanIcon,
    title: "1. No Refund Policy",
    content:
      "All payments made to DevAIHumanizer are final and non-refundable under any circumstances. Once a transaction is completed and payment is received, no refunds, credits, or exchanges will be issued — regardless of the reason, including but not limited to dissatisfaction with results, accidental purchase, unused word credits, change of mind, or failure to use the service within any given time period. By making a payment, you acknowledge and accept this strict no-refund policy.",
  },
  {
    icon: ShieldAlert,
    title: "2. No Guarantee of Results",
    content:
      'DevAIHumanizer is an AI-powered text humanization tool. The effectiveness and quality of the output depend entirely on the nature of the input text, the user\'s expectations, and how the tool is used. We do not guarantee any specific outcome, including but not limited to: a 100% bypass rate on any AI detection platform, specific quality or readability scores, suitability of output for any particular use case, or accuracy of humanized content for academic, professional, or legal purposes. The service is provided strictly on an "as-is" and "as-available" basis.',
  },
  {
    icon: Info,
    title: "3. User Responsibility",
    content:
      "It is the sole responsibility of the user to evaluate the suitability of DevAIHumanizer for their needs before making a purchase. We strongly recommend using the free tier (2,000 words) to test the tool and assess output quality before upgrading to any paid plan. By purchasing a paid plan or word top-up, you confirm that you have tested the service and are satisfied with its capabilities.",
  },
  {
    icon: CreditCard,
    title: "4. Subscription & Credit Policy",
    content:
      "Paid subscriptions are billed according to the selected plan (monthly or annual). Word credits included in your plan are non-transferable, non-exchangeable, and do not roll over to the next billing cycle unless explicitly stated. Top-up word credits are consumed on a first-in, first-out basis and expire according to the terms of your plan. Cancelling a subscription does not entitle you to a refund for the current or any previous billing period. You may cancel future renewals at any time, but the cancellation takes effect at the end of the current billing cycle.",
  },
  {
    icon: AlertTriangle,
    title: "5. Chargebacks & Disputes",
    content:
      "Filing a chargeback or payment dispute with your bank or payment provider without first contacting DevAIHumanizer support constitutes a violation of these terms. In the event of an unauthorized chargeback, we reserve the right to: immediately suspend or permanently terminate your account, pursue recovery of the disputed amount plus any associated fees, report the incident to fraud prevention databases, and take any legal action deemed necessary. If you believe a charge is incorrect, please contact our support team first at support@devaihumanizer.com.",
  },
  {
    icon: Scale,
    title: "6. Exceptions",
    content:
      "In rare cases of verified technical failures on our end — such as a system-wide outage that prevented you from using purchased credits during their validity period — DevAIHumanizer may, at its sole and absolute discretion, offer a credit extension or service credit (not a monetary refund). Any such exception is handled on a case-by-case basis and does not create a precedent for future claims. To request an exception review, contact support@devaihumanizer.com with your account details and a description of the issue.",
  },
  {
    icon: FileText,
    title: "7. Razorpay Payment Terms",
    content:
      "All payments are processed securely through Razorpay, a PCI-DSS compliant payment gateway. By making a payment, you also agree to Razorpay's Terms of Use and Privacy Policy. DevAIHumanizer is not responsible for any payment processing errors, delays, or issues caused by Razorpay or your financial institution. All transaction records are maintained for compliance and dispute resolution purposes.",
  },
  {
    icon: Mail,
    title: "8. Contact Us",
    content:
      "If you have any questions about this Refund Policy or need to report a billing issue, please contact us at support@devaihumanizer.com or through our Contact page. We aim to respond to all billing-related inquiries within 48 hours.",
  },
];

const RefundPolicy = () => {
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
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-destructive/15 to-primary/15 flex items-center justify-center mx-auto mb-5">
                <BanIcon className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Refund Policy
              </h1>
              <p className="text-muted-foreground">
                Last updated: March 6, 2026
              </p>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">
                  All sales are final — No refunds under any circumstances
                </span>
              </div>
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

export default RefundPolicy;
