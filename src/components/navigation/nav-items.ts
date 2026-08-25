import { BriefcaseBusiness, Building2, CalendarDays, Car, Heart, Home, MessageCircle, Search, Store, Users } from "lucide-react";

export const desktopNavItems = [
  { href: "/search", label: "Buy & Sell" },
  { href: "/housing", label: "Housing" },
  { href: "/cars", label: "Cars" },
  { href: "/jobs", label: "Jobs" },
  { href: "/services", label: "Services" },
  { href: "/events", label: "Events" },
  { href: "/businesses", label: "Businesses" },
  { href: "/community", label: "Community" },
];

export const mobileNavItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/post", label: "Post", icon: Store, prominent: true },
  { href: "/saved", label: "Saved", icon: Heart },
  { href: "/account", label: "Account", icon: Users },
];

export const marketplaceShortcutItems = [
  { href: "/cars", label: "Cars", icon: Car },
  { href: "/housing", label: "Housing", icon: Home },
  { href: "/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { href: "/businesses", label: "Businesses", icon: Building2 },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/community", label: "Community", icon: MessageCircle },
];
