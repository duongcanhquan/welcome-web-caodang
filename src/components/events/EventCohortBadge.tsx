/** Badge đợt/lớp — dùng chung admin + trang SV */
export function EventCohortBadge({
  batchLabel,
  classLabel,
  name,
  slug,
  size = "md",
}: {
  batchLabel?: string | null;
  classLabel?: string | null;
  name?: string | null;
  slug?: string | null;
  size?: "sm" | "md";
}) {
  const batch = (batchLabel || "").trim();
  const klass = (classLabel || "").trim();
  const fallback = (name || slug || "").trim();

  if (!batch && !klass && !fallback) return null;

  const pad = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm";

  return (
    <div
      className={`inline-flex max-w-full flex-wrap items-center gap-1.5 rounded-full border border-brand-navy/20 bg-brand-navy/10 font-semibold text-brand-navy ${pad}`}
      title={slug ? `Mã cây: ${slug}` : undefined}
    >
      {batch ? (
        <span className="truncate">
          <span className="opacity-70">Đợt</span> {batch}
        </span>
      ) : null}
      {batch && klass ? <span className="opacity-40">·</span> : null}
      {klass ? (
        <span className="truncate">
          <span className="opacity-70">Lớp</span> {klass}
        </span>
      ) : null}
      {!batch && !klass && fallback ? (
        <span className="truncate">{fallback}</span>
      ) : null}
    </div>
  );
}
