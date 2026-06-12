import type { AwardStatBlock, StatRow } from "@/lib/statistics";
import { Card } from "@/components/ui";

function StatBarList({
  rows,
  unitLabel,
  emptyMessage,
}: {
  rows: StatRow[];
  unitLabel: string;
  emptyMessage: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-emerald-300">{emptyMessage}</p>;
  }

  const max = rows[0]?.count ?? 1;

  return (
    <ul className="space-y-2">
      {rows.map((row, index) => (
        <li key={`${row.label}-${index}`} className="rounded-xl bg-emerald-950/40 px-3 py-2">
          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-white">
              <span className="mr-2 text-emerald-400">{index + 1}.</span>
              {row.label}
            </span>
            <span className="shrink-0 text-emerald-300">
              {row.count} {row.count === 1 ? unitLabel : `${unitLabel}s`}
              <span className="ml-2 text-xs text-emerald-400">({row.percent}%)</span>
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-emerald-950">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${Math.max(8, (row.count / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function StatisticsView({
  awardStats,
  goalStats,
}: {
  awardStats: AwardStatBlock[];
  goalStats: Awaited<
    ReturnType<typeof import("@/lib/statistics").getRealGoalScorerStats>
  >;
}) {
  return (
    <div className="space-y-8">
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-white">Pronósticos · Premios</h2>

        {awardStats.map((block) => (
          <Card key={block.category} title={block.title}>
            <div className="space-y-5">
              {block.slots.map((slot) => (
                <div key={slot.slotLabel}>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-300">
                    {slot.slotLabel}
                    {slot.voters > 0 && (
                      <span className="ml-2 font-normal normal-case text-emerald-400">
                        · {slot.voters} pronóstico{slot.voters === 1 ? "" : "s"}
                      </span>
                    )}
                  </h3>
                  <StatBarList
                    rows={slot.rows}
                    unitLabel="voto"
                    emptyMessage="Nadie ha pronosticado este premio aún."
                  />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">Torneo real · Goleadores</h2>

        <Card title="Top 10 goleadores">
          <StatBarList
            rows={goalStats.scorers}
            unitLabel="gol"
            emptyMessage="Aún no hay goleadores registrados."
          />
        </Card>
      </section>
    </div>
  );
}
