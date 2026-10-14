import Link from "next/link";
import { getSessionUser, isAdmin } from "@/lib/auth";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/fixtures", label: "Fixtures" },
  { href: "/results", label: "Results" },
  { href: "/groups", label: "Groups" },
  { href: "/predictions", label: "Predictions" },
  { href: "/teams", label: "Teams" },
];

export async function Header() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-app flex h-14 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-xs text-white">
            IL
          </span>
          <span className="hidden sm:inline">Ibeku League 2026</span>
          <span className="sm:hidden">Ibeku 2026</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {isAdmin(user.role) && (
                <Link href="/admin" className="btn-secondary text-xs py-1.5 px-2.5">
                  Admin
                </Link>
              )}
              <Link href="/account" className="text-sm font-medium text-slate-700">
                {user.username}
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost text-sm py-1.5">
                Log in
              </Link>
              <Link href="/signup" className="btn-primary text-sm py-1.5 px-3">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
