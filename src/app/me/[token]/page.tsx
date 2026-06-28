import { WaitingPageClient } from "@/components/waiting/WaitingPageClient";

export const metadata = {
  title: "Thần số học của bạn — Cây Khóa 2026",
};

export default async function MePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ leaf?: string; new?: string }>;
}) {
  const { token } = await params;
  const { leaf, new: isNew } = await searchParams;
  const leafNumber = leaf ? parseInt(leaf, 10) : undefined;

  return (
    <WaitingPageClient
      token={token}
      initialLeafNumber={leafNumber}
      isNewSubmission={isNew === "1"}
    />
  );
}
