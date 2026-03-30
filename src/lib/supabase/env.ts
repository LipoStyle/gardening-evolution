export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url) throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKey) throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!url.startsWith("https://")) {
    throw new Error("Invalid NEXT_PUBLIC_SUPABASE_URL (must start with https://)");
  }

  const isLegacyJwt = anonKey.startsWith("eyJ");
  const isPublishable = anonKey.startsWith("sb_publishable_");
  if (!isLegacyJwt && !isPublishable) {
    throw new Error(
      "Invalid NEXT_PUBLIC_SUPABASE_ANON_KEY. Use the Publishable key (sb_publishable_...) or legacy anon JWT (eyJ...) from Project Settings → API."
    );
  }

  return { url, anonKey };
}

