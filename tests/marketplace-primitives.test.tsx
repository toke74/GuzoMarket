import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ListingCard } from "@/components/marketplace/listing-card";
import { SearchField } from "@/components/marketplace/search-field";

describe("marketplace primitives", () => {
  it("renders labeled search and location controls", () => {
    render(<SearchField defaultQuery="camera" defaultLocation="Arlington, VA" />);

    expect(screen.getByLabelText("Search GuzoMarket")).toHaveValue("camera");
    expect(screen.getByLabelText("Location")).toHaveValue("Arlington, VA");
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
  });

  it("renders listing card content without unsupported save, verification, or rating affordances", () => {
    render(
      <ListingCard
        href="/listings/demo-1"
        title="Demo camera"
        price="$120"
        locationLabel="Washington, DC"
        postedLabel="Posted today"
      />,
    );

    expect(screen.getByRole("link", { name: "Demo camera" })).toHaveAttribute("href", "/listings/demo-1");
    expect(screen.queryByRole("button", { name: "Save Demo camera" })).not.toBeInTheDocument();
    expect(screen.queryByText(/verified/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/rating/i)).not.toBeInTheDocument();
  });
});
