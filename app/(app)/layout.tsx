import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import { Logo } from "@/app/components/logo";
import { TourButton } from "@/app/components/tour";
import { requireUser } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireUser();

  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" aria-label="Your expeditions">
            <Logo />
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-slate-500 sm:inline">{user.email}</span>
            <TourButton />
            <form action={signOut}>
              <button className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50">
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </>
  );
}
