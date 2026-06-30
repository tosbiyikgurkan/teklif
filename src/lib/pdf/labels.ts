import { quoteStatusLabels } from "@/lib/labels";

export function getStatusLabel(status: string): string {
  return quoteStatusLabels[status] ?? status;
}
