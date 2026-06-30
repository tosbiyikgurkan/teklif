export type ServicePageSection = {
  id: string;
  title: string;
  content: string;
};

export type ServicePageImage = {
  id: string;
  path: string;
  caption?: string;
};

export type ServicePageContent = {
  enabled: boolean;
  title: string;
  subtitle: string;
  intro: string;
  highlights: string[];
  sections: ServicePageSection[];
  images: ServicePageImage[];
};

export const EMPTY_SERVICE_PAGE: ServicePageContent = {
  enabled: false,
  title: "",
  subtitle: "",
  intro: "",
  highlights: [],
  sections: [],
  images: [],
};

export function parseServicePageContent(raw: string | null | undefined): ServicePageContent {
  if (!raw) return { ...EMPTY_SERVICE_PAGE };
  try {
    const parsed = JSON.parse(raw) as Partial<ServicePageContent>;
    return {
      enabled: parsed.enabled ?? false,
      title: parsed.title ?? "",
      subtitle: parsed.subtitle ?? "",
      intro: parsed.intro ?? "",
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
      sections: Array.isArray(parsed.sections) ? parsed.sections : [],
      images: Array.isArray(parsed.images) ? parsed.images : [],
    };
  } catch {
    return { ...EMPTY_SERVICE_PAGE };
  }
}

export function serializeServicePageContent(content: ServicePageContent): string {
  return JSON.stringify(content);
}

export function createId(): string {
  return Math.random().toString(36).slice(2, 11);
}
