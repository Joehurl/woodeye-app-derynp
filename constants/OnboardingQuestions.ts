export interface OnboardingOption {
  id: string;
  emoji: string;
  label: string;
}

export interface OnboardingQuestion {
  id: string;
  title: string;
  subtitle: string;
  options: OnboardingOption[];
}

export const onboardingQuestions: OnboardingQuestion[] = [
  {
    id: "goal",
    title: "What's your main goal?",
    subtitle: "This helps us personalize your experience",
    options: [
      { id: "identify", emoji: "🪵", label: "Identify wood species" },
      { id: "project", emoji: "🛠️", label: "Find the right wood for a project" },
      { id: "learn", emoji: "📚", label: "Learn about wood properties" },
      { id: "sustainable", emoji: "🌲", label: "Explore sustainable options" },
      { id: "costs", emoji: "💰", label: "Compare wood costs" },
    ],
  },
  {
    id: "source",
    title: "How did you hear about us?",
    subtitle: "We'd love to know what brought you here",
    options: [
      { id: "social", emoji: "📱", label: "Social media" },
      { id: "friend", emoji: "👫", label: "Friend or family" },
      { id: "appstore", emoji: "🏪", label: "App Store" },
      { id: "search", emoji: "🔍", label: "Online search" },
    ],
  },
  {
    id: "identity",
    title: "What best describes you?",
    subtitle: "Help us understand who you are",
    options: [
      { id: "woodworker", emoji: "🪚", label: "Woodworker / Carpenter" },
      { id: "diy", emoji: "🏠", label: "DIY Enthusiast" },
      { id: "furniture", emoji: "🎨", label: "Furniture Maker" },
      { id: "nature", emoji: "🌿", label: "Nature & Forestry" },
      { id: "construction", emoji: "🏗️", label: "Construction Professional" },
    ],
  },
  {
    id: "frequency",
    title: "How often do you plan to use WoodEye?",
    subtitle: "Scan as often as you encounter new wood",
    options: [
      { id: "daily", emoji: "☀️", label: "Daily" },
      { id: "few_times", emoji: "📅", label: "A few times a week" },
      { id: "weekly", emoji: "🗓️", label: "Weekly" },
      { id: "trying", emoji: "👋", label: "Just trying it out" },
    ],
  },
  {
    id: "features",
    title: "What features interest you most?",
    subtitle: "We'll highlight what matters to you",
    options: [
      { id: "identification", emoji: "🔍", label: "Species identification" },
      { id: "suppliers", emoji: "📍", label: "Find local suppliers" },
      { id: "properties", emoji: "📖", label: "Wood properties & data" },
      { id: "history", emoji: "🗂️", label: "Scan history & collection" },
    ],
  },
];
