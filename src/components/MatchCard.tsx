import Link from "next/link";
import { formatMatchDate, formatMatchTime, statusLabel, statusColor, teamInitials } from "@/lib/utils";

interface MatchCardProps {
  id: string;
  homeName: string;
  awayName: string;
  homeShort?: string | null;
  awayShort?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  htHome?: number | null;
  htAway?: number | null;
  status: string;
  kickoffAt?: Date | string | null;
  groupCode?: string | null;
  stage?: string;
  slotHome?: string | null;
  slotAway?: string | null;
}

export function MatchCard({
  id,
  homeName,
  awayName,
  homeShort,
  awayShort,
  homeScore,
  awayScore,
  htHome,
  htAway,
  status,
  kickoffAt,
  groupCode,
  stage,
  slotHome,
  slotAway,
}: MatchCardProps) {
  const displayHome = homeName || slotHome || "TBD";
  const displayAway = awayName || slotAway || "TBD";
  const isFinished = status === "FULL_TIME";
  const showScore = isFinished || status === "LIVE" || status === "HALF_TIME";

  return (
    <Link
      href={`/matches/${id}`}
      className="card block p-4 transition hover:border-emerald-300 hover:shadow-md"
    >
      <div className="mb-3 flex items-center justify-between gap-2 text-xs text-slate-500">
        <span>
          {groupCode ? `Group ${groupCode}` : stage?.replace(/_/g, " ")}
          {kickoffAt && ` · ${formatMatchDate(kickoffAt)}`}
        </span>
        <span className={`badge ${statusColor(status)}`}>{statusLabel(status)}</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-1 flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900 text-right">{displayHome}</span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
              {teamInitials(displayHome, homeShort)}
            </span>
          </div>
        </div>

        <div className="flex w-16 flex-col items-center">
          {showScore ? (
            <>
              <span className="text-xl font-bold tabular-nums text-slate-900">
                {homeScore ?? 0}–{awayScore ?? 0}
              </span>
              {(htHome != null || htAway != null) && (
                <span className="text-[10px] text-slate-400">
                  HT {htHome ?? 0}–{htAway ?? 0}
                </span>
              )}
            </>
          ) : (
            <span className="text-xs font-medium text-slate-400">{formatMatchTime(kickoffAt)}</span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
              {teamInitials(displayAway, awayShort)}
            </span>
            <span className="text-sm font-semibold text-slate-900">{displayAway}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
