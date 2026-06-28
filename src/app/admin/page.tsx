import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin — Đăng nhập" };

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.app_metadata?.role === "admin") {
    redirect("/admin/submissions");
  }

  return <AdminLoginForm />;
}
