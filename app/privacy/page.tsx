import PrivacyPage from "./privacy";

export const metadata = {
  title: "Privacy Policy | DevAI Humanizer Data Protection",
  description:
    "Read the DevAI Humanizer privacy policy to understand how we collect, use, and protect your data securely and transparently.",
  alternates: {
    canonical: "https://devaihumanizer.com/privacy",
  },
  openGraph: {
    title: "Privacy Policy | DevAI Humanizer Data Protection",
    description:
      "Read the DevAI Humanizer privacy policy to understand how we collect, use, and protect your data securely and transparently.",
    url: "https://devaihumanizer.com/privacy",
    siteName: "Dev AI Humanizer",
    type: "website",
  },
};

const Privacy = () => {
  return <PrivacyPage />;
};

export default Privacy;
