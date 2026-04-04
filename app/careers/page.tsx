import CareersPage from "./careers";

export const metadata = {
  title: "Careers at DevAI Humanizer | Join Our Team",
  description:
    "Explore career opportunities at DevAI Humanizer. Join our team and work on innovative AI tools for content and writing solutions.",
  alternates: {
    canonical: "https://devaihumanizer.com/careers",
  },
  openGraph: {
    title: "Careers at DevAI Humanizer | Join Our Team",
    description:
      "Explore career opportunities at DevAI Humanizer. Join our team and work on innovative AI tools for content and writing solutions.",
    url: "https://devaihumanizer.com/careers",
    siteName: "Dev AI Humanizer",
    type: "website",
  },
};

const Careers = () => {
  return (
    <>
      <CareersPage />
    </>
  );
};

export default Careers;
