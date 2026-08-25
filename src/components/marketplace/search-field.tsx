import { MapPin, Search } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchFieldProps = ComponentPropsWithoutRef<"form"> & {
  defaultQuery?: string;
  defaultLocation?: string;
};

export function SearchField({ defaultQuery, defaultLocation = "Washington, DC", className, ...props }: SearchFieldProps) {
  return (
    <form className={cn("grid gap-3 rounded-xl border border-border bg-surface p-3 shadow-md md:grid-cols-[1fr_16rem_auto]", className)} {...props}>
      <label className="relative block">
        <span className="sr-only">Search GuzoMarket</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" aria-hidden="true" />
        <Input name="q" defaultValue={defaultQuery} placeholder="What are you looking for?" className="pl-10" />
      </label>
      <label className="relative block">
        <span className="sr-only">Location</span>
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" aria-hidden="true" />
        <Input name="location" defaultValue={defaultLocation} placeholder="Washington, DC" className="pl-10" />
      </label>
      <Button type="submit">Search</Button>
    </form>
  );
}
