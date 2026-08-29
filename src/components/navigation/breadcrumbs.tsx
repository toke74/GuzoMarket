import { ChevronRight } from "lucide-react";
import Link from "next/link";

type BreadcrumbItem = {
  href?: string;
  label: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
        {items.map((item, index) => {
          const current = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-2">
              {index > 0 ? <ChevronRight className="h-4 w-4" aria-hidden="true" /> : null}
              {item.href && !current ? (
                <Link href={item.href} className="min-w-0 break-words hover:text-brand-primary">
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={current ? "page" : undefined}
                  className={current ? "min-w-0 break-words text-text-primary" : "min-w-0 break-words"}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
