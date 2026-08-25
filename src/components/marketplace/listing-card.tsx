import { Heart, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    <article className="group relative overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] bg-surface-muted">
        {imageSrc ? (
          <Image src={imageSrc} alt={imageAlt ?? title} fill className="object-cover" sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-text-secondary">No image</div>
        )}
        <Button type="button" variant="outline" size="icon" className="absolute right-3 top-3 z-10 bg-surface/95" aria-label={`Save ${title}`}>
          <Heart className="h-4 w-4" aria-hidden="true" />
        </Button>
        {featured ? <Badge variant="accent" className="absolute left-3 top-3">Featured</Badge> : null}
      </div>
      <div className="grid gap-2 p-4">
        <p className="text-lg font-bold text-text-primary">{price}</p>
        <h2 className="line-clamp-2 text-base font-semibold text-text-primary">
          <Link href={href} className="outline-none after:absolute after:inset-0 focus-visible:ring-0">
            {title}
          </Link>
        </h2>
        <p className="flex items-center gap-1 text-sm text-text-secondary">
          <MapPin className="h-4 w-4" aria-hidden="true" />
          {locationLabel}
        </p>
        <p className="text-sm text-text-secondary">{postedLabel}</p>
      </div>
    </article>
  );
}
