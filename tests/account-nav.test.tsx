import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AccountShell } from "@/features/account/account-shell";

vi.mock("@/features/auth/actions", () => ({
  logOutAction: vi.fn(),
}));

describe("account navigation", () => {
  it("shows a keyboard-accessible Sign Out action in account navigation", () => {
    render(
      <AccountShell active="profile">
        <p>Account content</p>
      </AccountShell>,
    );

    const signOutButtons = screen.getAllByRole("button", { name: "Sign Out" });
    expect(signOutButtons.length).toBeGreaterThanOrEqual(1);
    expect(signOutButtons.every((button) => button.getAttribute("type") === "submit")).toBe(true);
    expect(screen.getAllByRole("navigation", { name: "Account navigation" }).length).toBeGreaterThanOrEqual(1);
  });
});
