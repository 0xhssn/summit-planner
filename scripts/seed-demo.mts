// Resets the demo account to a known state. Run: npm run seed:demo
// Needs NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, DEMO_EMAIL, DEMO_PASSWORD in .env.local.
import { createClient } from "@supabase/supabase-js";
import { getTemplate } from "../lib/templates.ts";
import type { ExpeditionStatus } from "../lib/types.ts";

const env = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} in .env.local`);
  return value;
};

const supabase = createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"), {
  auth: { persistSession: false },
});

const email = env("DEMO_EMAIL");
const password = env("DEMO_PASSWORD");

// Sign in, or create the account on first run (email confirmation must be off).
let { error } = await supabase.auth.signInWithPassword({ email, password });
if (error) ({ error } = await supabase.auth.signUp({ email, password }));
if (error) throw error;

// RLS scopes this to the demo user's own rows; days cascade.
const { error: wipeError } = await supabase
  .from("expeditions")
  .delete()
  .neq("id", "00000000-0000-0000-0000-000000000000");
if (wipeError) throw wipeError;

// Inserted oldest first, so the dashboard (newest first) leads with the high-risk Huayna plan.
const seeds: { slug: string; status: ExpeditionStatus; outcome_note: string | null }[] = [
  { slug: "khosar-gang", status: "turned_back", outcome_note: null },
  { slug: "k2-gondogoro", status: "planning", outcome_note: null },
  { slug: "huayna-potosi", status: "planning", outcome_note: null },
];

for (const seed of seeds) {
  const template = getTemplate(seed.slug);
  if (!template) throw new Error(`Unknown template ${seed.slug}`);

  const { data: expedition, error: insertError } = await supabase
    .from("expeditions")
    .insert({
      name: template.name,
      peak: template.peak,
      summit_altitude_m: template.summit_altitude_m,
      status: seed.status,
      outcome_note: seed.outcome_note,
    })
    .select("id")
    .single();
  if (insertError) throw insertError;

  const { error: daysError } = await supabase
    .from("days")
    .insert(template.days.map((d, i) => ({ ...d, expedition_id: expedition.id, day_index: i })));
  if (daysError) throw daysError;

  console.log(`Seeded ${template.name} (${seed.status}, ${template.days.length} days)`);
}
