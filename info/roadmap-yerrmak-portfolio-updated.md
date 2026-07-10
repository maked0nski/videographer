# Роадмап створення сайту-портфоліо — YERRMAK (оновлена версія)

Ціль лишається та сама: адаптивний сайт-візитка для відеографа/фотографа з чорним cinematic-дизайном, YouTube-відео, фотогалереями і простим самостійним додаванням робіт через Sanity. Ця версія враховує рішення, ухвалені під час обговорення, і реальний контент з чинного сайту (yerrmakov.wixsite.com/yerrmak).

## Що змінилось порівняно з першою версією

* Бренд: головна назва на сайті — **YERRMAK** (як зараз на Wix), повне ім'я Viktor Yermakov — атрибуцією/підписом
* Знайдено фірмовий акцентний колір з чинного сайту — **#C3CB00** (лаймовий/жовто-зелений). Більше не "додамо пізніше", а частина дизайн-системи з першого дня
* Двомовність UA/EN реалізується через окремі URL `/ua` і `/en` (краще для SEO)
* Контактна форма на MVP не потрібна — тільки email-посилання, Instagram, YouTube
* Аналітика (Vercel Analytics) підключається одразу, не відкладається
* Тип проєкту (відео/фото) — один гнучкий перемикач у CMS, а не жорсткий поділ полів чи окрема категорія
* Hero-відео: стоп-кадр показується миттєво, відео підхоплюється по мірі буферизації (стандартна поведінка `<video poster autoplay>`, без додаткової інженерії)
* Контент з чинного сайту (біографія, 6 проєктів, email, YouTube-канал) використовується як стартові дані Фази 1 замість вигаданих заглушок

---

## Етап 1. Зафіксувати концепцію

### Бренд і базові дані (вже підтверджено)

```text
Бренд: YERRMAK
Повне ім'я: Viktor Yermakov
Підпис: Cinematographer · Self-described nerd technician
Email: yerrmakov@gmail.com
YouTube: youtube.com/@yerrmak
Базування: Велика Британія (навчається на кінопродакшн)
```

### Базова структура сторінок

```text
Home
Work
About & Contact
```

Об'єднання About і Contact в одну сторінку — за зразком чинного сайту, і це узгоджується з рішенням "форма не потрібна": контактний блок виходить компактним і не вимагає окремої сторінки.

У `Work`:

```text
All
Films
Photography
```

Ці вкладки фільтра **формуються автоматично** з поля `type` кожного проєкту (Відео/Фото) — окремого поля-категорії заводити не потрібно.

### Біографія (стартовий текст, уже готовий)

Взяти за основу текст з About & Contact сторінки чинного сайту — уже написаний і узгоджений, не потребує вигадування заново. Використати його як `bio.en`, паралельно підготувати переклад `bio.uk`.

### Стартові проєкти (6 шт., вже готові)

Перенести як seed/тестові дані для Фази 1, з чинної сторінки Portfolio:

```text
01. The Withshaw Case — короткометражка (thriller-drama)
02. Fusion – Fever — музичне відео (DP)
03. BEEREX — Beer Festival — промо-відео
04. First Glimpse — експериментальна короткометражка
05. Buried In Me — короткометражка (crime drama, DP)
06. YARA — Сталь "Steel" — музичне відео (200,000+ переглядів)
```

Кожен проєкт уже має опис, дату/рік, локацію, роль, а частина — Producer/Director. Це прямо мапиться на поля Sanity-схеми `Project` (Етап 9).

### Фото-роботи

Окремої фотогалереї на чинному сайті немає. Коли з'являться фото-роботи — вони додаються тим самим механізмом (проєкт з `type: Фото`), без змін у структурі бази чи фронтенду.

### Потрібно ще підготувати

* портрет (на About-сторінці вже є одне ч/б фото — можна лишити або оновити);
* фотографії для майбутньої категорії Photography;
* короткий looping-кліп без звуку для hero-фону;
* обкладинки для відеопроєктів (частково вже є на чинному сайті).

---

## Етап 2. Дизайн-система

### Кольори (оновлено — акцент уже визначений)

```text
Background: #050505
Secondary background: #0C0C0C
Main text: #F5F5F5
Secondary text: #9A9A9A
Border: #202020
Accent (фірмовий): #C3CB00
```

Акцент використовується так само, як і зараз: логотип, підкреслення під заголовком, активні стани навігації, hover-ефекти. Не заливати ним великі площі — лише акцентні деталі.

### Типографіка

```text
Headings: Space Grotesk / Manrope
Body: Inter
```

Uppercase для меню й коротких підписів, великі міжлітерні інтервали в навігації — стиль, що вже впізнається на чинному сайті.

### Базові компоненти

```text
header (з перемикачем мови UA/EN)
mobile menu
hero section (стоп-кадр → відео)
project card
category filter (керується полем type)
YouTube modal
photo gallery
lightbox
project meta block (Project type / Location / Date / Role)
prev/next project navigation
section heading
contact block (email + соцмережі, без форми)
footer
```

### Адаптивні контрольні ширини

```text
Mobile: 320–767 px
Tablet: 768–1023 px
Desktop: 1024–1439 px
Large desktop: 1440 px+
```

---

## Етап 3. Створити мінімальний frontend

### Технології

```text
Next.js (App Router, сегмент [locale] для ua/en з самого початку)
TypeScript
Tailwind CSS
Vercel
```

### Завдання

1. Створити Next.js-проєкт з маршрутизацією `[locale]`.
2. Налаштувати TypeScript.
3. Підключити Tailwind CSS.
4. Додати базову структуру директорій.
5. Налаштувати глобальні стилі (кольори + акцент `#C3CB00`).
6. Створити header з перемикачем мови і footer.
7. Зробити адаптивне меню.
8. Додати тестові дані — **реальний контент з чинного сайту**, а не вигадані заглушки.
9. Підключити Vercel Analytics одразу після першого деплою.

### Рекомендована структура

```text
src/
  app/
    [locale]/
      page.tsx
      work/
      about-contact/
  components/
    layout/
    navigation/
    portfolio/
    media/
    ui/
  lib/
  types/
  data/
  messages/
    uk.json
    en.json
```

### Критерій завершення

Сайт відкривається на `/ua` і `/en`, на телефоні та ПК, має меню, чорний фон з лаймовим акцентом і реальні тестові проєкти. Vercel Analytics збирає перші події.

---

## Етап 4. Реалізувати головну сторінку

### 4.1 Hero

* fullscreen-висота;
* стоп-кадр показується миттєво (`poster` в `<video>`), відео підхоплюється, щойно забуферилось — стандартна поведінка HTML5-відео, окремої логіки писати не потрібно;
* короткий looping-кліп без звуку, власний файл у `public/` (безкоштовно роздається через Vercel, без сторонніх сервісів);
* затемнення поверх відео для читабельності тексту;
* назва бренду YERRMAK лаймовим акцентом;
* професійний підпис;
* кнопка `Watch Showreel` — відкриває окрему YouTube-модалку (інший, повноцінний ролик, не той самий фоновий кліп).

### 4.2 Showreel modal

* fullscreen modal;
* завантажується YouTube iframe через `youtube-nocookie.com`;
* кнопка закриття, клавіша Escape, блокування прокручування сторінки.

### 4.3 Selected Work

* 4–6 вибраних проєктів;
* дві колонки на ПК, одна на телефоні;
* власні обкладинки;
* hover-ефект лише на пристроях із мишею.

### 4.4 Photography preview

Показується тільки якщо є хоча б один проєкт з `type: Фото` — інакше блок не рендериться, щоб не було порожньої секції, поки фотографій ще немає.

### 4.5 About preview

* портрет, короткий текст, посилання на повну сторінку.

### 4.6 Contact CTA

Кнопка веде одразу на секцію контактів (email + Instagram + YouTube), без форми:

```text
LET'S CREATE SOMETHING
```

Кнопка:

```text
GET IN TOUCH
```

---

## Етап 5. Сторінка Work

Фільтри `All / Films / Photography` формуються автоматично з поля `type` кожного проєкту — окремо налаштовувати категорії в CMS не потрібно.

### Картка проєкту

```text
Cover image
Title
Type (Відео / Фото — іконка Play лише для відео)
Year
```

### URL

```text
/[locale]/work
/[locale]/work/project-slug
```

### Критерій завершення

Користувач може відкрити `Work`, відфільтрувати роботи й перейти на сторінку конкретного проєкту.

---

## Етап 6. Сторінка проєкту

Поля (за зразком уже наявної структури на чинному сайті):

```text
Title
Type (визначає — YouTube-плеєр чи фотогалерея)
Project type label (вільний текст: "Music Video", "Promotional Video" тощо)
Year / Date
Location
Role
Producer / Director (опційно)
Recognition / stats — вільне текстове поле (фестивальні відзнаки, перегляди тощо)
Short description
YouTube video (тільки для type: Відео)
Gallery (основний контент для type: Фото, або behind-the-scenes для type: Відео)
Previous / Next project
```

### Важливі деталі

* відео адаптивне `16:9`;
* фото не втрачають якості;
* галерея на телефоні працює без горизонтального переповнення;
* наступний проєкт доступний наприкінці сторінки.

---

## Етап 7. Фотогалерея

### Функції

* responsive images;
* lazy loading;
* lightbox;
* свайп на телефоні, клавіші вперед/назад на ПК;
* закриття через Escape;
* коректна робота вертикальних і горизонтальних фото.

### Оптимізація

Автоматичне масштабування, WebP/AVIF, різні розміри для телефона й ПК, blur placeholder — значну частину цього вже безкоштовно робить `next/image`, писати з нуля не потрібно.

---

## Етап 8. About & Contact (об'єднана сторінка)

```text
Portrait
Short biography (uk/en, на основі тексту з чинного сайту)
Specialisation
Location
Available for
Email (mailto-посилання)
Instagram
YouTube
```

Форми немає. Якщо пізніше з'явиться потреба у формі — це окремий, ізольований додаток до цієї сторінки, без переробки решти сайту.

---

## Етап 9. Підключити Sanity CMS

Лише після того, як frontend уже працює на реальних тестових даних.

### Типи документів

#### Project

```text
Title (uk/en)
Slug
Type: Відео | Фото   ← один перемикач, керує рештою полів і фільтром
Cover image
YouTube URL           (у Studio показується, тільки якщо Type = Відео)
Gallery
Description (uk/en)
Project type label     (вільний текст, напр. "Music Video")
Year / Date
Location
Role
Producer / Director
Recognition / stats     (вільний текст)
Featured
Published
Order
```

#### Profile

```text
Name (YERRMAK)
Full name (Viktor Yermakov)
Professional title
Biography (uk/en)
Portrait
Email
Location
Instagram URL
YouTube URL
```

#### Site settings

```text
Hero title
Hero subtitle
Hero video (файл або посилання)
Hero poster image
Showreel URL
Contact text (uk/en)
SEO title (uk/en)
SEO description (uk/en)
```

### Простота для сина

У Sanity Studio:

```text
Projects
Profile
Site Settings
```

Форма проєкту показує лише релевантні поля залежно від обраного Type. Підказки-плейсхолдери додаються до кожного технічного поля (наприклад, "встав посилання з YouTube ось так: https://youtube.com/watch?v=...").

---

## Етап 10. Підключити frontend до Sanity

### Завдання

1. Встановити Sanity client.
2. Створити GROQ-запити.
3. Отримувати featured projects.
4. Отримувати список усіх проєктів.
5. Отримувати проєкт за slug.
6. Підключити profile.
7. Підключити site settings.
8. Налаштувати Sanity image URL builder.
9. Обробити відсутні поля.
10. Реалізувати умовний рендер (плеєр чи галерея) залежно від поля `type`.
11. Додати draft preview лише за потреби.

### Важливе правило

Сайт не повинен падати, якщо не додано YouTube URL, відсутня галерея, не вказано location, немає role, немає portrait. Необов'язкові поля просто не показуються.

---

## Етап 11. Автоматичне оновлення сайту

```text
Sanity publish
→ webhook
→ Next.js revalidate
→ оновлена сторінка
```

Сину не потрібно відкривати Vercel або запускати deployment вручну.

---

## Етап 12. SEO та соціальні прев'ю

### Для кожного проєкту

```text
Page title
Meta description
Open Graph image
Canonical URL
Structured metadata
```

### Загальні налаштування

* sitemap (для кожної мови або один сумісний);
* `hreflang` теги для пар `/ua` / `/en`;
* canonical URL з урахуванням мови;
* robots.txt;
* favicon;
* social preview;
* alt-тексти для фото.

---

## Етап 13. Оптимізація швидкості

### Перевірити

* Lighthouse, Core Web Vitals;
* розміри зображень;
* lazy loading;
* JavaScript bundle;
* YouTube iframe;
* мобільний інтернет, слабкі телефони;
* розмір і тривалість hero-кліпу (короткий цикл, стиснений файл).

### Основні правила

* не завантажувати YouTube iframe до натискання;
* не запускати проєктні відео автоматично зі звуком (тільки короткий hero-кліп — і той без звуку);
* обмежити кількість анімацій;
* не завантажувати одразу всю фотогалерею у full resolution.

---

## Етап 14. Доступність

* контраст тексту (включно з лаймовим акцентом на чорному фоні);
* навігація клавіатурою, focus states;
* aria-label для кнопок;
* alt-тексти;
* читабельний розмір шрифту;
* кнопка закриття modal;
* підтримка `prefers-reduced-motion`.

---

## Етап 15. Тестування

### Телефони

Android Chrome, Samsung Internet, iPhone Safari.

### ПК

Chrome, Edge, Firefox, Safari (якщо є доступ).

### Сценарії

```text
1. Відкрити головну
2. Запустити showreel
3. Закрити відео
4. Відкрити меню на телефоні
5. Перемкнути мову UA/EN і перевірити переклад усіх сторінок
6. Відфільтрувати роботи (All/Films/Photography)
7. Відкрити відеопроєкт
8. Відкрити фотопроєкт
9. Переглянути lightbox
10. Додати новий проєкт через Sanity (обидва типи — відео і фото)
11. Перевірити появу проєкту на сайті та в правильній вкладці фільтра
```

---

## Етап 16. Домен і запуск

* придбати домен;
* підключити до Vercel;
* перевірити SSL;
* налаштувати основний домен, redirect із `www`;
* Google Search Console, sitemap;
* фінальний backup конфігурації.

---

# Наскрізні пункти, яких не було в першій версії

* **Free-tier ліміти**: Vercel Hobby і Sanity free plan — достатньо для сайту-портфоліо, спеціально стежити не потрібно, але варто знати, що вони існують
* **Vercel Analytics** — підключається з Фази 1, безкоштовно в межах ліміту подій
* **Onboarding-документ для сина** — окрема сторінка в Google Docs/Notion (не код): "як додати новий проєкт", зі скріншотами Sanity Studio
* **Резервне копіювання контенту** — періодичний експорт даних із Sanity (`sanity dataset export`), кілька разів на рік

---

# Оновлена черговість розробки

## Фаза 1 — мінімальний робочий сайт

```text
Next.js setup з [locale] (ua/en)
Header з перемикачем мови
Mobile menu
Hero (стоп-кадр + відео)
Реальні тестові проєкти (6 шт. з чинного сайту)
Work page з фільтром
Project page
Responsive layout
Vercel Analytics
```

## Фаза 2 — медіа

```text
YouTube modal (showreel + проєкти)
Photo gallery
Lightbox
Image optimisation
```

## Фаза 3 — контент

```text
About & Contact (об'єднана сторінка)
Email + соцмережі (без форми)
Профільні дані, переклад uk/en
```

## Фаза 4 — CMS

```text
Sanity schemas (з гнучким полем Type)
Sanity Studio
Frontend queries
Automatic publishing
```

## Фаза 5 — запуск

```text
SEO (+ hreflang)
Performance
Accessibility
Testing
Domain
Production release
```

---

# MVP: що входить у перший реліз

```text
Home (ua/en)
Work (ua/en)
Project page (ua/en)
About & Contact (ua/en)

Responsive mobile and desktop design
Чорна cinematic-тема з акцентом #C3CB00
YouTube integration
Photo galleries
Sanity CMS з гнучким типом проєкту (відео/фото)
SEO basics + hreflang
Email + соцмережі замість форми
Vercel Analytics
Власний домен
```

# Що не входить

```text
Client accounts
Authentication
Shop
Payments
Booking
CRM
Private galleries
File delivery
Comments
Blog
Contact form (можна додати пізніше окремим кроком поза MVP)
Complex admin dashboard
```

---

# Спринти

## Спринт 1 — основа

* репозиторій;
* Next.js + `[locale]` структура;
* Tailwind, базові стилі з кольором `#C3CB00`;
* header з перемикачем мови;
* mobile menu;
* footer.

## Спринт 2 — головна

* hero (стоп-кадр + відео);
* showreel button + modal;
* selected work;
* photography preview (умовний рендер);
* contact CTA.

## Спринт 3 — портфоліо

* Work page;
* фільтри на основі type;
* project cards;
* project page з повним набором полів;
* prev/next навігація.

## Спринт 4 — медіа

* YouTube modal;
* photo gallery;
* lightbox;
* responsive images.

## Спринт 5 — статичні сторінки

* About & Contact (об'єднана);
* email + соцпосилання;
* переклад uk/en.

## Спринт 6 — Sanity

* schemas з гнучким Type;
* Studio;
* projects (перенести 6 реальних проєктів із чинного сайту);
* profile;
* site settings;
* frontend integration.

## Спринт 7 — завершення

* SEO + hreflang;
* оптимізація;
* accessibility;
* тестування (включно з перемиканням мов і фільтрів);
* domain;
* запуск.

---

## Головний принцип

Той самий: спочатку мінімальний сайт — але тепер **на реальних, а не вигаданих даних** (біографія і 6 проєктів уже готові з чинного сайту), перевірити на телефоні та ПК, і лише потім підключати Sanity.
