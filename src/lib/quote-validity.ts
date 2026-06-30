export type ValidityState = "none" | "active" | "expiring" | "expired";

export function getQuoteValidity(
  validUntil: Date | null,
  status: string
): { state: ValidityState; label: string; daysLeft: number | null } {
  if (!validUntil) {
    return { state: "none", label: "Belirtilmemiş", daysLeft: null };
  }

  if (status === "APPROVED" || status === "REJECTED") {
    return {
      state: "active",
      label: "Tamamlandı",
      daysLeft: null,
    };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const end = new Date(validUntil);
  end.setHours(0, 0, 0, 0);
  const diffMs = end.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return { state: "expired", label: "Süresi doldu", daysLeft };
  }
  if (daysLeft <= 7) {
    return {
      state: "expiring",
      label: daysLeft === 0 ? "Bugün sona eriyor" : `${daysLeft} gün kaldı`,
      daysLeft,
    };
  }
  return { state: "active", label: `${daysLeft} gün geçerli`, daysLeft };
}
