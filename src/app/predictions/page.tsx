import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { MatchCard } from "@/components/MatchCard";
import { PREDICTION_DISCLAIMER } from "@/lib/utils";
import { PredictionForm } from "@/components/PredictionForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Predictions" };

export default async function PredictionsPage() {
  const user = await getSessionUser();

  const upcoming = await prisma.match.findMany({
    where: {
      status: { in: ["SCHEDULED", "POSTPONED"] },
      published: true,
      stage: "GROUP",
    },
    include: { homeTeam: true, awayTeam: true, group: true },
    orderBy: { kickoffAt: "asc" },
    take: 12,
  });

  const recentPredictions = await prisma.prediction.findMany({
    where: { status: { in: ["ACTIVE", "CLOSED", "GRADED"] } },
    include: {
      user: { select: { username: true } },
      match: {
        include: { homeTeam: true, awayTeam: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="container-app space-y-8 py-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Predictions</h1>
        <p className="mt-1 text-sm text-slate-500">Predict match outcomes and exact scores</p>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        {PREDICTION_DISCLAIMER}
      </div>

      {!user && (
        <div className="card p-4 text-sm">
          <Link href="/login" className="text-emerald-600 underline">
            Log in
          </Link>{" "}
          or{" "}
          <Link href="/signup" className="text-emerald-600 underline">
            sign up
          </Link>{" "}
          to submit predictions.
        </div>
      )}

      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-900">Upcoming matches</h2>
        {upcoming.length === 0 ? (
          <p className="card p-6 text-center text-sm text-slate-500">No open matches for prediction.</p>
        ) : (
          <div className="space-y-4">
            {upcoming.map((m) => (
              <div key={m.id} className="space-y-2">
                <MatchCard
                  id={m.id}
                  homeName={m.homeTeam?.name || ""}
                  awayName={m.awayTeam?.name || ""}
                  homeShort={m.homeTeam?.shortName}
                  awayShort={m.awayTeam?.shortName}
                  status={m.status}
                  kickoffAt={m.kickoffAt}
                  groupCode={m.group?.code}
                  stage={m.stage}
                />
                {user && (
                  <PredictionForm
                    matchId={m.id}
                    homeName={m.homeTeam?.name || "Home"}
                    awayName={m.awayTeam?.name || "Away"}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-900">Recent fan predictions</h2>
        {recentPredictions.length === 0 ? (
          <p className="text-sm text-slate-400">No predictions yet.</p>
        ) : (
          <div className="card divide-y divide-slate-100">
            {recentPredictions.map((p) => (
              <div key={p.id} className="px-4 py-3 text-sm">
                <span className="font-medium">{p.user.username}</span>
                <span className="mx-1 text-slate-300">·</span>
                <span className="text-slate-500">
                  {p.match.homeTeam?.name || "?"} vs {p.match.awayTeam?.name || "?"}
                </span>
                <span className="mx-1 text-slate-300">→</span>
                <span className="font-medium text-emerald-700">
                  {p.type === "CORRECT_SCORE"
                    ? `${p.homeScore}–${p.awayScore}`
                    : p.selectedOutcome}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
