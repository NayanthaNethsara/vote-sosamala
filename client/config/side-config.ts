import {
  BookOpenIcon,
  GithubLogoIcon,
  LifebuoyIcon,
  type Icon,
} from "@phosphor-icons/react";

export type SidebarExternalLink = {
  title: string;
  url: string;
  icon: Icon;
};

export const adminSocialLinks: SidebarExternalLink[] = [
  {
    title: "GitHub",
    url: "https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard",
    icon: GithubLogoIcon,
  },
];

export const adminSupportLinks: SidebarExternalLink[] = [
  {
    title: "Support",
    url: "https://sosamala.com/support",
    icon: LifebuoyIcon,
  },
  {
    title: "Privacy Policy",
    url: "https://sosamala.com/privacy-policy",
    icon: BookOpenIcon,
  },
];
