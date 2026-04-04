import AboutPage from "./about";

export const metadata = {
  title: "About DevAI Humanizer",
  description:
    "Learn how DevAI Humanizer transforms AI content into human-like text. Discover our mission, technology, and commitment to quality writing.",
  alternates: {
    canonical: "https://devaihumanizer.com/about",
  },
  openGraph: {
    title: "About DevAI Humanizer",
    description:
      "Learn how DevAI Humanizer transforms AI content into human-like text. Discover our mission, technology, and commitment to quality writing.",
    url: "https://devaihumanizer.com/about",
    siteName: "Dev AI Humanizer",
    type: "website",
  },
};

const About = () => {
  return <AboutPage />;
};

export default About;
