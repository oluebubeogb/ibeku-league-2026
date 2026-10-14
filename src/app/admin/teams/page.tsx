import { redirect } from "next/navigation";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminTeamsPage() {
  const user = await getSessionUser();
  if (!user || !isAdmin(user.role)) redirect("/login");

  const teams = await prisma.team.findMany({
    include: { group: true, _count: { select: { players: true } } },
    orderBy: [{ group: { displayOrder: "asc" } }, { name: "asc" }],
  });

  return (
    <div className="container-app space-y-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Teams</h1>
        <a href="/admin" className="btn-secondary text-sm">← Dashboard</a>
      </div>
      <div className="card divide-y divide-slate-100">
        {teams.map((t) => (
          <div key={t.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <div>
              <p className="font-medium">{t.name}</p>
              <p className="text-xs text-slate-500">
                Group {t.group.code} · {t.slug} · {t._count.players} players
              </p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400">
        Team names and groups are seeded. Group reassignment is available via Prisma Studio or a
        future edit form; historical match records are not rewritten.
      </p>
    </div>
  );
}
