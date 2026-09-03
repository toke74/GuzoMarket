"use client";

import { usePathname } from "next/navigation";

import { Footer } from "@/components/navigation/footer";

export function RouteAwareFooter() {
  const pathname = usePathname();
  const compactOnMobile =
    pathname === "/post" || /^\/account\/listings\/[^/]+\/edit$/.test(pathname);

  return <Footer compactOnMobile={compactOnMobile} />;
}
