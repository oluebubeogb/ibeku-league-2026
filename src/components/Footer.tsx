import { SPONSOR } from "@/lib/utils";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50 pb-20 md:pb-8">
      <div className="container-app py-8">
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">
          <p className="font-medium">Official Sponsor</p>
          <p className="mt-1">{SPONSOR}</p>
        </div>

        <div className="flex flex-col items-center gap-4 text-center text-sm text-slate-500 sm:flex-row sm:justify-between">
          <p>© 2026 Ibeku League. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-800">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-800">
              Terms
            </Link>
            <Link href="/knockout" className="hover:text-slate-800">
              Knockout
            </Link>
            <Link href="/standings" className="hover:text-slate-800">
              Standings
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
