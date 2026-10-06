import Link from "next/link";
import { Logo } from "@/app/components/logo";
import { PageTransition } from "@/app/components/page-transition";
import { PendingButton } from "@/app/components/pending-button";
import { ThemeToggle } from "@/app/components/theme";
import { BUTTON, INPUT } from "@/app/components/ui";
import { DEMO_ACCOUNT } from "@/lib/demo";
import { login, signup } from "./actions";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : null;
  const message = typeof params.message === "string" ? params.message : null;
  const next = typeof params.next === "string" ? params.next : "/dashboard";
  const demo = params.demo === "1";

  return (
    <main className="relative flex flex-1 items-center justify-center px-4 py-16">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <PageTransition>
        <div className="w-full max-w-sm">
          <Link href="/" aria-label="Summit Planner home" className="inline-block rounded-md">
            <Logo />
          </Link>
          <h1 className="mt-8 text-2xl font-semibold text-fg">Base camp check-in</h1>
          <p className="mt-1 text-sm text-fg-muted">
            {demo
              ? "The demo account is filled in. It has three expeditions to explore."
              : "Log in, or pick an email and password and hit Sign up."}
          </p>

          {error && (
            <p className="mt-6 rounded-md border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger-fg">
              {error}
            </p>
          )}
          {message && (
            <p className="mt-6 rounded-md border border-info-line bg-info-soft px-3 py-2 text-sm text-info-fg">
              {message}
            </p>
          )}

          <form className="mt-6 space-y-4">
            <input type="hidden" name="next" value={next} />
            <label className="block">
              <span className="text-sm font-medium text-fg-secondary">Email</span>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                defaultValue={demo ? DEMO_ACCOUNT.email : undefined}
                className={`mt-1 ${INPUT}`}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-fg-secondary">Password</span>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="current-password"
                defaultValue={demo ? DEMO_ACCOUNT.password : undefined}
                className={`mt-1 ${INPUT}`}
              />
            </label>
            <div className="flex gap-3 pt-2">
              <PendingButton
                formAction={login}
                className={`flex-1 ${BUTTON.primary}`}
              >
                Log in
              </PendingButton>
              <PendingButton
                formAction={signup}
                className={`flex-1 ${BUTTON.secondary}`}
              >
                Sign up
              </PendingButton>
            </div>
          </form>
          {!demo && (
            <p className="mt-6 text-center text-sm text-fg-muted">
              Just looking?{" "}
              <Link
                href="/login?demo=1"
                className="font-medium text-fg underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-fg"
              >
                Use the demo account
              </Link>
            </p>
          )}
        </div>
      </PageTransition>
    </main>
  );
}
