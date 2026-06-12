import type { Session } from "@supabase/supabase-js";

const providerLabel: Record<string, string> = {
  apple: "Apple",
  google: "Google",
  email: "email",
};

export const getSignedInLabel = (session: Session | null): string => {
  const provider = session?.user.app_metadata?.provider;
  if (typeof provider === "string" && providerLabel[provider]) {
    return `Signed in with ${providerLabel[provider]}`;
  }

  return "Signed in";
};
