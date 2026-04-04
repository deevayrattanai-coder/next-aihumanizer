import RefundPolicyPage from "./RefundPolicy";

export const metadata = {
  title: "Refund Policy | DevAI Humanizer Billing & Refunds",
  description:
    "Understand DevAI Humanizer’s refund policy, billing terms, and eligibility criteria for refunds on subscriptions and services.",
  alternates: {
    canonical: "https://devaihumanizer.com/refund-policy",
  },
  openGraph: {
    title: "Refund Policy | DevAI Humanizer Billing & Refunds",
    description:
      "Understand DevAI Humanizer’s refund policy, billing terms, and eligibility criteria for refunds on subscriptions and services.",
    url: "https://devaihumanizer.com/refund-policy",
    siteName: "Dev AI Humanizer",
    type: "website",
  },
};

const RefundPolicy = () => {
  return <RefundPolicyPage />;
};

export default RefundPolicy;
