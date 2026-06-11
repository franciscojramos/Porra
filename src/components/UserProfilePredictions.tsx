import Link from "next/link";
import { AwardCategory } from "@prisma/client";
import { Card } from "@/components/ui";
import { OfficialAwardResult } from "@/components/OfficialAwardResult";
import { OfficialGroupStanding } from "@/components/OfficialGroupStanding";
import { OfficialMatchResult } from "@/components/OfficialMatchResult";
import { getMatchAwayName, getMatchHomeName, getMatchMeta } from "@/lib/matchDisplay";
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

export function UserProfilePredictions({ profile }: { profile: ProfileData }) {
  const { user, groupsData, knockoutData, awardsData, officialResults } = profile;
  const { teamMap, groups, matchPredictions, standingPredictions, bestThirdTeamIds } =
    groupsData;

  const bestThirdTeams = Object.values(teamMap).filter((t) =>
    bestThirdTeamIds.has(t.id)
  );

  return (
    <div className="space-y-8">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-emerald-300">Puntos totales</p>
            <p className="text-4xl font-black text-emerald-300">
              {user.score?.totalPoints ?? 0}
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-emerald-100">
            <span>Partidos: {user.score?.matchPoints ?? 0}</span>
            <span>Grupos: {user.score?.standingPoints ?? 0}</span>
            <span>3ºs: {user.score?.bestThirdPoints ?? 0}</span>
            <span>Premios: {user.score?.awardPoints ?? 0}</span>
            <span>Honor: {user.score?.bracketPoints ?? 0}</span>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
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
                Fase 2 enviada
                {user.phase2LockedAt &&
                  ` · ${user.phase2LockedAt.toLocaleDateString("es-ES")}`}
              </span>
            ) : (
              <span className="rounded-full bg-amber-500/20 px-3 py-1 text-amber-200">
                Fase 2 borrador
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
                          {pos}: {team?.name ?? "—"}
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
                  {team.name} ({team.code})
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
            {officialResults.officialThirdTeams.map((t) => t.name).join(", ")}
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
                    <span>{getMatchHomeName(match, knockoutData.teamMap)}</span>
                    <span className="font-bold text-emerald-300">
                      {p ? `${p.homeScore} - ${p.awayScore}` : "—"}
                    </span>
                    <span>{getMatchAwayName(match, knockoutData.teamMap)}</span>
                    {p && match.homeScore !== null && (
                      <span className="text-xs text-amber-200">+{p.points} pts</span>
                    )}
                  </div>
                  <OfficialMatchResult
                    match={match}
                    teamMap={knockoutData.teamMap}
                    prediction={p}
                  />
                </div>
              );
            })}
          </div>
        </Card>
      ))}

      {knockoutData.derivedBracket && (
        <Card title="Cuadro de honor (Fase 2 · automático)">
          <ul className="space-y-1 text-sm text-emerald-100">
            <li>
              🏆 Campeón:{" "}
              {knockoutData.derivedBracket.championTeamId
                ? teamMap[knockoutData.derivedBracket.championTeamId]?.name
                : "—"}
            </li>
            <li>
              🥈 Subcampeón:{" "}
              {knockoutData.derivedBracket.runnerUpTeamId
                ? teamMap[knockoutData.derivedBracket.runnerUpTeamId]?.name
                : "—"}
            </li>
            <li>
              🥉 3º:{" "}
              {knockoutData.derivedBracket.thirdPlaceTeamId
                ? teamMap[knockoutData.derivedBracket.thirdPlaceTeamId]?.name
                : "—"}
            </li>
            <li>
              4º:{" "}
              {knockoutData.derivedBracket.fourthPlaceTeamId
                ? teamMap[knockoutData.derivedBracket.fourthPlaceTeamId]?.name
                : "—"}
            </li>
          </ul>
          {knockoutData.finalBracket && knockoutData.finalBracket.points > 0 && (
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
  phase2Locked,
}: {
  phase1Locked: boolean;
  phase2Locked: boolean;
}) {
  return (
    <Card title="Rellena tus pronósticos">
      <div className="flex flex-wrap gap-3">
        {!phase1Locked && (
          <>
            <Link
              href="/grupos"
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950"
            >
              Grupos
            </Link>
            <Link
              href="/premios"
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950"
            >
              Premios
            </Link>
          </>
        )}
        {!phase2Locked && (
          <Link
            href="/eliminatorias"
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950"
          >
            Eliminatorias
          </Link>
        )}
      </div>
    </Card>
  );
}
