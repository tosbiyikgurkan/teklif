const pipelineColors: Record<string, string> = {
  DRAFT: "#94a3b8",
  SENT: "#3b82f6",
  APPROVED: "var(--theme-primary)",
  REJECTED: "#ef4444",
  EXPIRED: "#f97316",
};

export function QuotePipeline({
  items,
  total,
}: {
  items: { status: string; label: string; count: number }[];
  total: number;
}) {
  const sorted = [...items].sort((a, b) => b.count - a.count);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="font-semibold text-slate-900">Teklif Durumları</h2>
        <p className="text-sm text-slate-500">{total} teklif dağılımı</p>
      </div>

      {total === 0 ? (
        <p className="text-sm text-slate-500">Henüz teklif yok.</p>
      ) : (
        <>
          <div className="mb-5 flex h-3 overflow-hidden rounded-full bg-slate-100">
            {sorted.map((item) =>
              item.count > 0 ? (
                <div
                  key={item.status}
                  style={{
                    width: `${(item.count / total) * 100}%`,
                    background: pipelineColors[item.status] ?? "#cbd5e1",
                  }}
                  title={`${item.label}: ${item.count}`}
                />
              ) : null
            )}
          </div>
          <div className="space-y-2">
            {sorted.map((item) => (
              <div key={item.status} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      background: pipelineColors[item.status] ?? "#cbd5e1",
                    }}
                  />
                  <span className="text-slate-600">{item.label}</span>
                </div>
                <span className="font-semibold text-slate-900">{item.count}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
