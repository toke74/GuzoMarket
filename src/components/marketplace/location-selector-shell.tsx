import { LocateFixed, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";

type LocationSelectorShellProps = {
  selectedLabel?: string;
};

export function LocationSelectorShell({ selectedLabel = "Washington, DC" }: LocationSelectorShellProps) {
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
        {["Washington, DC", "Silver Spring, MD", "Arlington, VA"].map((label) => (
          <Button key={label} type="button" variant={label === selectedLabel ? "secondary" : "outline"} size="sm">
            {label}
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
