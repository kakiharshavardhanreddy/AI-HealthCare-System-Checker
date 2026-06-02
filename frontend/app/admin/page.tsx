import { AdminClient } from "@/components/admin/admin-client";
import { AppShell } from "@/components/layout/app-shell";

export default function AdminPage() {
  return (
    <AppShell adminOnly>
      <AdminClient />
    </AppShell>
  );
}
