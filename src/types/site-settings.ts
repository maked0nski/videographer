import type { Localized } from "./locale";

/** Singleton document — site-wide settings not tied to Project or Profile. */
export interface SiteSettings {
  showreelUrl: string;
  contactCtaText: Localized<string>;
  seoTitle?: Localized<string>;
  seoDescription?: Localized<string>;
  navHomeLabel: Localized<string>;
  navWorkLabel: Localized<string>;
  navAboutLabel: Localized<string>;
  footerRightsText: Localized<string>;
  watchShowreelLabel: Localized<string>;
  selectedWorkHeading: Localized<string>;
  viewAllWorkLabel: Localized<string>;
  photographyHeading: Localized<string>;
  viewPhotographyLabel: Localized<string>;
  contactCtaButtonLabel: Localized<string>;
  workPageHeading: Localized<string>;
  filterAllLabel: Localized<string>;
  filterFilmsLabel: Localized<string>;
  filterPhotographyLabel: Localized<string>;
  behindTheScenesHeading: Localized<string>;
  previousProjectLabel: Localized<string>;
  nextProjectLabel: Localized<string>;
  yearFieldLabel: Localized<string>;
  locationFieldLabel: Localized<string>;
  roleFieldLabel: Localized<string>;
  producerDirectorFieldLabel: Localized<string>;
  recognitionFieldLabel: Localized<string>;
  aboutPageHeading: Localized<string>;
  aboutContactHeading: Localized<string>;
}

/** Locale-resolved shape handed to components. */
export interface ResolvedSiteSettings {
  showreelUrl: string;
  contactCtaText: string;
  seoTitle?: string;
  seoDescription?: string;
  navHomeLabel: string;
  navWorkLabel: string;
  navAboutLabel: string;
  footerRightsText: string;
  watchShowreelLabel: string;
  selectedWorkHeading: string;
  viewAllWorkLabel: string;
  photographyHeading: string;
  viewPhotographyLabel: string;
  contactCtaButtonLabel: string;
  workPageHeading: string;
  filterAllLabel: string;
  filterFilmsLabel: string;
  filterPhotographyLabel: string;
  behindTheScenesHeading: string;
  previousProjectLabel: string;
  nextProjectLabel: string;
  yearFieldLabel: string;
  locationFieldLabel: string;
  roleFieldLabel: string;
  producerDirectorFieldLabel: string;
  recognitionFieldLabel: string;
  aboutPageHeading: string;
  aboutContactHeading: string;
}
