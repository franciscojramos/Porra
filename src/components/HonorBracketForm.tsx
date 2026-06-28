import { saveUserFinalBracketAction } from "@/lib/actions";
import { SCORING_RULES } from "@/lib/scoring-config";
import { formatTeamDisplay } from "@/lib/teamFlags";
import { Card, SubmitButton, TeamSelect } from "@/components/ui";

type Team = { id: string; name: string; code: string };

type FinalBracket = {
  championTeamId: string | null;
  runnerUpTeamId: string | null;
  thirdPlaceTeamId: string | null;
  fourthPlaceTeamId: string | null;
  points: number;
} | null;

function honorPoints(key: string) {
  return SCORING_RULES.find((r) => r.key === key)?.points ?? 0;
}

function teamLabel(
  teamMap: Record<string, Team | undefined>,
  teamId: string | null | undefined
) {
  if (!teamId || !teamMap[teamId]) return "—";
  const t = teamMap[teamId]!;
  return formatTeamDisplay(t.name, t.code, { showCode: true });
}

export function HonorBracketForm({
  teams,
  teamMap,
  finalBracket,
  editable,
  locked,
  lockedAt,
  userId,
  adminEdit = false,
}: {
  teams: Team[];
  teamMap: Record<string, Team | undefined>;
  finalBracket: FinalBracket;
  editable: boolean;
  locked: boolean;
  lockedAt: Date | null;
  userId?: string;
  adminEdit?: boolean;
}) {
  const sortedTeams = [...teams].sort((a, b) => a.name.localeCompare(b.name, "es"));

  return (
    <Card title="Cuadro de honor">
      <p className="mb-4 text-sm text-emerald-100">
        Elige campeón, subcampeón, 3º y 4º puesto del Mundial. Solo puedes guardarlo{" "}
        <strong>una vez</strong>, durante los dieciseisavos, antes de que empiece el partido #73.
      </p>
      <ul className="mb-4 space-y-1 text-xs text-emerald-300">
        <li>Campeón · {honorPoints("bracket_champion")} pts</li>
        <li>Subcampeón · {honorPoints("bracket_runner_up")} pts</li>
        <li>3º puesto · {honorPoints("bracket_third")} pts</li>
        <li>4º puesto · {honorPoints("bracket_fourth")} pts</li>
      </ul>

      {locked && !adminEdit ? (
        <div className="space-y-3 rounded-xl border border-emerald-500/20 bg-emerald-950/40 p-4">
          <p className="text-sm font-medium text-emerald-100">Tu cuadro de honor (bloqueado)</p>
          {lockedAt && (
            <p className="text-xs text-emerald-400">
              Guardado el {lockedAt.toLocaleDateString("es-ES")} a las{" "}
              {lockedAt.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
          <dl className="grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="text-[10px] uppercase text-emerald-400">Campeón</dt>
              <dd className="text-sm text-white">
                {teamLabel(teamMap, finalBracket?.championTeamId)}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase text-emerald-400">Subcampeón</dt>
              <dd className="text-sm text-emerald-100">
                {teamLabel(teamMap, finalBracket?.runnerUpTeamId)}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase text-emerald-400">3º puesto</dt>
              <dd className="text-sm text-emerald-100">
                {teamLabel(teamMap, finalBracket?.thirdPlaceTeamId)}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase text-emerald-400">4º puesto</dt>
              <dd className="text-sm text-emerald-100">
                {teamLabel(teamMap, finalBracket?.fourthPlaceTeamId)}
              </dd>
            </div>
          </dl>
          {(finalBracket?.points ?? 0) > 0 && (
            <p className="text-xs text-amber-200">+{finalBracket!.points} pts</p>
          )}
        </div>
      ) : editable ? (
        <form action={saveUserFinalBracketAction} className="space-y-4">
          {adminEdit && userId && <input type="hidden" name="userId" value={userId} />}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <TeamSelect
              name="championTeamId"
              label="Campeón"
              teams={sortedTeams}
              defaultValue={finalBracket?.championTeamId ?? undefined}
            />
            <TeamSelect
              name="runnerUpTeamId"
              label="Subcampeón"
              teams={sortedTeams}
              defaultValue={finalBracket?.runnerUpTeamId ?? undefined}
            />
            <TeamSelect
              name="thirdPlaceTeamId"
              label="3º puesto"
              teams={sortedTeams}
              defaultValue={finalBracket?.thirdPlaceTeamId ?? undefined}
            />
            <TeamSelect
              name="fourthPlaceTeamId"
              label="4º puesto"
              teams={sortedTeams}
              defaultValue={finalBracket?.fourthPlaceTeamId ?? undefined}
            />
          </div>
          {!adminEdit && (
            <label className="flex items-start gap-2 text-sm text-emerald-100">
              <input type="checkbox" name="confirmed" required className="mt-1" />
              <span>
                Confirmo mi cuadro de honor y entiendo que{" "}
                <strong>no podré cambiarlo</strong> después de guardar.
              </span>
            </label>
          )}
          <SubmitButton
            label={
              adminEdit
                ? "Guardar cuadro de honor (admin)"
                : locked
                  ? "Actualizar cuadro de honor"
                  : "Guardar cuadro de honor (definitivo)"
            }
          />
        </form>
      ) : (
        <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          {locked
            ? "Cuadro de honor bloqueado."
            : "El plazo para el cuadro de honor era durante los dieciseisavos (antes del partido #73)."}
        </p>
      )}
    </Card>
  );
}
