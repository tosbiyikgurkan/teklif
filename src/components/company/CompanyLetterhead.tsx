import { Building2, Mail, Phone, MapPin } from "lucide-react";
import { getCompanyBranding } from "@/lib/actions/company-settings";
import { masterPrisma } from "@/lib/db/master";
import { requireSession } from "@/lib/auth/require";

export async function CompanyLetterhead() {
  const session = await requireSession();
  if (!session.companyId) return null;

  const [branding, company] = await Promise.all([
    getCompanyBranding(),
    masterPrisma.company.findUnique({
      where: { id: session.companyId },
      select: {
        taxNumber: true,
        email: true,
        phone: true,
        address: true,
        city: true,
      },
    }),
  ]);

  if (!company) return null;

  return (
    <div className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        {branding.logoPath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={branding.logoPath}
            alt={branding.name}
            className="h-14 max-w-[180px] object-contain"
          />
        ) : (
          <div
            className="flex h-14 w-14 items-center justify-center rounded-xl text-white"
            style={{ background: "var(--theme-primary)" }}
          >
            <Building2 className="h-7 w-7" />
          </div>
        )}
        <div>
          <h2 className="text-lg font-bold text-slate-900">{branding.name}</h2>
          {company.taxNumber && (
            <p className="text-xs text-slate-500">VKN: {company.taxNumber}</p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
        {company.city && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {company.city}
          </span>
        )}
        {company.phone && (
          <span className="flex items-center gap-1">
            <Phone className="h-3.5 w-3.5" />
            {company.phone}
          </span>
        )}
        {company.email && (
          <span className="flex items-center gap-1">
            <Mail className="h-3.5 w-3.5" />
            {company.email}
          </span>
        )}
      </div>
    </div>
  );
}
