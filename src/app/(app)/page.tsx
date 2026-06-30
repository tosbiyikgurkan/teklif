import {
  Users,
  FileText,
  Receipt,
  TrendingUp,
  CheckCircle2,
  PieChart,
} from "lucide-react";
import { requireTenant } from "@/lib/auth/require";
import { getDashboardStats } from "@/lib/actions/dashboard";
import { formatCurrency } from "@/lib/utils";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { DashboardStatGrid } from "@/components/dashboard/DashboardStatGrid";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { QuotePipeline } from "@/components/dashboard/QuotePipeline";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import {
  FinanceInsights,
  CatalogPreview,
} from "@/components/dashboard/FinanceInsights";

export default async function DashboardPage() {
  const [{ session }, stats] = await Promise.all([
    requireTenant(),
    getDashboardStats(),
  ]);

  return (
    <div className="max-w-[1400px]">
      <DashboardHero
        userName={session.name}
        companyName={session.companyName || "Firmanız"}
        thisMonthRevenue={stats.thisMonthRevenue}
        newQuotesThisMonth={stats.newQuotesThisMonth}
        newCustomersThisMonth={stats.newCustomersThisMonth}
      />

      <DashboardStatGrid
        items={[
          {
            title: "Toplam Gelir",
            value: formatCurrency(stats.totalRevenue),
            hint: `Bu ay ${formatCurrency(stats.thisMonthRevenue)}`,
            icon: TrendingUp,
          },
          {
            title: "Müşteriler",
            value: String(stats.customerCount),
            hint: `+${stats.newCustomersThisMonth} bu ay`,
            icon: Users,
          },
          {
            title: "Teklifler",
            value: String(stats.quoteCount),
            hint: `${stats.approvedQuoteCount} onaylı`,
            icon: FileText,
          },
          {
            title: "Faturalar",
            value: String(stats.invoiceCount),
            hint: `%${stats.collectionRate} tahsilat`,
            icon: Receipt,
            accent: stats.overdueCount > 0 ? "warning" : "default",
          },
        ]}
      />

      <div className="mb-8">
        <FinanceInsights
          pendingInvoiceCount={stats.pendingInvoiceCount}
          pendingInvoiceTotal={stats.pendingInvoiceTotal}
          totalReceivable={stats.totalReceivable}
          overdueCount={stats.overdueCount}
          openQuoteValue={stats.openQuoteValue}
          collectionRate={stats.collectionRate}
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={stats.monthlyRevenue} maxAmount={stats.maxMonthly} />
        </div>
        <QuotePipeline items={stats.quotePipeline} total={stats.quoteCount} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-6">
          <ActivityFeed items={stats.recentActivity} />
        </div>
        <div className="space-y-6">
          <QuickActions />
          <CatalogPreview services={stats.catalogServices} />

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <PieChart className="h-4 w-4 text-[var(--theme-primary)]" />
              <h2 className="font-semibold text-slate-900">Fatura Durumları</h2>
            </div>
            <div className="space-y-2">
              {stats.invoiceSummary.length === 0 ? (
                <p className="text-sm text-slate-500">Henüz fatura yok.</p>
              ) : (
                stats.invoiceSummary.map((item) => (
                  <div
                    key={item.status}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                  >
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-semibold text-slate-900">{item.count}</span>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-[var(--theme-primary-light)] px-3 py-2 text-sm text-[var(--theme-primary-dark)]">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                {stats.serviceCount} hizmet kataloğunda tanımlı
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
