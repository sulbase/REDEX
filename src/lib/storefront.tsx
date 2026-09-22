import { createContext, useContext, type ReactNode } from "react";

import { EMPTY_STOREFRONT, type StorefrontContact } from "@/lib/directus";

const StorefrontContext = createContext<StorefrontContact>(EMPTY_STOREFRONT);

export function StorefrontProvider({
  value,
  children,
}: {
  value: StorefrontContact;
  children: ReactNode;
}) {
  return <StorefrontContext.Provider value={value}>{children}</StorefrontContext.Provider>;
}

export function useStorefront() {
  return useContext(StorefrontContext);
}
