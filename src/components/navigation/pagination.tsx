import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type PaginationProps = {
  previousHref?: string;
  nextHref?: string;
  label?: string;
};

export function Pagination({ previousHref, nextHref, label = "Pagination" }: PaginationProps) {
  return (
    <nav className="flex items-center justify-between gap-4" aria-label={label}>
      <Button variant="outline" asChild={Boolean(previousHref)} disabled={!previousHref}>
        {previousHref ? (
          <Link href={previousHref}>
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Previous
          </Link>
        ) : (
          <span>
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Previous
          </span>
        )}
      </Button>
      <Button variant="outline" asChild={Boolean(nextHref)} disabled={!nextHref}>
        {nextHref ? (
          <Link href={nextHref}>
            Next
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : (
          <span>
            Next
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </Button>
    </nav>
  );
}
