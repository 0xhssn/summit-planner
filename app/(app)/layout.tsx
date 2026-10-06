import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import { Logo } from "@/app/components/logo";
import { ThemeToggle } from "@/app/components/theme";
import { requireUser } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireUser();

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-line bg-header backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" aria-label="Your expeditions" className="rounded-md">
            <Logo />
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <span className="mr-2 hidden text-fg-muted sm:inline">{user.email}</span>
            <ThemeToggle />
            <form action={signOut}>
              <button className="h-8 rounded-md border border-line-strong px-3 text-fg-secondary transition-colors hover:bg-surface-hover hover:text-fg">
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
