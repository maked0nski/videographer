import type { Project, Profile, SiteSettings } from "@/types";

/**
 * Real launch content (constitution Development Workflow: real content before
 * CMS wiring), gathered from the live yerrmakov.wixsite.com/yerrmak site and
 * Viktor's YouTube channel (youtube.com/@yerrmak). Descriptions below are
 * written in our own words from the facts published there, not copied
 * verbatim. Fields marked `TODO(owner)` are facts that weren't confirmable
 * from those public sources (e.g. no individual project page or YouTube
 * upload exists yet) — replace them during the Sanity content migration
 * (tasks.md T056).
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
    year: "2025–2026", // TODO(owner): confirm exact production year (award is dated 2026)
    location: "United Kingdom",
    role: { en: "Cinematographer", uk: "Оператор-постановник" },
    producerDirector: {
      en: "Producer: Irina Burya · Director: Valerii Mamaev",
      uk: "Продюсер: Ірина Буря · Режисер: Валерій Мамаєв",
    },
    recognition: {
      en: "Honourable Mention for Best Cinematography, London Global Film Awards 2026 — still on its festival run",
      uk: "Почесна відзнака за найкращу операторську роботу, London Global Film Awards 2026 — фільм досі бере участь у фестивальному показі",
    },
    description: {
      en: "A student thriller-drama following a team of investigators looking into an alleged case of possession, and the conflicting testimonies that complicate their search for the truth.",
      uk: "Студентський трилер-драма про команду слідчих, що розслідує імовірний випадок одержимості, і суперечливі свідчення, які ускладнюють пошук правди.",
    },
    coverImage: image("/projects/the-withshaw-case/cover.jpg", "The Withshaw Case", 1551, 1081),
    // No public release yet — festival run still in progress, so no YouTube link.
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
    year: "2025", // TODO(owner): confirm exact year
    location: "United Kingdom",
    role: { en: "Director of Photography", uk: "Оператор-постановник (DP)" },
    producerDirector: {
      en: "Director: Ștefan-Iulian Craioveanu",
      uk: "Режисер: Штефан-Юліан Крайовяну",
    },
    description: {
      en: "A music video built around adrenaline and pressure, using a hospital setting as a visual anchor while alternating dynamic in-car sequences with quieter, more intimate frames.",
      uk: "Музичне відео на тему адреналіну й напруги, де лікарня слугує візуальним якорем, а динамічні сцени в авто чергуються з тихішими, інтимнішими кадрами.",
    },
    coverImage: image("/projects/fusion-fever/cover.jpg", "Fusion – Fever", 1920, 962),
    // TODO(owner): not yet uploaded to the public YouTube channel — add the real link when available.
    order: 2,
    featured: true,
    published: true,
  },
  {
    slug: "beerex-beer-festival",
    type: "video",
    title: { en: "BEEREX — Beer Festival", uk: "BEEREX — Beer Festival" },
    year: "2026",
    location: "Farnham, United Kingdom",
    role: { en: "Videographer & Editor", uk: "Відеограф і монтажер" },
    description: {
      en: "A promotional video for the Farnham Lions Club's 49th annual Beerex beer festival, capturing the atmosphere and community behind the event.",
      uk: "Промо-відео до 49-го щорічного пивного фестивалю Beerex від Farnham Lions Club — про атмосферу і людей, що стоять за подією.",
    },
    coverImage: image("/projects/beerex-beer-festival/cover.jpg", "BEEREX — Beer Festival", 1920, 1079),
    // TODO(owner): not yet uploaded to the public YouTube channel — add the real link when available.
    order: 3,
    featured: true,
    published: true,
  },
  {
    slug: "first-glimpse",
    type: "video",
    title: { en: "First Glimpse", uk: "First Glimpse" },
    year: "2025",
    location: "United Kingdom",
    role: { en: "Director", uk: "Режисер" },
    description: {
      en: "Yerrmak's first experimental short film, told without dialogue — an intimate, black-and-white study of vulnerability and identity built from close observation of light, texture and silence.",
      uk: "Перший експериментальний короткий фільм Yerrmak без діалогів — інтимне чорно-біле дослідження вразливості й ідентичності через світло, текстуру й тишу.",
    },
    coverImage: image("/projects/first-glimpse/cover.jpg", "First Glimpse", 1920, 1606),
    youtubeUrl: "https://www.youtube.com/watch?v=0xkCyI6Iyu8",
    order: 4,
    featured: false,
    published: true,
  },
  {
    slug: "buried-in-me",
    type: "video",
    title: { en: "Buried In Me", uk: "Buried In Me" },
    year: "2025", // TODO(owner): confirm exact year
    location: "United Kingdom",
    role: { en: "Director of Photography", uk: "Оператор-постановник (DP)" },
    producerDirector: {
      en: "Producer: Irina Burya · Director: Lisa Yatsenko",
      uk: "Продюсер: Ірина Буря · Режисер: Ліза Яценко",
    },
    description: {
      en: "A crime-drama short about an ex-car thief confronting the consequences of his past, shot as part of a full-scale narrative production with a larger crew.",
      uk: "Кримінальна драма про колишнього викрадача автомобілів, який зіштовхується з наслідками свого минулого — знята як частина повноцінної наративної продакшн-команди.",
    },
    coverImage: image("/projects/buried-in-me/cover.jpg", "Buried In Me", 1920, 741),
    // TODO(owner): not yet uploaded to the public YouTube channel — add the real link when available.
    order: 5,
    featured: true,
    published: true,
  },
  {
    slug: "yara-steel",
    type: "video",
    title: { en: "YARA — Steel", uk: "YARA — Сталь" },
    year: "2024",
    location: "United Kingdom",
    role: { en: "Director, Cinematographer & Editor", uk: "Режисер, оператор і монтажер" },
    recognition: {
      en: "200,000+ views across platforms; broadcast on Ukrainian TV channels M1 and M2",
      uk: "200 000+ переглядів на різних платформах; трансляція на українських телеканалах M1 і M2",
    },
    description: {
      en: "Yerrmak's first music video, made for a song dedicated to Ukraine's resistance against Russian aggression — conceived, shot and edited in three days, blending live camera footage with projected imagery.",
      uk: "Перше музичне відео Yerrmak, зняте для пісні, присвяченої опору України російській агресії — задумане, зняте й змонтоване за три дні, поєднує живу камеру з проєкційними зображеннями.",
    },
    coverImage: image("/projects/yara-steel/cover.jpg", "YARA — Steel", 1920, 1075),
    youtubeUrl: "https://www.youtube.com/watch?v=ScGBGBQLPQI",
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
    // (spec Assumptions: no dedicated photo gallery published yet). Replace
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
    en: "Cinematographer with a nerdy technical streak, chasing precise, emotionally grounded images",
    uk: "Кінооператор із технічною жилкою, що прагне точних і емоційно вивірених кадрів",
  },
  biography: {
    // Paraphrased from the site's own About copy and Viktor's YouTube channel
    // description ("I'm Viktor — a cinematography student from Ukraine, based
    // in the UK.") rather than reproduced verbatim.
    en: "Viktor Yermakov, working under the name YERRMAK, is a cinematography student from Ukraine now based in the United Kingdom. His work blends technical precision with expressive, story-driven visuals — short films, music videos and promotional work built on a close attention to detail and a willingness to experiment, balancing control with creative instinct.",
    uk: "Віктор Єрмаков, що працює під брендом YERRMAK, — студент кінооператорського фаху з України, що зараз базується у Великій Британії. У його роботах технічна точність поєднується з виразною, наративною візуальністю — короткометражні фільми, музичні відео та промо-проєкти, збудовані на увазі до деталей і готовності експериментувати, балансуючи між контролем і творчим інстинктом.",
  },
  portrait: image("/profile/portrait.jpg", "Viktor Yermakov portrait", 900, 900),
  email: "yerrmakov@gmail.com",
  instagramUrl: "https://www.instagram.com/yerrmak/",
  youtubeUrl: "https://www.youtube.com/@yerrmak",
};

export const siteSettings: SiteSettings = {
  // TODO(owner): pick a real showreel video (or cut a new one) and link it here —
  // none of the current YouTube uploads is framed as a general showreel.
  showreelUrl: "https://www.youtube.com/watch?v=0xkCyI6Iyu8",
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
