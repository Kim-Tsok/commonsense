export const categories = [
  "All info",
  "Get help",
  "Health & wellbeing",
  "Everyday life",
  "Money & online safety",
  "What's happening",
] as const;
export type Category = (typeof categories)[number];
export type Information = {
  id: string;
  category: Exclude<Category, "All info">;
  title: string;
  summary: string;
  body: string;
  level: 1 | 2 | 3 | 4;
  keywords: string[];
};

// Interface fixtures only. Review levels illustrate the UI, not verified claims.
export const information: Information[] = [
  {
    id: "emergency-contacts",
    category: "Get help",
    title: "Emergency numbers and support lines",
    summary:
      "Find the service you need, the areas it covers, and how to contact it.",
    body: "This directory will list the service, its confirmed contact number, the areas it covers, and when the number was last checked. No live emergency numbers have been published in this prototype.",
    level: 4,
    keywords: [
      "hotline",
      "police",
      "ambulance",
      "fire",
      "emergency",
      "numbers",
    ],
  },
  {
    id: "infant-feeding",
    category: "Health & wellbeing",
    title: "Infant feeding and care",
    summary: "Everyday questions about feeding, water, and caring for a baby.",
    body: "This is a placeholder for a medically reviewed guide, including questions about infant feeding and water. Health guidance will need suitable clinical sources and qualified review before publication.",
    level: 4,
    keywords: ["baby", "babies", "water", "feeding", "children"],
  },
  {
    id: "suspicious-messages",
    category: "Money & online safety",
    title: "Checking a suspicious message",
    summary:
      "A quick guide to checking unexpected messages before sharing money or personal details.",
    body: "The full guide will explain how to find an organisation’s official contact independently, check a message, and report suspected fraud. This sample has not gone through editorial review.",
    level: 3,
    keywords: ["scam", "fraud", "bank", "otp", "password", "phishing"],
  },
  {
    id: "lost-documents",
    category: "Everyday life",
    title: "Replacing a lost ID or passport",
    summary:
      "Find the right starting point for replacing an ID, passport, or other important document.",
    body: "This guide will separate documents by the organisation that issues them. Requirements, official links, fees, and location-specific steps must be confirmed before publication.",
    level: 3,
    keywords: ["nin", "passport", "id", "lost", "documents"],
  },
  {
    id: "public-announcements",
    category: "What's happening",
    title: "Public announcements, explained",
    summary:
      "What changed, who it affects, and what you actually need to do about it.",
    body: "There are no live news updates in this prototype. A published explainer will link to the original announcement and clearly show its publication date, affected locations, and any unresolved details.",
    level: 2,
    keywords: ["news", "government", "announcement", "policy", "changes"],
  },
  {
    id: "consumer-complaints",
    category: "Get help",
    title: "Where to make a service complaint",
    summary:
      "A starting point for making a complaint and finding the organisation that can help.",
    body: "This directory will organise complaint channels by the type of service. Each entry will explain what to prepare, who to contact, and how to follow up, using confirmed official sources.",
    level: 2,
    keywords: ["complaint", "consumer", "electricity", "telecom", "refund"],
  },
];

export const reviewLevels = [
  "Submitted with a source",
  "Source checked",
  "Authoritative sources checked",
  "Full editorial review",
];
