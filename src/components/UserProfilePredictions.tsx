import Link from "next/link";
import { AwardCategory } from "@prisma/client";
import { Card } from "@/components/ui";
import { OfficialAwardResult } from "@/components/OfficialAwardResult";
import { OfficialGroupStanding } from "@/components/OfficialGroupStanding";
import { OfficialMatchResult } from "@/components/OfficialMatchResult";
import { KnockoutTiebreakerNote } from "@/components/KnockoutTiebreakerNote";
import { getMatchHomeName, getMatchAwayName, getMatchMeta } from "@/lib/matchDisplay";
import {
  buildOfficialKnockoutSlots,
  getKnockoutMatchAwayName,
  getKnockoutMatchHomeName,
} from "@/lib/knockoutDisplay";
import { formatTeamDisplay } from "@/lib/teamFlags";
import type { getOfficialResults } from "@/lib/official";

const AWARD_LABELS: Record<AwardCategory, string> = {
  GOLDEN_BALL: "Balón de Oro",
  GOLDEN_BOOT: "Bota de Oro",
  GOLDEN_GLOVE: "Guante de Oro",
  BEST_YOUNG: "Mejor jugador joven",
};

type ProfileData = {
  user: {
    displayName: string;
    phase1Locked: boolean;
    phase1LockedAt: Date | null;
    phase2Locked: boolean;
    phase2LockedAt: Date | null;
    score: {
      totalPoints: number;
      matchPoints: number;
      standingPoints: number;
      bestThirdPoints: number;
      awardPoints: number;
      bracketPoints: number;
    } | null;
  };
  groupsData: Awaited<ReturnType<typeof import("@/lib/data").getGroupsWithData>>;
  knockoutData: Awaited<ReturnType<typeof import("@/lib/data").getKnockoutMatches>>;
  awardsData: Awaited<ReturnType<typeof import("@/lib/data").getAwardsData>>;
  officialResults: Awaited<ReturnType<typeof getOfficialResults>>;
};

const SCORE_BREAKDOWN = [
  {
    key: "matchPoints" as const,
    label: "Partidos",
    description: "Marcadores en fase de grupos y eliminatorias",
  },
  {
    key: "standingPoints" as const,
    label: "Grupos",
    description: "Clasificación predicha (1º, 2º, 3º y 4º por grupo)",
  },
  {
    key: "bestThirdPoints" as const,
    label: "8 mejores terceros",
    description: "Aciertos entre tus 8 terceros elegidos",
  },
  {
    key: "awardPoints" as const,
    label: "Premios",
    description: "Balón de Oro, Bota, Guante y Mejor joven",
  },
  {
    key: "bracketPoints" as const,
    label: "Cuadro de honor",
    description: "Campeón, subcampeón, 3º y 4º puesto",
  },
];

export function UserProfilePredictions({ profile }: { profile: ProfileData }) {
  const { user, groupsData, knockoutData, awardsData, officialResults } = profile;
  const { teamMap, groups, matchPredictions, standingPredictions, bestThirdTeamIds } =
    groupsData;

  const bestThirdTeams = Object.values(teamMap).filter((t) =>
    bestThirdTeamIds.has(t.id)
  );

  const knockoutSlots = buildOfficialKnockoutSlots(
    knockoutData.matches,
    knockoutData.officialStandings,
    knockoutData.officialBestThirdIds,
    knockoutData.officialWinners,
    knockoutData.officialLosers
  );

  return (
    <div className="space-y-8">
      <Card>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm text-emerald-300">Puntos totales</p>
            <p className="text-4xl font-black text-emerald-300">
              {user.score?.totalPoints ?? 0}
            </p>
            <p className="mt-2 max-w-md text-sm text-emerald-200">
              Suma de todas las categorías. El desglose detallado está abajo en cada
              sección de pronósticos.
            </p>
          </div>

          <div className="min-w-0 flex-1 lg:max-w-xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-emerald-400">
              Desglose de puntos
            </p>
            <ul className="space-y-2">
              {SCORE_BREAKDOWN.map(({ key, label, description }) => (
                <li
                  key={key}
                  className="flex items-start justify-between gap-4 rounded-lg bg-emerald-950/40 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-xs text-emerald-300">{description}</p>
                  </div>
                  <span className="shrink-0 text-lg font-bold tabular-nums text-emerald-300">
                    {user.score?.[key] ?? 0}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-2 text-sm lg:flex-col lg:items-end">
            {user.phase1Locked ? (
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-200">
                Fase 1 enviada
                {user.phase1LockedAt &&
                  ` · ${user.phase1LockedAt.toLocaleDateString("es-ES")}`}
              </span>
            ) : (
              <span className="rounded-full bg-amber-500/20 px-3 py-1 text-amber-200">
                Fase 1 borrador
              </span>
            )}
            {user.phase2Locked ? (
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-200">
                Fase 2 enviada (antiguo)
                {user.phase2LockedAt &&
                  ` · ${user.phase2LockedAt.toLocaleDateString("es-ES")}`}
              </span>
            ) : user.phase1Locked ? (
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-200">
                Fase 2 · por ronda
              </span>
            ) : (
              <span className="rounded-full bg-amber-500/20 px-3 py-1 text-amber-200">
                Fase 2 pendiente (envía Fase 1)
              </span>
            )}
          </div>
        </div>
      </Card>

      {groups.map((group) => {
        const standing = standingPredictions[group.id];
        const officialStanding = officialResults.standingsByGroup[group.id];

        return (
          <Card key={group.id} title={`Grupo ${group.id}`}>
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-sm uppercase text-emerald-300">Partidos</h3>
                <div className="grid gap-2">
                  {group.matches.map((match) => {
                    const p = matchPredictions[match.id];
                    return (
                      <div
                        key={match.id}
                        className="flex flex-col gap-2 rounded-lg bg-emerald-950/40 px-3 py-2 text-sm"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="w-full text-xs text-emerald-400">
                            {getMatchMeta(match)}
                          </span>
                          <span className="min-w-[100px]">
                            {getMatchHomeName(match, teamMap)}
                          </span>
                          <span className="font-bold text-emerald-300">
                            {p ? `${p.homeScore} - ${p.awayScore}` : "—"}
                          </span>
                          <span className="min-w-[100px]">
                            {getMatchAwayName(match, teamMap)}
                          </span>
                          {p && match.homeScore !== null && (
                            <span className="text-xs text-amber-200">+{p.points} pts</span>
                          )}
                        </div>
                        <OfficialMatchResult match={match} teamMap={teamMap} prediction={p} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {standing && (
                <div>
                  <h3 className="mb-2 text-sm uppercase text-emerald-300">Tu clasificación</h3>
                  <ol className="space-y-1 text-sm">
                    {[
                      ["1º", standing.firstTeamId],
                      ["2º", standing.secondTeamId],
                      ["3º", standing.thirdTeamId],
                      ["4º", standing.fourthTeamId],
                    ].map(([pos, teamId]) => {
                      const team = teamMap[teamId as string];
                      return (
                        <li key={pos as string}>
                          {pos}: {team ? formatTeamDisplay(team.name, team.code) : "—"}
                        </li>
                      );
                    })}
                  </ol>
                  {standing.points > 0 && (
                    <p className="mt-1 text-xs text-amber-200">+{standing.points} pts</p>
                  )}
                </div>
              )}

              {officialStanding && (
                <OfficialGroupStanding
                  groupId={group.id}
                  standing={officialStanding}
                  teamMap={teamMap}
                  userStanding={standing}
                />
              )}
            </div>
          </Card>
        );
      })}

      <Card title="8 mejores terceros">
        {bestThirdTeams.length > 0 ? (
          <ul className="grid gap-1 sm:grid-cols-2">
            {bestThirdTeams.map((team) => {
              const isOfficial = officialResults.officialThirdIds.has(team.id);
              return (
                <li key={team.id} className="text-sm">
                  {formatTeamDisplay(team.name, team.code, { showCode: true })}
                  {isOfficial && (
                    <span className="ml-2 text-xs text-emerald-300">✓ Oficial</span>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-emerald-200">Sin selección</p>
        )}
        {officialResults.hasThirds && (
          <p className="mt-3 text-xs text-emerald-400">
            Oficiales:{" "}
            {officialResults.officialThirdTeams
              .map((t) => formatTeamDisplay(t.name, t.code))
              .join(", ")}
          </p>
        )}
      </Card>

      {Object.entries(
        knockoutData.matches.reduce<Record<string, typeof knockoutData.matches>>(
          (acc, match) => {
            if (!acc[match.stage]) acc[match.stage] = [];
            acc[match.stage].push(match);
            return acc;
          },
          {}
        )
      ).map(([stage, stageMatches]) => (
        <Card key={stage} title={knockoutData.stageLabels[stage as keyof typeof knockoutData.stageLabels]}>
          <div className="grid gap-2">
            {stageMatches.map((match) => {
              const p = knockoutData.predictions[match.id];
              return (
                <div
                  key={match.id}
                  className="flex flex-col gap-2 rounded-lg bg-emerald-950/40 px-3 py-2 text-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-full text-xs text-emerald-400">
                      {getMatchMeta(match)}
                    </span>
                    <span>{getKnockoutMatchHomeName(match, knockoutData.teamMap, knockoutSlots)}</span>
                    <span className="font-bold text-emerald-300">
                      {p ? `${p.homeScore} - ${p.awayScore}` : "—"}
                    </span>
                    <span>{getKnockoutMatchAwayName(match, knockoutData.teamMap, knockoutSlots)}</span>
                    {p && match.homeScore !== null && (
                      <span className="text-xs text-amber-200">+{p.points} pts</span>
                    )}
                  </div>
                  {p && (
                    <KnockoutTiebreakerNote
                      homeScore={p.homeScore}
                      awayScore={p.awayScore}
                      advancesTeamId={p.advancesTeamId}
                      teamMap={knockoutData.teamMap}
                    />
                  )}
                  <OfficialMatchResult
                    match={match}
                    teamMap={knockoutData.teamMap}
                    prediction={p}
                    isKnockout
                  />
                </div>
              );
            })}
          </div>
        </Card>
      ))}

      {knockoutData.finalBracket && (
        <Card title="Cuadro de honor (Fase 2)">
          <ul className="space-y-1 text-sm text-emerald-100">
            <li>
              🏆 Campeón:{" "}
              {knockoutData.finalBracket.championTeamId
                ? formatTeamDisplay(
                    teamMap[knockoutData.finalBracket.championTeamId]!.name,
                    teamMap[knockoutData.finalBracket.championTeamId]!.code
                  )
                : "—"}
            </li>
            <li>
              🥈 Subcampeón:{" "}
              {knockoutData.finalBracket.runnerUpTeamId
                ? formatTeamDisplay(
                    teamMap[knockoutData.finalBracket.runnerUpTeamId]!.name,
                    teamMap[knockoutData.finalBracket.runnerUpTeamId]!.code
                  )
                : "—"}
            </li>
            <li>
              🥉 3º:{" "}
              {knockoutData.finalBracket.thirdPlaceTeamId
                ? formatTeamDisplay(
                    teamMap[knockoutData.finalBracket.thirdPlaceTeamId]!.name,
                    teamMap[knockoutData.finalBracket.thirdPlaceTeamId]!.code
                  )
                : "—"}
            </li>
            <li>
              4º:{" "}
              {knockoutData.finalBracket.fourthPlaceTeamId
                ? formatTeamDisplay(
                    teamMap[knockoutData.finalBracket.fourthPlaceTeamId]!.name,
                    teamMap[knockoutData.finalBracket.fourthPlaceTeamId]!.code
                  )
                : "—"}
            </li>
          </ul>
          {knockoutData.finalBracket.points > 0 && (
            <p className="mt-2 text-xs text-amber-200">
              +{knockoutData.finalBracket.points} pts
            </p>
          )}
        </Card>
      )}

      <Card title="Premios individuales">
        <div className="grid gap-4 md:grid-cols-2">
          {(Object.keys(AWARD_LABELS) as AwardCategory[]).map((category) => {
            const p = awardsData.predictions[category];
            return (
              <div key={category} className="rounded-xl bg-emerald-950/40 p-4">
                <OfficialAwardResult
                  category={category}
                  official={officialResults.awards[category]}
                  prediction={p}
                />
                <h3 className="font-semibold">{AWARD_LABELS[category]}</h3>
                {category === "GOLDEN_BOOT" ? (
                  <ul className="mt-2 space-y-1 text-sm text-emerald-100">
                    <li>1º: {p?.first || "—"}</li>
                    <li>2º: {p?.second || "—"}</li>
                    <li>3º: {p?.third || "—"}</li>
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-emerald-100">{p?.first || "—"}</p>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

export function ProfileLinks({
  phase1Locked,
}: {
  phase1Locked: boolean;
}) {
  return (
    <Card title="Rellena tus pronósticos">
      <div className="flex flex-wrap gap-3">
        {!phase1Locked && (
          <>
            <Link
              href="/mis-pronosticos?tab=grupos"
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950"
            >
              Grupos
            </Link>
            <Link
              href="/mis-pronosticos?tab=premios"
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950"
            >
              Premios
            </Link>
          </>
        )}
        {phase1Locked && (
          <Link
            href="/mis-pronosticos?tab=eliminatorias"
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950"
          >
            Eliminatorias
          </Link>
        )}
        <Link
          href="/mis-pronosticos"
          className="rounded-xl border border-emerald-400/40 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-white/5"
        >
          Ver todo
        </Link>
      </div>
    </Card>
  );
}
