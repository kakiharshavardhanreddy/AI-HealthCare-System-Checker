import { AppShell } from "@/components/layout/app-shell";
import { ScannerClient } from "@/components/scanner/scanner-client";

export default function ScannerPage() {
  return (
    <AppShell>
      <ScannerClient />
    </AppShell>
  );
}
