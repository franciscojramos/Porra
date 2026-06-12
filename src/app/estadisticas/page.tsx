import { PageShell } from "@/components/ui";
import { StatisticsView } from "@/components/StatisticsView";
import { getStatisticsPageData } from "@/lib/statistics";

export default async function EstadisticasPage() {
  const data = await getStatisticsPageData();

  return (
    <PageShell title="Estadísticas">
      <StatisticsView awardStats={data.awardStats} goalStats={data.goalStats} />
    </PageShell>
  );
}
