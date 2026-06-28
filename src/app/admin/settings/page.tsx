import { redirect } from "next/navigation";

/** Chuyển sang dashboard tab Cài đặt AI */
export default function AdminSettingsRedirect() {
  redirect("/admin/submissions?tab=cai-dat");
}
