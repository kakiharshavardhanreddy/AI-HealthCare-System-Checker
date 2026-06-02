import { HistoryClient } from "@/components/history/history-client";
import { AppShell } from "@/components/layout/app-shell";

export default function HistoryPage() {
  return (
    <AppShell>
      <HistoryClient />
    </AppShell>
  );
}
