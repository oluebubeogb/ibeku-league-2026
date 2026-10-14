import Link from "next/link";
import type { TeamStanding } from "@/lib/standings";
import { teamInitials } from "@/lib/utils";

interface Props {
  rows: TeamStanding[];
  showGroup?: boolean;
  compact?: boolean;
}

export function StandingsTable({ rows, showGroup = false, compact = false }: Props) {
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full min-w-[320px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-2 py-2 w-8">#</th>
            <th className="px-2 py-2">Team</th>
            {showGroup && <th className="px-2 py-2">Grp</th>}
            <th className="px-1 py-2 text-center">P</th>
            {!compact && (
              <>
                <th className="px-1 py-2 text-center">W</th>
                <th className="px-1 py-2 text-center">D</th>
                <th className="px-1 py-2 text-center">L</th>
              </>
            )}
            <th className="px-1 py-2 text-center">GF</th>
            <th className="px-1 py-2 text-center">GA</th>
            <th className="px-1 py-2 text-center">GD</th>
            <th className="px-2 py-2 text-center font-bold">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.teamId}
              className={`border-b border-slate-100 ${
                r.position && r.position <= 2 ? "bg-emerald-50/50" : ""
              }`}
            >
              <td className="px-2 py-2.5 font-medium text-slate-500">{r.position}</td>
              <td className="px-2 py-2.5">
                <Link
                  href={`/teams/${r.teamSlug}`}
                  className="flex items-center gap-2 font-medium text-slate-900 hover:text-emerald-700"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold">
                    {teamInitials(r.teamName, r.shortName)}
                  </span>
                  <span className="truncate">{r.teamName}</span>
                </Link>
              </td>
              {showGroup && (
                <td className="px-2 py-2.5 text-slate-500">{r.groupCode}</td>
              )}
              <td className="px-1 py-2.5 text-center tabular-nums">{r.played}</td>
              {!compact && (
                <>
                  <td className="px-1 py-2.5 text-center tabular-nums">{r.won}</td>
                  <td className="px-1 py-2.5 text-center tabular-nums">{r.drawn}</td>
                  <td className="px-1 py-2.5 text-center tabular-nums">{r.lost}</td>
                </>
              )}
              <td className="px-1 py-2.5 text-center tabular-nums">{r.goalsFor}</td>
              <td className="px-1 py-2.5 text-center tabular-nums">{r.goalsAgainst}</td>
              <td className="px-1 py-2.5 text-center tabular-nums">
                {r.goalDifference > 0 ? `+${r.goalDifference}` : r.goalDifference}
              </td>
              <td className="px-2 py-2.5 text-center font-bold tabular-nums">{r.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
