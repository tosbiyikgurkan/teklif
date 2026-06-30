import { Plus } from "lucide-react";
import { getCustomerPageData } from "@/lib/actions/customers";
import { EmptyState } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import {
  CustomersHero,
  CustomersSummary,
} from "@/components/customers/CustomersSummary";
import { CustomerList } from "@/components/customers/CustomerList";

export default async function CustomersPage() {
  const { customers, stats } = await getCustomerPageData();

  return (
    <div className="max-w-[1400px]">
      <CustomersHero
        total={stats.total}
        action={
          <Button href="/musteriler/yeni">
            <Plus className="h-4 w-4" />
            Yeni Müşteri
          </Button>
        }
      />

      <CustomersSummary stats={stats} />

      {customers.length === 0 ? (
        <EmptyState
          title="Henüz müşteri yok"
          description="İlk müşterinizi ekleyerek cari takibine başlayın."
          action={
            <Button href="/musteriler/yeni">
              <Plus className="h-4 w-4" />
              Müşteri Ekle
            </Button>
          }
        />
      ) : (
        <CustomerList customers={customers} />
      )}
    </div>
  );
}
