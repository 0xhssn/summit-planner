import Link from "next/link";
import { Logo } from "@/app/components/logo";
import { PendingButton } from "@/app/components/pending-button";
import { DEMO_ACCOUNT } from "@/lib/demo";
import { login, signup } from "./actions";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : null;
  const message = typeof params.message === "string" ? params.message : null;
  const next = typeof params.next === "string" ? params.next : "/dashboard";
  const demo = params.demo === "1";

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" aria-label="Summit Planner home">
          <Logo />
        </Link>
        <h1 className="mt-8 text-2xl font-semibold text-slate-900">Base camp check-in</h1>
        <p className="mt-1 text-sm text-slate-500">
          {demo
            ? "The demo account is filled in. It has three expeditions to explore."
            : "Log in, or pick an email and password and hit Sign up."}
        </p>

        {error && (
          <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {message && (
          <p className="mt-6 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-800">
            {message}
          </p>
        )}

        <form className="mt-6 space-y-4">
          <input type="hidden" name="next" value={next} />
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue={demo ? DEMO_ACCOUNT.email : undefined}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="current-password"
              defaultValue={demo ? DEMO_ACCOUNT.password : undefined}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </label>
          <div className="flex gap-3 pt-2">
            <PendingButton
              formAction={login}
              className="flex-1 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Log in
            </PendingButton>
            <PendingButton
              formAction={signup}
              className="flex-1 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Sign up
            </PendingButton>
          </div>
        </form>
        {!demo && (
          <p className="mt-6 text-center text-sm text-slate-500">
            Just looking?{" "}
            <Link href="/login?demo=1" className="font-medium text-slate-800 underline">
              Use the demo account
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
