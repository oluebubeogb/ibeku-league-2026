import { redirect } from "next/navigation";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPredictionLabel, formatPredDate } from "@/lib/prediction-label";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Predictions" };

export default async function AdminPredictionsPage() {
  const user = await getSessionUser();
  if (!user || !isAdmin(user.role)) redirect("/login");

  const predictions = await prisma.prediction.findMany({
    include: {
      user: { select: { id: true, username: true, phone: true } },
      match: { include: { homeTeam: true, awayTeam: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const total = await prisma.prediction.count();

  return (
    <div className="container-app space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Predictions</h1>
          <p className="text-sm text-slate-500">{total} total · latest 100</p>
        </div>
        <a href="/admin" className="btn-secondary text-sm">
          ← Dashboard
        </a>
      </div>

      <div className="card divide-y divide-slate-100">
        {predictions.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-400">No predictions yet.</p>
        ) : (
          predictions.map((p) => {
            const home = p.match.homeTeam?.name || "Home";
            const away = p.match.awayTeam?.name || "Away";
            const label = formatPredictionLabel({
              type: p.type,
              selectedOutcome: p.selectedOutcome,
              homeScore: p.homeScore,
              awayScore: p.awayScore,
              homeName: home,
              awayName: away,
            });
            return (
              <div key={p.id} className="px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{p.user.username}</span>
                  <span className="text-xs text-slate-400">{p.user.phone}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-600">
                    {home} vs {away}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                  <span className="font-medium text-emerald-800">{label}</span>
                  <span className="text-slate-400">{p.status}</span>
                  {p.isCorrect != null && (
                    <span>{p.isCorrect ? "✅ correct" : "❌ wrong"}</span>
                  )}
                  <span className="text-slate-400 ml-auto">{formatPredDate(p.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
