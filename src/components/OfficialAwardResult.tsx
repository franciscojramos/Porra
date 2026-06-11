import { ReactNode } from "react";
import { AwardCategory } from "@prisma/client";

const AWARD_LABELS: Record<AwardCategory, string> = {
  GOLDEN_BALL: "Balón de Oro",
  GOLDEN_BOOT: "Bota de Oro",
  GOLDEN_GLOVE: "Guante de Oro",
  BEST_YOUNG: "Mejor jugador joven",
};

export function OfficialAwardResult({
  category,
  official,
  prediction,
}: {
  category: AwardCategory;
  official?: {
    first: string | null;
    second: string | null;
    third: string | null;
  } | null;
  prediction?: {
    first: string | null;
    second: string | null;
    third: string | null;
    points: number;
  } | null;
}) {
  if (!official?.first && !official?.second && !official?.third) return null;

  return (
    <div className="mb-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-sm">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
          Resultado oficial
        </p>
        {prediction !== undefined && prediction !== null && prediction.points > 0 && (
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-200">
            +{prediction.points} pts
          </span>
        )}
      </div>
      {category === "GOLDEN_BOOT" ? (
        <ul className="space-y-0.5 text-emerald-100">
          <li>1º: {official.first || "—"}</li>
          <li>2º: {official.second || "—"}</li>
          <li>3º: {official.third || "—"}</li>
        </ul>
      ) : (
        <p className="text-emerald-100">{official.first || "—"}</p>
      )}
    </div>
  );
}

export function OfficialAwardsSummary({
  awards,
}: {
  awards: Partial<
    Record<
      AwardCategory,
      { first: string | null; second: string | null; third: string | null }
    >
  >;
}) {
  const entries = (Object.keys(AWARD_LABELS) as AwardCategory[]).filter(
    (c) => awards[c]?.first || awards[c]?.second || awards[c]?.third
  );

  if (entries.length === 0) return null;

  return (
    <CardLike title="Premios oficiales del torneo">
      <div className="grid gap-3 sm:grid-cols-2">
        {entries.map((category) => (
          <div key={category} className="rounded-lg bg-emerald-950/40 p-3 text-sm">
            <p className="font-semibold text-emerald-300">{AWARD_LABELS[category]}</p>
            {category === "GOLDEN_BOOT" ? (
              <ul className="mt-1 space-y-0.5 text-emerald-100">
                <li>1º: {awards[category]?.first || "—"}</li>
                <li>2º: {awards[category]?.second || "—"}</li>
                <li>3º: {awards[category]?.third || "—"}</li>
              </ul>
            ) : (
              <p className="mt-1 text-emerald-100">{awards[category]?.first || "—"}</p>
            )}
          </div>
        ))}
      </div>
    </CardLike>
  );
}

function CardLike({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h2 className="mb-4 text-lg font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
}
