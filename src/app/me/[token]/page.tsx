import { WaitingPageClient } from "@/components/waiting/WaitingPageClient";

export const metadata = {
  title: "Chờ lá nở — Cây Khóa 2026",
};

export default async function MePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ leaf?: string }>;
}) {
  const { token } = await params;
  const { leaf } = await searchParams;
  const leafNumber = leaf ? parseInt(leaf, 10) : undefined;

  return <WaitingPageClient token={token} initialLeafNumber={leafNumber} />;
}
