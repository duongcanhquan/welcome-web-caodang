"use client";

import { AdminSecretsForm } from "@/components/admin/AdminSecretsForm";
import {
  AdminEventOverview,
  type EventSettingsSnapshot,
} from "@/components/admin/AdminEventOverview";

interface AdminSettingsClientProps {
  eventSnapshot: EventSettingsSnapshot | null;
}

export function AdminSettingsClient({ eventSnapshot }: AdminSettingsClientProps) {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 px-4 py-10">
      {eventSnapshot ? (
        <AdminEventOverview
          settings={eventSnapshot}
          aiEnabled={eventSnapshot.aiEnabled}
          hasApiKey={eventSnapshot.hasApiKey}
        />
      ) : (
        <p className="rounded-card bg-coral/10 px-4 py-3 text-sm text-coral">
          Chưa kết nối Supabase hoặc chưa chạy migration — xem .env và SQL seed.
        </p>
      )}
      <AdminSecretsForm />
    </div>
  );
}
