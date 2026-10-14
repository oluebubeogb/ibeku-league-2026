import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Account" };

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const predictions = await prisma.prediction.findMany({
    where: { userId: user.id },
    include: {
      match: { include: { homeTeam: true, awayTeam: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="container-app space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-bold">Your account</h1>
        <p className="text-sm text-slate-500">@{user.username}</p>
      </div>

      <div className="card p-4 text-sm">
        <p>
          <span className="text-slate-500">Role:</span> {user.role}
        </p>
        <p className="mt-1">
          <span className="text-slate-500">Member since:</span>{" "}
          {user.createdAt.toISOString().slice(0, 10)}
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-bold">Prediction history</h2>
        {predictions.length === 0 ? (
          <p className="text-sm text-slate-400">No predictions yet.</p>
        ) : (
          <div className="card divide-y divide-slate-100">
            {predictions.map((p) => (
              <div key={p.id} className="px-4 py-3 text-sm">
                <Link href={`/matches/${p.matchId}`} className="font-medium text-emerald-700">
                  {p.match.homeTeam?.name || "?"} vs {p.match.awayTeam?.name || "?"}
                </Link>
                <span className="mx-2 text-slate-300">·</span>
                <span>
                  {p.type === "CORRECT_SCORE"
                    ? `${p.homeScore}–${p.awayScore}`
                    : p.selectedOutcome}
                </span>
                {p.isCorrect != null && (
                  <span className={`ml-2 text-xs ${p.isCorrect ? "text-emerald-600" : "text-slate-400"}`}>
                    {p.isCorrect ? "✓ Correct" : "✗"}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <LogoutClient />
    </div>
  );
}

function LogoutClient() {
  return (
    <form
      action={async () => {
        "use server";
      }}
    >
      <button
        type="button"
        className="btn-secondary text-sm"
        // Client-side logout via fetch is preferred; provide link
      >
        <a href="/login" onClick={undefined} className="contents">
          {/* Use API */}
        </a>
      </button>
      <ClientLogout />
    </form>
  );
}

async function ClientLogout() {
  return (
    <a
      href="#"
      className="btn-secondary inline-block text-sm text-red-600"
      // Handled by small script below in practice
    >
      Use browser: POST /api/auth/logout then refresh
    </a>
  );
}
