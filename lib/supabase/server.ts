import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component, where cookies are read-only.
            // The proxy refreshes the session, so this is safe to ignore.
          }
        },
      },
    },
  );
}

// getClaims verifies the session JWT (locally, with Supabase's asymmetric signing keys) instead of
// calling the Auth server on every request like getUser does. Data access is still enforced by RLS.
async function readSession() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  return { supabase, user: claims ? { id: claims.sub, email: claims.email } : null };
}

// For pages that render differently when signed in, like the landing page.
export async function getCurrentUser() {
  return (await readSession()).user;
}

// Real auth check for pages and server actions. The proxy redirect is only optimistic.
export async function requireUser() {
  const { supabase, user } = await readSession();
  if (!user) redirect("/login");
  return { supabase, user };
}
