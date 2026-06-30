export const quoteStatusLabels: Record<string, string> = {
  DRAFT: "Taslak",
  SENT: "Gönderildi",
  APPROVED: "Onaylandı",
  REJECTED: "Reddedildi",
  EXPIRED: "Süresi Doldu",
};

export const invoiceStatusLabels: Record<string, string> = {
  DRAFT: "Taslak",
  SENT: "Gönderildi",
  PAID: "Ödendi",
  PARTIAL: "Kısmi Ödeme",
  OVERDUE: "Gecikmiş",
  CANCELLED: "İptal",
};

export const serviceStatusLabels: Record<string, string> = {
  PLANNED: "Planlandı",
  IN_PROGRESS: "Devam Ediyor",
  COMPLETED: "Tamamlandı",
  ON_HOLD: "Beklemede",
};

export const priorityLabels: Record<string, string> = {
  LOW: "Düşük",
  MEDIUM: "Orta",
  HIGH: "Yüksek",
  URGENT: "Acil",
};

export const transactionTypeLabels: Record<string, string> = {
  DEBIT: "Borç",
  CREDIT: "Alacak",
};

export const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Sistem Yöneticisi",
  COMPANY_ADMIN: "Firma Yöneticisi",
  USER: "Kullanıcı",
};
