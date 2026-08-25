import Link from "next/link";

import { Container } from "@/components/layout/container";

const footerGroups = [
  {
    title: "Explore",
    links: [
      { href: "/search", label: "Buy & Sell" },
      { href: "/cars", label: "Cars" },
      { href: "/housing", label: "Housing" },
      { href: "/jobs", label: "Jobs" },
    ],
  },
  {
    title: "Community",
    links: [
      { href: "/businesses", label: "Businesses" },
      { href: "/events", label: "Events" },
      { href: "/community", label: "Community" },
      { href: "/services", label: "Services" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/auth/sign-up", label: "Sign Up" },
      { href: "/auth/log-in", label: "Log In" },
      { href: "/account", label: "Account" },
      { href: "/post", label: "Post Listing" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/safety", label: "Safety" },
      { href: "/help", label: "Help Center" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface pb-20 md:pb-0">
      <Container className="grid gap-8 py-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <p className="font-display text-xl font-bold text-brand-primary">GuzoMarket</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-text-secondary">
            Buy. Sell. Connect. A local marketplace foundation for the DMV.
          </p>
        </div>
        {footerGroups.map((group) => (
          <div key={group.title}>
            <h2 className="text-sm font-semibold text-text-primary">{group.title}</h2>
            <ul className="mt-3 grid gap-2 text-sm text-text-secondary">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link className="hover:text-brand-primary" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <Container className="border-t border-border py-5 text-sm text-text-secondary">
        <p>&copy; {year} GuzoMarket. All rights reserved.</p>
      </Container>
    </footer>
  );
}
