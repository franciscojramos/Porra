"use client";

import type { SnapshotExportData } from "@/lib/snapshot";
import { AdminImportResults } from "@/components/AdminImportResults";
import { AdminSnapshotDownload } from "@/components/AdminSnapshotDownload";

type Props = {
  snapshotData: SnapshotExportData;
};

export function AdminInicioTools({ snapshotData }: Props) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start">
      <AdminSnapshotDownload data={snapshotData} />
      <AdminImportResults />
    </div>
  );
}
