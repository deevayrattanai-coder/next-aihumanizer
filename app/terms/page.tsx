import TermsPage from "./terms";

export const metadata = {
  title: "Terms & Conditions | DevAI Humanizer Usage Policy",
  description:
    "Review the terms and conditions of DevAI Humanizer. Learn about user responsibilities, service usage, and platform policies.",
  alternates: {
    canonical: "https://devaihumanizer.com/terms",
  },
  openGraph: {
    title: "Terms & Conditions | DevAI Humanizer Usage Policy",
    description:
      "Review the terms and conditions of DevAI Humanizer. Learn about user responsibilities, service usage, and platform policies.",
    url: "https://devaihumanizer.com/terms",
    siteName: "Dev AI Humanizer",
    type: "website",
  },
};

const Terms = () => {
  return <TermsPage />;
};

export default Terms;
