import type { Project, Profile, SiteSettings } from "@/types";

/**
 * Real launch content (constitution Development Workflow: real content before
 * CMS wiring), assembled from `info/roadmap-yerrmak-portfolio-updated.md` and
 * the brief provided for this feature. Fields marked `TODO(owner)` are facts
 * this build could not verify against the live yerrmakov.wixsite.com/yerrmak
 * site (no fetch access) — replace them during the Sanity content migration
 * (tasks.md T056), not before.
 *
 * This module is the sole seed-data source; `src/lib/content/queries.ts`
 * reads it directly for Stories 1-5, then Story 6 swaps that file's
 * implementation to Sanity queries behind the same function signatures.
 */

const image = (path: string, alt: string, width: number, height: number) => ({
  url: path,
  alt,
  width,
  height,
});

export const projects: Project[] = [
  {
    slug: "the-withshaw-case",
    type: "video",
    title: { en: "The Withshaw Case", uk: "The Withshaw Case" },
    year: "2023", // TODO(owner): confirm exact year
    location: "United Kingdom", // TODO(owner): confirm shoot location
    role: { en: "Cinematographer", uk: "Оператор-постановник" }, // TODO(owner): confirm exact role
    description: {
      en: "Short thriller-drama film.",
      uk: "Короткометражний трилер-драма.",
    },
    coverImage: image(
      "/projects/the-withshaw-case/cover.svg",
      "The Withshaw Case cover",
      1600,
      1000,
    ),
    youtubeUrl: "https://www.youtube.com/watch?v=TODO_WITHSHAW_CASE", // TODO(owner): real link
    gallery: [
      image("/projects/the-withshaw-case/bts-1.svg", "Behind the scenes 1", 1600, 1000),
      image("/projects/the-withshaw-case/bts-2.svg", "Behind the scenes 2", 1600, 1000),
    ],
    order: 1,
    featured: true,
    published: true,
  },
  {
    slug: "fusion-fever",
    type: "video",
    title: { en: "Fusion – Fever", uk: "Fusion – Fever" },
    year: "2023", // TODO(owner): confirm exact year
    location: "United Kingdom", // TODO(owner): confirm shoot location
    role: { en: "Director of Photography", uk: "Оператор-постановник (DP)" },
    description: {
      en: "Music video, shot as Director of Photography.",
      uk: "Музичне відео, зняте на посаді оператора-постановника (DP).",
    },
    coverImage: image("/projects/fusion-fever/cover.svg", "Fusion – Fever cover", 1600, 1000),
    youtubeUrl: "https://www.youtube.com/watch?v=TODO_FUSION_FEVER", // TODO(owner): real link
    order: 2,
    featured: true,
    published: true,
  },
  {
    slug: "beerex-beer-festival",
    type: "video",
    title: { en: "BEEREX — Beer Festival", uk: "BEEREX — Beer Festival" },
    year: "2023", // TODO(owner): confirm exact year
    location: "United Kingdom", // TODO(owner): confirm shoot location
    role: { en: "Videographer", uk: "Відеограф" }, // TODO(owner): confirm exact role
    description: {
      en: "Promotional video for the BEEREX beer festival.",
      uk: "Промо-відео для пивного фестивалю BEEREX.",
    },
    coverImage: image(
      "/projects/beerex-beer-festival/cover.svg",
      "BEEREX Beer Festival cover",
      1600,
      1000,
    ),
    youtubeUrl: "https://www.youtube.com/watch?v=TODO_BEEREX", // TODO(owner): real link
    order: 3,
    featured: true,
    published: true,
  },
  {
    slug: "first-glimpse",
    type: "video",
    title: { en: "First Glimpse", uk: "First Glimpse" },
    year: "2022", // TODO(owner): confirm exact year
    location: "United Kingdom", // TODO(owner): confirm shoot location
    role: { en: "Director", uk: "Режисер" }, // TODO(owner): confirm exact role
    description: {
      en: "Experimental short film.",
      uk: "Експериментальна короткометражка.",
    },
    coverImage: image("/projects/first-glimpse/cover.svg", "First Glimpse cover", 1600, 1000),
    youtubeUrl: "https://www.youtube.com/watch?v=TODO_FIRST_GLIMPSE", // TODO(owner): real link
    order: 4,
    featured: false,
    published: true,
  },
  {
    slug: "buried-in-me",
    type: "video",
    title: { en: "Buried In Me", uk: "Buried In Me" },
    year: "2022", // TODO(owner): confirm exact year
    location: "United Kingdom", // TODO(owner): confirm shoot location
    role: { en: "Director of Photography", uk: "Оператор-постановник (DP)" },
    description: {
      en: "Short crime-drama film, shot as Director of Photography.",
      uk: "Короткометражна кримінальна драма, знята на посаді оператора-постановника (DP).",
    },
    coverImage: image("/projects/buried-in-me/cover.svg", "Buried In Me cover", 1600, 1000),
    youtubeUrl: "https://www.youtube.com/watch?v=TODO_BURIED_IN_ME", // TODO(owner): real link
    order: 5,
    featured: true,
    published: true,
  },
  {
    slug: "yara-steel",
    type: "video",
    title: { en: "YARA — Steel", uk: "YARA — Сталь" },
    year: "2021", // TODO(owner): confirm exact year
    location: "United Kingdom", // TODO(owner): confirm shoot location
    role: { en: "Cinematographer", uk: "Оператор-постановник" }, // TODO(owner): confirm exact role
    recognition: {
      en: "200,000+ views on YouTube",
      uk: "200 000+ переглядів на YouTube",
    },
    description: {
      en: "Music video with over 200,000 views.",
      uk: "Музичне відео з понад 200 000 переглядів.",
    },
    coverImage: image("/projects/yara-steel/cover.svg", "YARA — Steel cover", 1600, 1000),
    youtubeUrl: "https://www.youtube.com/watch?v=TODO_YARA_STEEL", // TODO(owner): real link
    gallery: [
      image("/projects/yara-steel/bts-1.svg", "Behind the scenes 1", 1600, 1000),
      image("/projects/yara-steel/bts-2.svg", "Behind the scenes 2", 1600, 1000),
    ],
    order: 6,
    featured: true,
    published: true,
  },
  {
    // Not one of the six real launch films — a placeholder photo project so
    // the Photography filter/preview/lightbox are exercisable pre-launch
    // (spec Assumptions: "no photo gallery on the current site yet"). Replace
    // with the owner's first real photo set during content migration.
    slug: "coastal-frames",
    type: "photo",
    title: { en: "Coastal Frames", uk: "Прибережні кадри" },
    year: "2024",
    location: "United Kingdom",
    role: { en: "Photographer", uk: "Фотограф" },
    description: {
      en: "A small set of coastal and landscape photography.",
      uk: "Невелика добірка прибережної та пейзажної фотографії.",
    },
    coverImage: image("/projects/coastal-frames/cover.svg", "Coastal Frames cover", 1600, 1000),
    gallery: [
      image("/projects/coastal-frames/photo-1.svg", "Coastal Frames photo 1", 1400, 1750),
      image("/projects/coastal-frames/photo-2.svg", "Coastal Frames photo 2", 1400, 1750),
      image("/projects/coastal-frames/photo-3.svg", "Coastal Frames photo 3", 1400, 1750),
      image("/projects/coastal-frames/photo-4.svg", "Coastal Frames photo 4", 1400, 1750),
      image("/projects/coastal-frames/photo-5.svg", "Coastal Frames photo 5", 1400, 1750),
      image("/projects/coastal-frames/photo-6.svg", "Coastal Frames photo 6", 1400, 1750),
    ],
    order: 7,
    featured: true,
    published: true,
  },
];

export const profile: Profile = {
  name: "YERRMAK",
  fullName: "Viktor Yermakov",
  tagline: {
    en: "Cinematographer · Self-described nerd technician",
    uk: "Кінооператор · Технічний нердер за самовизначенням",
  },
  biography: {
    // TODO(owner): replace with the approved bio copy from the current site's
    // About & Contact page (roadmap: "уже написаний і узгоджений") — this is
    // a placeholder assembled only from the confirmed brief facts.
    en: "Viktor Yermakov, working under the name YERRMAK, is a cinematographer and photographer based in the United Kingdom, currently studying film production. His work spans short films, music videos, and promotional video, with an eye for cinematic, story-driven imagery.",
    uk: "Віктор Єрмаков, що працює під брендом YERRMAK, — кінооператор і фотограф, що базується у Великій Британії та навчається на кінопродакшн. У портфоліо — короткометражні фільми, музичні відео та промо-ролики з акцентом на кінематографічну, наративну візуальність.",
  },
  portrait: image("/profile/portrait.svg", "Viktor Yermakov portrait", 1200, 1500),
  email: "yerrmakov@gmail.com",
  instagramUrl: "https://www.instagram.com/yerrmak", // TODO(owner): confirm exact handle
  youtubeUrl: "https://www.youtube.com/@yerrmak",
};

export const siteSettings: SiteSettings = {
  showreelUrl: "https://www.youtube.com/watch?v=TODO_SHOWREEL", // TODO(owner): real link
  contactCtaText: {
    en: "Let's create something",
    uk: "Створімо щось разом",
  },
  seoTitle: {
    en: "YERRMAK — Cinematographer & Photographer",
    uk: "YERRMAK — Кінооператор і фотограф",
  },
  seoDescription: {
    en: "Portfolio of Viktor Yermakov (YERRMAK): short films, music videos, promotional video, and photography.",
    uk: "Портфоліо Віктора Єрмакова (YERRMAK): короткометражні фільми, музичні відео, промо-відео та фотографія.",
  },
};
