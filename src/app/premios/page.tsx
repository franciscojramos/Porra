import { saveAwardPredictionAction } from "@/lib/actions";
import { getAwardsData } from "@/lib/data";
import { getOfficialResults } from "@/lib/official";
import { LockBanner, DraftBanner } from "@/components/LockBanner";
import { AwardPredictionForm } from "@/components/AwardPredictionForm";
import { OfficialAwardResult } from "@/components/OfficialAwardResult";
import { PageShell, Card } from "@/components/ui";
import { AwardCategory } from "@prisma/client";

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

export default async function PremiosPage() {
  const [{ predictions, locked, editable }, official] = await Promise.all([
    getAwardsData(),
    getOfficialResults(),
  ]);

  return (
    <PageShell
      title="Premios individuales"
      subtitle="Pronostica los ganadores de los premios individuales del Mundial."
    >
      <LockBanner locked={locked} phase="phase1" />
      {!locked && editable && <DraftBanner phase="phase1" />}
      <div className="grid gap-6 lg:grid-cols-2">
        {AWARDS.map((award) => (
          <Card key={award.category} title={award.title}>
            <OfficialAwardResult
              category={award.category}
              official={official.awards[award.category]}
              prediction={predictions[award.category]}
            />
            <AwardPredictionForm
              award={award}
              prediction={predictions[award.category]}
              action={editable ? saveAwardPredictionAction : undefined}
              editable={editable}
            />
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
