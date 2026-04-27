const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const normalizedSiteUrl = rawSiteUrl.endsWith("/")
  ? rawSiteUrl.slice(0, -1)
  : rawSiteUrl;

export const siteConfig = {
  name: "Wasantha Muwadora",
  url: normalizedSiteUrl,
  votingPaused: process.env.NEXT_PUBLIC_VOTE_PAUSE === "true",
  links: {
    leaderboard: "/",
    rules: "/support#rules-guidelines",
    github: "https://github.com/NayanthaNethsara/vote-sosamala",
    instagram: "https://www.instagram.com/nayaa.gg",
    gmail: "mailto:helo@nayantha.me",
    support: "/support",
  },
};
