import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Footer } from "@/components/navigation/footer";
import { HeaderClient } from "@/components/navigation/header-client";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
import { GlobalHeader } from "@/components/navigation/global-header";

vi.mock("@/server/auth/session", () => ({
  getCurrentUser: () => Promise.resolve(null),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/search",
}));

describe("global shell navigation", () => {
  it("renders the global header as a top sticky shell element", async () => {
    render(await GlobalHeader());

    const banner = screen.getByRole("banner");
    expect(banner).toHaveClass("sticky");
    expect(banner).toHaveClass("top-0");
    expect(screen.getByRole("link", { name: "GuzoMarket home" })).toHaveAttribute("href", "/");
  });

  it("renders desktop navigation and primary post action", () => {
    render(<HeaderClient />);

    expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Post Listing" })).toHaveAttribute("href", "/post");
    expect(screen.getByRole("link", { name: "Buy & Sell" })).toHaveAttribute("aria-current", "page");
  });

  it("renders mobile bottom navigation", () => {
    render(<MobileBottomNav />);

    expect(screen.getByRole("navigation", { name: "Mobile bottom navigation" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Post/i })).toHaveAttribute("href", "/post");
  });

  it("renders footer copyright with current year", () => {
    render(<Footer />);

    expect(screen.getByText(new RegExp(`${new Date().getFullYear()} GuzoMarket`))).toBeInTheDocument();
  });
});
