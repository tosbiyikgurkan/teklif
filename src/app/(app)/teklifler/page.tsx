import { Plus } from "lucide-react";
import { getQuotePageData } from "@/lib/actions/quotes";
import { EmptyState } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { QuotesHero, QuotesSummary } from "@/components/quotes/QuotesSummary";
import { QuoteList } from "@/components/quotes/QuoteList";

export default async function QuotesPage() {
  const { quotes, stats } = await getQuotePageData();

  return (
    <div className="max-w-[1400px]">
      <QuotesHero
        total={stats.total}
        action={
          <Button href="/teklifler/yeni">
            <Plus className="h-4 w-4" />
            Yeni Teklif
          </Button>
        }
      />

      <QuotesSummary stats={stats} />

      {quotes.length === 0 ? (
        <EmptyState
          title="Henüz teklif yok"
          description="İlk teklifinizi oluşturarak müşterilerinize fiyat sunmaya başlayın."
          action={
            <Button href="/teklifler/yeni">
              <Plus className="h-4 w-4" />
              Teklif Oluştur
            </Button>
          }
        />
      ) : (
        <QuoteList quotes={quotes} />
      )}
    </div>
  );
}
