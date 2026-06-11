import { AwardCategory } from "@prisma/client";
import { PlayerSelect, SubmitButton } from "@/components/ui";
import { getPlayerOptionsForAward, normalizeStoredPlayer } from "@/lib/players";

const AWARD_LABELS: Record<AwardCategory, string> = {
  GOLDEN_BALL: "Balón de Oro",
  GOLDEN_BOOT: "Bota de Oro",
  GOLDEN_GLOVE: "Guante de Oro",
  BEST_YOUNG: "Mejor jugador joven",
};

export function OfficialAwardForm({
  category,
  official,
  action,
}: {
  category: AwardCategory;
  official?: { first: string | null; second: string | null; third: string | null } | null;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const hasPodium = category === "GOLDEN_BOOT";
  const players = getPlayerOptionsForAward(category);

  return (
    <form action={action} className="space-y-2 rounded-xl bg-emerald-950/30 p-4">
      <input type="hidden" name="category" value={category} />
      <h3 className="font-semibold">{AWARD_LABELS[category]}</h3>
      {hasPodium ? (
        <>
          <PlayerSelect
            name="first"
            label="1º"
            players={players}
            defaultValue={normalizeStoredPlayer(official?.first ?? null, category)}
          />
          <PlayerSelect
            name="second"
            label="2º"
            players={players}
            defaultValue={normalizeStoredPlayer(official?.second ?? null, category)}
          />
          <PlayerSelect
            name="third"
            label="3º"
            players={players}
            defaultValue={normalizeStoredPlayer(official?.third ?? null, category)}
          />
        </>
      ) : (
        <PlayerSelect
          name="first"
          label="Ganador"
          players={players}
          defaultValue={normalizeStoredPlayer(official?.first ?? null, category)}
        />
      )}
      <SubmitButton label="Guardar premio" />
    </form>
  );
}
