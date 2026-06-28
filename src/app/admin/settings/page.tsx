import { redirect } from "next/navigation";
import { AdminSecretsForm } from "@/components/admin/AdminSecretsForm";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin — Cài đặt AI" };

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin");
  if (user.app_metadata?.role !== "admin") {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-coral">Tài khoản không có quyền admin.</p>
      </div>
    );
  }

  return <AdminSecretsForm />;
}
