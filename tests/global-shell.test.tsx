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

    const primaryNavigation = screen.getByRole("navigation", { name: "Primary navigation" });
    expect(primaryNavigation).toBeInTheDocument();
    expect(primaryNavigation).toHaveClass("min-w-0");
    expect(primaryNavigation).toHaveClass("flex-1");
    expect(screen.getByRole("link", { name: "Post Listing" })).toHaveAttribute("href", "/post");
    expect(screen.getByRole("link", { name: "Buy & Sell" })).toHaveAttribute("aria-current", "page");
  });

  it("keeps secondary desktop navigation behind an accessible medium-width More menu", () => {
    render(<HeaderClient />);

    expect(screen.getByRole("button", { name: "Open more navigation" })).toHaveClass("xl:hidden");
    expect(screen.getByRole("link", { name: "Events" })).toHaveClass("hidden");
    expect(screen.getByRole("link", { name: "Events" })).toHaveClass("xl:inline-flex");
    expect(screen.getByRole("link", { name: "Community" })).toHaveClass("hidden");
    expect(screen.getByRole("link", { name: "Community" })).toHaveClass("xl:inline-flex");
  });

  it("keeps guest and authenticated desktop actions available without shrinking", () => {
    const { rerender } = render(<HeaderClient />);

    expect(screen.getByLabelText("Header actions")).toHaveClass("shrink-0");
    expect(screen.getByRole("link", { name: /Messages/i })).toHaveAttribute("href", "/messages");
    expect(screen.getByRole("link", { name: /Saved/i })).toHaveAttribute("href", "/saved");
    expect(screen.getByRole("link", { name: /Log In/i })).toHaveAttribute("href", "/auth/log-in");
    expect(screen.getByRole("link", { name: "Post Listing" })).toHaveAttribute("href", "/post");

    rerender(<HeaderClient displayName="Marta" />);

    expect(screen.getByRole("link", { name: /Account/i })).toHaveAttribute("href", "/account");
    expect(screen.getByRole("link", { name: /Messages/i })).toHaveAttribute("href", "/messages");
    expect(screen.getByRole("link", { name: /Saved/i })).toHaveAttribute("href", "/saved");
    expect(screen.getByRole("link", { name: "Post Listing" })).toHaveAttribute("href", "/post");
  });

  it("keeps mobile and tablet navigation on the menu pattern with post available", () => {
    render(<HeaderClient />);

    expect(screen.getByRole("link", { name: "Search GuzoMarket" })).toHaveAttribute("href", "/search");
    expect(screen.getByRole("button", { name: "Open navigation" })).toHaveClass("h-10");
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
