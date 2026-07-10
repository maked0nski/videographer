import type { Localized } from "./locale";

/** Singleton document — site-wide settings not tied to Project or Profile. */
export interface SiteSettings {
  showreelUrl: string;
  contactCtaText: Localized<string>;
  seoTitle?: Localized<string>;
  seoDescription?: Localized<string>;
}

/** Locale-resolved shape handed to components. */
export interface ResolvedSiteSettings {
  showreelUrl: string;
  contactCtaText: string;
  seoTitle?: string;
  seoDescription?: string;
}
