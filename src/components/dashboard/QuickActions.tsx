import Link from "next/link";
import { Plus, Users, FileText, Receipt, Wrench } from "lucide-react";

const actions = [
  {
    href: "/teklifler/yeni",
    label: "Yeni Teklif",
    icon: FileText,
    description: "Müşteriye teklif hazırla",
  },
  {
    href: "/faturalar/yeni",
    label: "Yeni Fatura",
    icon: Receipt,
    description: "Fatura oluştur",
  },
  {
    href: "/musteriler/yeni",
    label: "Müşteri Ekle",
    icon: Users,
    description: "Cari kaydı aç",
  },
  {
    href: "/hizmetler/yeni",
    label: "Hizmet Ekle",
    icon: Wrench,
    description: "Kataloğa tanım ekle",
  },
];

export function QuickActions() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">Hızlı İşlemler</h2>
        <Plus className="h-4 w-4 text-[var(--theme-primary)]" />
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group flex items-center gap-3 rounded-lg border border-slate-100 p-3 transition-colors hover:border-[var(--theme-primary-muted)] hover:bg-[var(--theme-primary-light)]/40"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--theme-primary-light)] text-[var(--theme-primary)] transition-colors group-hover:bg-[var(--theme-primary)] group-hover:text-white">
              <action.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{action.label}</p>
              <p className="text-xs text-slate-500">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
