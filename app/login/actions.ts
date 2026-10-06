"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function readCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    next: safeNext(formData.get("next")),
  };
}

// Only allow same-origin relative paths to avoid open redirects.
function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

function backToLogin(params: Record<string, string>): never {
  redirect(`/login?${new URLSearchParams(params)}`);
}

export async function login(formData: FormData) {
  const { email, password, next } = readCredentials(formData);
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) backToLogin({ error: error.message, next });

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signup(formData: FormData) {
  const { email, password, next } = readCredentials(formData);
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) backToLogin({ error: error.message, next });

  // With email confirmation enabled in Supabase, there is no session until the link is clicked.
  if (!data.session) {
    backToLogin({ message: "Check your email to confirm your account, then log in." });
  }

  revalidatePath("/", "layout");
  redirect(next);
}
