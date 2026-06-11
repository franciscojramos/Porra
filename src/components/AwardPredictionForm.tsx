import { AwardCategory } from "@prisma/client";
import { PlayerSelect, SubmitButton } from "@/components/ui";
import { getPlayerOptionsForAward, normalizeStoredPlayer } from "@/lib/players";

type AwardConfig = {
  category: AwardCategory;
  title: string;
  description?: string;
  hasPodium: boolean;
};

export function AwardPredictionForm({
  award,
  prediction,
  action,
  editable,
  hiddenFields,
}: {
  award: AwardConfig;
  prediction?: { first: string | null; second: string | null; third: string | null } | null;
  action?: (formData: FormData) => void | Promise<void>;
  editable: boolean;
  hiddenFields?: Record<string, string>;
}) {
  const players = getPlayerOptionsForAward(award.category);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="category" value={award.category} />
      {hiddenFields &&
        Object.entries(hiddenFields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
      {award.description && <p className="text-sm text-emerald-100">{award.description}</p>}
      {award.hasPodium ? (
        <>
          <PlayerSelect
            name="first"
            label="1º goleador"
            players={players}
            defaultValue={normalizeStoredPlayer(prediction?.first ?? null, award.category)}
            disabled={!editable}
          />
          <PlayerSelect
            name="second"
            label="2º goleador"
            players={players}
            defaultValue={normalizeStoredPlayer(prediction?.second ?? null, award.category)}
            disabled={!editable}
          />
          <PlayerSelect
            name="third"
            label="3º goleador"
            players={players}
            defaultValue={normalizeStoredPlayer(prediction?.third ?? null, award.category)}
            disabled={!editable}
          />
        </>
      ) : (
        <PlayerSelect
          name="first"
          label="Ganador"
          players={players}
          defaultValue={normalizeStoredPlayer(prediction?.first ?? null, award.category)}
          disabled={!editable}
        />
      )}
      {editable && action && <SubmitButton label="Guardar" />}
    </form>
  );
}
