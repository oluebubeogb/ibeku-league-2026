import Link from "next/link";
import { formatMatchDate, formatMatchTime, statusLabel, statusColor } from "@/lib/utils";
import { TeamFlag } from "@/components/TeamFlag";

interface MatchCardProps {
  id: string;
  homeName: string;
  awayName: string;
  homeShort?: string | null;
  awayShort?: string | null;
  homeColor1?: string | null;
  homeColor2?: string | null;
  homeColor3?: string | null;
  awayColor1?: string | null;
  awayColor2?: string | null;
  awayColor3?: string | null;
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
  homeColor1,
  homeColor2,
  homeColor3,
  awayColor1,
  awayColor2,
  awayColor3,
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

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <span className="truncate text-right text-sm font-semibold text-slate-900">
            {displayHome}
          </span>
          <TeamFlag
            color1={homeColor1}
            color2={homeColor2}
            color3={homeColor3}
            title={displayHome}
          />
        </div>

        <div className="flex w-14 shrink-0 flex-col items-center sm:w-16">
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

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <TeamFlag
            color1={awayColor1}
            color2={awayColor2}
            color3={awayColor3}
            title={displayAway}
          />
          <span className="truncate text-sm font-semibold text-slate-900">{displayAway}</span>
        </div>
      </div>
    </Link>
  );
}
