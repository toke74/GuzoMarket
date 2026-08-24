import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders an accessible button label", () => {
    render(<Button type="button">Post listing</Button>);

    expect(screen.getByRole("button", { name: "Post listing" })).toBeInTheDocument();
  });
});
