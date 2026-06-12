import { AwardCategory } from "@prisma/client";
import { saveAllAwardsAction } from "@/lib/actions";
import { OfficialAwardResult } from "@/components/OfficialAwardResult";
import { Card, PlayerSelect, SubmitButton } from "@/components/ui";
import { getPlayerOptionsForAward, normalizeStoredPlayer } from "@/lib/players";
import type { getAwardsData } from "@/lib/data";
import type { getOfficialResults } from "@/lib/official";

const AWARDS: {
  category: AwardCategory;
  title: string;
  description: string;
  hasPodium: boolean;
}[] = [
  {
    category: "GOLDEN_BALL",
    title: "Balón de Oro",
    description: "Mejor jugador del torneo — elige entre todos los convocados.",
    hasPodium: false,
  },
  {
    category: "GOLDEN_BOOT",
    title: "Bota de Oro",
    description: "Máximos goleadores (1º, 2º y 3º) — jugadores de campo.",
    hasPodium: true,
  },
  {
    category: "GOLDEN_GLOVE",
    title: "Guante de Oro",
    description: "Mejor portero del torneo.",
    hasPodium: false,
  },
  {
    category: "BEST_YOUNG",
    title: "Mejor jugador joven",
    description: "Jugadores nacidos en 2005 o después.",
    hasPodium: false,
  },
];

type Props = {
  awardsData: Awaited<ReturnType<typeof getAwardsData>>;
  official: Awaited<ReturnType<typeof getOfficialResults>>;
  editable: boolean;
  userId?: string;
};

export function Phase1AwardsForm({ awardsData, official, editable, userId }: Props) {
  const { predictions } = awardsData;
  const saveAction = editable ? saveAllAwardsAction : undefined;

  return (
    <form action={saveAction} className="space-y-6">
      {userId && <input type="hidden" name="userId" value={userId} />}

      <div className="grid gap-6 lg:grid-cols-2">
        {AWARDS.map((award) => {
          const prediction = predictions[award.category];
          const players = getPlayerOptionsForAward(award.category);

          return (
            <Card key={award.category} title={award.title}>
              <OfficialAwardResult
                category={award.category}
                official={official.awards[award.category]}
                prediction={prediction}
              />
              <p className="mb-4 text-sm text-emerald-100">{award.description}</p>
              {award.hasPodium ? (
                <div className="space-y-3">
                  <PlayerSelect
                    name={`${award.category}_first`}
                    label="1º goleador"
                    players={players}
                    defaultValue={normalizeStoredPlayer(prediction?.first ?? null, award.category)}
                    disabled={!editable}
                  />
                  <PlayerSelect
                    name={`${award.category}_second`}
                    label="2º goleador"
                    players={players}
                    defaultValue={normalizeStoredPlayer(prediction?.second ?? null, award.category)}
                    disabled={!editable}
                  />
                  <PlayerSelect
                    name={`${award.category}_third`}
                    label="3º goleador"
                    players={players}
                    defaultValue={normalizeStoredPlayer(prediction?.third ?? null, award.category)}
                    disabled={!editable}
                  />
                </div>
              ) : (
                <PlayerSelect
                  name={`${award.category}_first`}
                  label="Ganador"
                  players={players}
                  defaultValue={normalizeStoredPlayer(prediction?.first ?? null, award.category)}
                  disabled={!editable}
                />
              )}
            </Card>
          );
        })}
      </div>

      {editable && saveAction && (
        <div className="border-t border-white/10 pt-6">
          <SubmitButton label="Guardar todo" />
        </div>
      )}
    </form>
  );
}
