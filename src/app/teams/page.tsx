import Link from "next/link";
import { prisma } from "@/lib/db";
import { teamInitials } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Teams" };

export default async function TeamsPage() {
  const groups = await prisma.group.findMany({
    orderBy: { displayOrder: "asc" },
    include: { teams: { orderBy: { name: "asc" } } },
  });

  return (
    <div className="container-app space-y-8 py-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Teams</h1>
        <p className="mt-1 text-sm text-slate-500">All 16 teams across four groups</p>
      </div>

      {groups.map((g) => (
        <section key={g.id}>
          <h2 className="mb-3 text-lg font-bold text-slate-900">Group {g.code}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {g.teams.map((t) => (
              <Link
                key={t.id}
                href={`/teams/${t.slug}`}
                className="card flex items-center gap-3 p-4 transition hover:border-emerald-300"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                  {teamInitials(t.name, t.shortName)}
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">Group {g.code}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
