import { LocateFixed, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PublicLocationDTO } from "@/server/marketplace/locations";

type LocationSelectorShellProps = {
  selectedLabel?: string;
  locations?: Pick<PublicLocationDTO, "id" | "label">[];
};

const fallbackLocations = [
  { id: "washington-dc", label: "Washington, DC" },
  { id: "silver-spring-md", label: "Silver Spring, MD" },
  { id: "arlington-va", label: "Arlington, VA" },
];

export function LocationSelectorShell({
  selectedLabel = "Washington, DC",
  locations = fallbackLocations,
}: LocationSelectorShellProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <MapPin className="mt-1 h-5 w-5 text-brand-primary" aria-hidden="true" />
        <div>
          <p className="font-semibold text-text-primary">Marketplace location</p>
          <p className="mt-1 text-sm text-text-secondary">{selectedLabel}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {locations.map((location) => (
          <Button
            key={location.id}
            type="button"
            variant={location.label === selectedLabel ? "secondary" : "outline"}
            size="sm"
          >
            {location.label}
          </Button>
        ))}
        <Button type="button" variant="ghost" size="sm">
          <LocateFixed className="h-4 w-4" aria-hidden="true" />
          Use current location
        </Button>
      </div>
    </div>
  );
}
