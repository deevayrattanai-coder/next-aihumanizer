import StudyToolsPage from "./study-tools";

export const metadata = {
  title: "Free Study Tools for Students | DevAI Humanizer",
  description:
    "Boost productivity with free study tools like timers and writing aids. Designed for students to improve focus, learning, and efficiency.",
  alternates: {
    canonical: "https://devaihumanizer.com/study-tools",
  },
  openGraph: {
    title: "Free Study Tools for Students | DevAI Humanizer",
    description:
      "Boost productivity with free study tools like timers and writing aids. Designed for students to improve focus, learning, and efficiency.",
    url: "https://devaihumanizer.com/study-tools",
    siteName: "Dev AI Humanizer",
    type: "website",
  },
};

const StudyTools = () => {
  return <StudyToolsPage />;
};

export default StudyTools;
