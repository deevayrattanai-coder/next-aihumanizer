import CookiePolicyPage from "./cookies";

export const metadata = {
  title: "Cookies Policy | DevAI Humanizer Website Cookies",
  description:
    "Learn how DevAI Humanizer uses cookies to improve user experience, track performance, and enhance website functionality.",
  alternates: {
    canonical: "https://devaihumanizer.com/cookies",
  },
  openGraph: {
    title: "Cookies Policy | DevAI Humanizer Website Cookies",
    description:
      "Learn how DevAI Humanizer uses cookies to improve user experience, track performance, and enhance website functionality.",
    url: "https://devaihumanizer.com/cookies",
    siteName: "Dev AI Humanizer",
    type: "website",
  },
};

const CookiePolicy = () => {
  return <CookiePolicyPage />;
};

export default CookiePolicy;
