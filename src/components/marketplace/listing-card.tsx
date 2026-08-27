import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";

type ListingCardProps = {
  href: string;
  title: string;
  price: string;
  locationLabel: string;
  postedLabel: string;
  imageSrc?: string;
  imageAlt?: string;
  featured?: boolean;
};

export function ListingCard({
  href,
  title,
  price,
  locationLabel,
  postedLabel,
  imageSrc,
  imageAlt,
  featured = false,
}: ListingCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-md border border-border bg-surface shadow-sm transition hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md">
      <div className="relative aspect-[4/3] bg-surface-muted">
        {imageSrc ? (
          <Image src={imageSrc} alt={imageAlt ?? title} fill className="object-cover transition duration-300 group-hover:scale-[1.03]" sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 88vw" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-text-secondary">No image</div>
        )}
        {featured ? <Badge variant="accent" className="absolute left-3 top-3">Featured</Badge> : null}
      </div>
      <div className="grid gap-1.5 p-3">
        <p className="text-lg font-extrabold text-brand-primary">{price}</p>
        <h2 className="line-clamp-2 min-h-11 text-[0.95rem] font-semibold leading-snug text-text-primary">
          <Link href={href} className="outline-none after:absolute after:inset-0 focus-visible:ring-0">
            {title}
          </Link>
        </h2>
        <p className="flex items-center gap-1 truncate text-sm text-text-secondary">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {locationLabel}
        </p>
        <p className="text-xs font-medium text-text-secondary">{postedLabel}</p>
      </div>
    </article>
  );
}
