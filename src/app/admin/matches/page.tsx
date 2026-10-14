import { redirect } from "next/navigation";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ScoreEditor } from "@/components/ScoreEditor";
import { formatMatchDate, statusLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Matches" };

export default async function AdminMatchesPage() {
  const user = await getSessionUser();
  if (!user || !isAdmin(user.role)) redirect("/login");

  const matches = await prisma.match.findMany({
    include: { homeTeam: true, awayTeam: true, group: true },
    orderBy: [{ kickoffAt: "asc" }, { matchday: "asc" }],
  });

  return (
    <div className="container-app space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Match administration</h1>
          <p className="text-sm text-slate-500">Edit scores, status and events</p>
        </div>
        <a href="/admin" className="btn-secondary text-sm">
          ← Dashboard
        </a>
      </div>

      <div className="space-y-4">
        {matches.map((m) => (
          <div key={m.id} className="card p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">
                  {m.homeTeam?.name || m.homeSlot || "TBD"} vs {m.awayTeam?.name || m.awaySlot || "TBD"}
                </p>
                <p className="text-xs text-slate-500">
                  {m.group ? `Group ${m.group.code}` : m.stage} · {formatMatchDate(m.kickoffAt)} ·{" "}
                  {statusLabel(m.status)}
                </p>
              </div>
            </div>
            <ScoreEditor
              matchId={m.id}
              homeName={m.homeTeam?.name || m.homeSlot || "Home"}
              awayName={m.awayTeam?.name || m.awaySlot || "Away"}
              status={m.status}
              htHome={m.halfTimeHomeScore}
              htAway={m.halfTimeAwayScore}
              ftHome={m.fullTimeHomeScore}
              ftAway={m.fullTimeAwayScore}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
