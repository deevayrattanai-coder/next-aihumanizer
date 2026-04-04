import PomodoroTimerPage from "./pomodoroTimer";

export const metadata = {
  title: "Free Pomodoro Timer Online | Boost Focus & Productivity",
  description:
    "Use our free Pomodoro timer to stay focused and productive. Manage study sessions effectively with proven time management techniques.",
  alternates: {
    canonical: "http://devaihumanizer.com/study-tools/pomodoro-timer",
  },
  openGraph: {
    title: "Free Pomodoro Timer Online | Boost Focus & Productivity",
    description:
      "Use our free Pomodoro timer to stay focused and productive. Manage study sessions effectively with proven time management techniques.",
    url: "http://devaihumanizer.com/study-tools/pomodoro-timer",
    siteName: "Dev AI Humanizer",
    type: "website",
  },
};

const PomodoroTimer = () => {
  return <PomodoroTimerPage />;
};

export default PomodoroTimer;
