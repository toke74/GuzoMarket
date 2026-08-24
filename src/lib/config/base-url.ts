import { clientEnv } from "@/lib/config/env";

export function getBaseUrl() {
  return clientEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
}
