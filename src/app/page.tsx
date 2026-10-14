import Link from "next/link";
import { prisma } from "@/lib/db";
import { MatchCard } from "@/components/MatchCard";
import { StandingsTable } from "@/components/StandingsTable";
import { calculateGroupTable } from "@/lib/standings";
import { SPONSOR, PREDICTION_DISCLAIMER } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getHomeData() {
  const [upcoming, recent, groups, teams, finishedMatches, analyses] = await Promise.all([
    prisma.match.findMany({
      where: { status: { in: ["SCHEDULED", "LIVE", "HALF_TIME"] }, published: true },
      include: { homeTeam: true, awayTeam: true, group: true },
      orderBy: { kickoffAt: "asc" },
      take: 6,
    }),
    prisma.match.findMany({
      where: { status: "FULL_TIME", published: true },
      include: { homeTeam: true, awayTeam: true, group: true },
      orderBy: { kickoffAt: "desc" },
      take: 4,
    }),
    prisma.group.findMany({ orderBy: { displayOrder: "asc" }, include: { teams: true } }),
    prisma.team.findMany({ include: { group: true } }),
    prisma.match.findMany({
      where: { status: "FULL_TIME", stage: "GROUP" },
      select: {
        homeTeamId: true,
        awayTeamId: true,
        fullTimeHomeScore: true,
        fullTimeAwayScore: true,
        status: true,
        stage: true,
      },
    }),
    prisma.aIAnalysis.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 2,
      include: { match: { include: { homeTeam: true, awayTeam: true } } },
    }),
  ]);

  // Build one sample group table (Group A)
  const groupA = groups.find((g) => g.code === "A");
  let sampleTable = null;
  if (groupA) {
    const teamInputs = groupA.teams.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      shortName: t.shortName,
      groupCode: "A",
    }));
    const matchInputs = finishedMatches
      .filter((m) => m.homeTeamId && m.awayTeamId)
      .map((m) => ({
        homeTeamId: m.homeTeamId!,
        awayTeamId: m.awayTeamId!,
        fullTimeHomeScore: m.fullTimeHomeScore!,
        fullTimeAwayScore: m.fullTimeAwayScore!,
        status: m.status,
        stage: m.stage,
      }));
    sampleTable = calculateGroupTable(teamInputs, matchInputs);
  }

  return { upcoming, recent, sampleTable, analyses, groupCount: groups.length, teamCount: teams.length };
}

export default async function HomePage() {
  const data = await getHomeData();

  return (
    <div className="container-app space-y-8 py-6">
      {/* Hero */}
      <section className="rounded-2xl bg-slate-900 px-5 py-8 text-white sm:px-8">
        <p className="text-sm font-medium text-emerald-400">11 Oct 2026 – 3 Jan 2027</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Ibeku League 2026</h1>
        <p className="mt-2 max-w-xl text-sm text-slate-300">
          Official fixtures, live standings, fan predictions and AI match analysis for the Ibeku
          community league.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/fixtures" className="btn-primary">
            View fixtures
          </Link>
          <Link href="/groups" className="btn border border-slate-600 bg-slate-800 text-white hover:bg-slate-700">
            Group tables
          </Link>
        </div>
      </section>

      {/* Sponsor */}
      <section className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Sponsored by</p>
        <p className="mt-1 text-sm font-medium text-amber-950">{SPONSOR}</p>
      </section>

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Groups", value: data.groupCount },
          { label: "Teams", value: data.teamCount },
          { label: "Upcoming", value: data.upcoming.length },
          { label: "Results", value: data.recent.length },
        ].map((s) => (
          <div key={s.label} className="card px-4 py-3 text-center">
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Upcoming fixtures</h2>
          <Link href="/fixtures" className="text-sm font-medium text-emerald-600">
            All →
          </Link>
        </div>
        {data.upcoming.length === 0 ? (
          <p className="card p-6 text-center text-sm text-slate-500">No upcoming fixtures yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.upcoming.map((m) => (
              <MatchCard
                key={m.id}
                id={m.id}
                homeName={m.homeTeam?.name || ""}
                awayName={m.awayTeam?.name || ""}
                homeShort={m.homeTeam?.shortName}
                awayShort={m.awayTeam?.shortName}
                homeColor1={(m.homeTeam as { color1?: string } | null)?.color1}
                homeColor2={(m.homeTeam as { color2?: string } | null)?.color2}
                homeColor3={(m.homeTeam as { color3?: string } | null)?.color3}
                awayColor1={(m.awayTeam as { color1?: string } | null)?.color1}
                awayColor2={(m.awayTeam as { color2?: string } | null)?.color2}
                awayColor3={(m.awayTeam as { color3?: string } | null)?.color3}
                homeScore={m.fullTimeHomeScore}
                awayScore={m.fullTimeAwayScore}
                status={m.status}
                kickoffAt={m.kickoffAt}
                groupCode={m.group?.code}
                stage={m.stage}
                slotHome={m.homeSlot}
                slotAway={m.awaySlot}
              />
            ))}
          </div>
        )}
      </section>

      {/* Recent results */}
      {data.recent.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent results</h2>
            <Link href="/results" className="text-sm font-medium text-emerald-600">
              All →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.recent.map((m) => (
              <MatchCard
                key={m.id}
                id={m.id}
                homeName={m.homeTeam?.name || ""}
                awayName={m.awayTeam?.name || ""}
                homeShort={m.homeTeam?.shortName}
                awayShort={m.awayTeam?.shortName}
                homeColor1={(m.homeTeam as { color1?: string } | null)?.color1}
                homeColor2={(m.homeTeam as { color2?: string } | null)?.color2}
                homeColor3={(m.homeTeam as { color3?: string } | null)?.color3}
                awayColor1={(m.awayTeam as { color1?: string } | null)?.color1}
                awayColor2={(m.awayTeam as { color2?: string } | null)?.color2}
                awayColor3={(m.awayTeam as { color3?: string } | null)?.color3}
                homeScore={m.fullTimeHomeScore}
                awayScore={m.fullTimeAwayScore}
                htHome={m.halfTimeHomeScore}
                htAway={m.halfTimeAwayScore}
                status={m.status}
                kickoffAt={m.kickoffAt}
                groupCode={m.group?.code}
                stage={m.stage}
              />
            ))}
          </div>
        </section>
      )}

      {/* Sample group table */}
      {data.sampleTable && data.sampleTable.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Group A standings</h2>
            <Link href="/groups" className="text-sm font-medium text-emerald-600">
              All groups →
            </Link>
          </div>
          <div className="card p-3">
            <StandingsTable rows={data.sampleTable} compact />
            <p className="mt-2 px-2 text-xs text-slate-400">
              Top 2 qualify for quarter-finals. Sorted by Pts → GD → GF.
            </p>
          </div>
        </section>
      )}

      {/* AI analysis */}
      {data.analyses.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-slate-900">AI analysis</h2>
          <div className="space-y-3">
            {data.analyses.map((a) => (
              <div key={a.id} className="card p-4">
                <p className="text-xs font-medium uppercase text-emerald-600">{a.analysisType}</p>
                <p className="mt-1 line-clamp-3 text-sm text-slate-700">{a.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <p className="text-center text-xs text-slate-400">{PREDICTION_DISCLAIMER}</p>
    </div>
  );
}
