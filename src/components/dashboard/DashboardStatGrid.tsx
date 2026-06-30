import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type StatItem = {
  title: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  accent?: "default" | "warning" | "info";
};

const accentStyles = {
  default: {
    icon: "bg-[var(--theme-primary-light)] text-[var(--theme-primary)]",
    bar: "bg-[var(--theme-primary)]",
  },
  warning: {
    icon: "bg-amber-50 text-amber-600",
    bar: "bg-amber-500",
  },
  info: {
    icon: "bg-blue-50 text-blue-600",
    bar: "bg-blue-500",
  },
};

export function DashboardStatGrid({ items }: { items: StatItem[] }) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const accent = accentStyles[item.accent ?? "default"];
        const Icon = item.icon;
        return (
          <div
            key={item.title}
            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className={cn("absolute left-0 top-0 h-1 w-full", accent.bar)} />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-500">{item.title}</p>
                <p className="mt-2 truncate text-2xl font-bold text-slate-900">
                  {item.value}
                </p>
                {item.hint && (
                  <p className="mt-1 text-xs text-slate-400">{item.hint}</p>
                )}
              </div>
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                  accent.icon
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
