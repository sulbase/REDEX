import type { VolumeRow } from "@/lib/pricing";

export function VolumePrices({
  rows,
}: {
  rows: VolumeRow[];
  currency?: string | null;
}) {
  if (!rows.length) return null;
  const money = rows[0]?.kind === "money";

  return (
    <div className="mt-6 border border-border">
      <p className="border-b border-border bg-muted px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {money ? "Descuento por monto" : "Precios por volumen"}
      </p>
      <ul>
        {rows.map((row) => (
          <li
            key={row.key}
            className="flex items-baseline justify-between gap-4 border-b border-border px-4 py-2.5 text-sm last:border-b-0"
          >
            <span className="text-muted-foreground">{row.threshold}</span>
            <span className="text-right">
              {row.price ? (
                <span className="font-medium tabular-nums text-foreground">
                  {row.price}
                </span>
              ) : null}
              <span className={`${row.price ? "ml-2" : ""} text-xs text-primary`}>
                {row.off}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
