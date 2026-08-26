import Link from "next/link";
import {
  Armchair,
  Baby,
  Briefcase,
  BriefcaseBusiness,
  Building,
  CalendarDays,
  Car,
  CarFront,
  Coffee,
  DoorOpen,
  Home,
  MessageCircle,
  Monitor,
  ShoppingBag,
  Store,
  Users,
  Wrench,
} from "lucide-react";

import { marketplaceShortcutItems } from "@/components/navigation/nav-items";
import type { PublicCategoryDTO } from "@/server/marketplace/categories";

type CategoryShortcutsProps = {
  categories?: Pick<PublicCategoryDTO, "id" | "name" | "slug" | "iconKey">[];
};

const iconMap = {
  armchair: Armchair,
  baby: Baby,
  briefcase: Briefcase,
  "briefcase-business": BriefcaseBusiness,
  building: Building,
  "calendar-days": CalendarDays,
  car: Car,
  "car-front": CarFront,
  coffee: Coffee,
  "door-open": DoorOpen,
  home: Home,
  "message-circle": MessageCircle,
  "messages-square": MessageCircle,
  monitor: Monitor,
  "shopping-bag": ShoppingBag,
  store: Store,
  users: Users,
  wrench: Wrench,
};

export function CategoryShortcuts({ categories }: CategoryShortcutsProps) {
  if (categories?.length) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const Icon = category.iconKey ? iconMap[category.iconKey as keyof typeof iconMap] : Store;

          return (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="flex min-h-20 items-center gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm hover:border-brand-primary hover:bg-brand-light"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light text-brand-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="font-semibold text-text-primary">{category.name}</span>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {marketplaceShortcutItems.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-h-20 items-center gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm hover:border-brand-primary hover:bg-brand-light"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light text-brand-primary">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="font-semibold text-text-primary">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
