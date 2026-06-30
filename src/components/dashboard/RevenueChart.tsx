import { formatCurrency } from "@/lib/utils";

export function RevenueChart({
  data,
  maxAmount,
}: {
  data: { label: string; amount: number }[];
  maxAmount: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-6">
        <h2 className="font-semibold text-slate-900">Aylık Tahsilat</h2>
        <p className="text-sm text-slate-500">Son 6 ay ödenen tutarlar (TRY)</p>
      </div>
      <div className="flex h-44 items-end justify-between gap-2">
        {data.map((month) => {
          const height = maxAmount > 0 ? (month.amount / maxAmount) * 100 : 0;
          return (
            <div key={month.label} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-[10px] font-medium text-slate-600">
                {month.amount > 0
                  ? formatCurrency(month.amount).replace("₺", "").trim()
                  : "—"}
              </span>
              <div className="relative flex w-full max-w-[48px] flex-1 items-end">
                <div
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${Math.max(height, month.amount > 0 ? 8 : 4)}%`,
                    background:
                      month.amount > 0
                        ? "linear-gradient(180deg, var(--theme-primary) 0%, var(--theme-primary-hover) 100%)"
                        : "#e2e8f0",
                  }}
                />
              </div>
              <span className="text-[10px] text-slate-500">{month.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
