# Feature Specification: Bilingual Portfolio Website (YERRMAK)

**Feature Branch**: `001-yerrmak-portfolio`

**Created**: 2026-07-10

**Status**: Draft

**Input**: User description: "Build a bilingual (Ukrainian and English) portfolio website for a videographer and photographer working under the brand name YERRMAK (full name Viktor Yermakov). The site has three sections: Home, Work, and About & Contact. Home shows a fullscreen hero with the brand name and a short professional tagline over a looping background video (a poster image displays immediately, and the video begins playing once buffered), a button that opens a full showreel in a video modal, a preview of selected work, a photography preview shown only if photo projects exist, and a contact call-to-action. Work lists all projects with a filter between \"All\", \"Films\", and \"Photography\", driven by a per-project type field rather than a separate category. Each project has its own page showing title, year, location, role, an optional producer/director credit, an optional recognition or stats note, a short description, and either an embedded YouTube video with a behind-the-scenes gallery (for film projects) or a photo gallery with a lightbox (for photo projects), plus navigation to the previous and next project. About & Contact combines a short biography, portrait, and contact information (email, Instagram, YouTube) with no contact form, only direct links. The whole site is available in both Ukrainian and English through separate URL paths, with a language switcher in the header. The site owner, who is not technical, must be able to add, edit, reorder, and translate projects himself through a simple content management interface, choosing per project whether it is a video or a photo project, without touching code or involving a developer."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Discover and browse the portfolio (Priority: P1)

A prospective client or collaborator lands on the site, sees an immediate impression of who YERRMAK is, browses the full list of work, and opens any project to read its full details.

**Why this priority**: This is the entire reason the site exists — without a browsable portfolio, there is no product. Every other capability enhances this core journey.

**Independent Test**: Can be fully tested by opening the homepage, navigating to the Work list, opening any project's detail page, and confirming the correct title, year, location, role, description, and (when present) producer/director credit and recognition/stats note are shown — delivers a complete, demonstrable portfolio on its own.

**Acceptance Scenarios**:

1. **Given** a visitor opens the homepage, **When** the page loads, **Then** they see the brand name, a professional tagline, a preview of selected work, and a contact call-to-action.
2. **Given** a visitor opens the Work page, **When** the page loads, **Then** every published project is listed with its title, type, and year.
3. **Given** a visitor is viewing the Work list, **When** they select a project, **Then** they are taken to that project's own page showing its title, year, location, role, description, and any optional producer/director credit or recognition/stats note that exists for it.
4. **Given** a visitor is on a project's page, **When** they use the previous/next navigation, **Then** they move to the adjacent project in the portfolio's display order.
5. **Given** no photo projects exist yet, **When** a visitor views the homepage, **Then** no photography preview section is shown.

---

### User Story 2 - Browse the site in Ukrainian or English (Priority: P2)

A visitor who reads Ukrainian, or one who reads English, uses the whole site — Home, Work, every project page, and About & Contact — fully translated in their chosen language, and can switch languages at any time.

**Why this priority**: Bilingual access is a stated requirement for every page, but the site still delivers its core value (Story 1) in a single language before this is added, making it a distinct, testable slice.

**Independent Test**: Can be fully tested by loading the site at its Ukrainian path, confirming all visible text is Ukrainian, switching to English via the header switcher, and confirming the equivalent page loads fully in English — independently verifiable without any other story.

**Acceptance Scenarios**:

1. **Given** a visitor is on any page under the Ukrainian path, **When** they select the language switcher, **Then** they land on the equivalent page under the English path with all content translated.
2. **Given** a visitor is on a specific project's page in one language, **When** they switch languages, **Then** they land on that same project's page in the other language, not the Work list or homepage.
3. **Given** a visitor opens the site root without a language path, **When** the page resolves, **Then** they are directed to one of the two supported language paths.
4. **Given** a project has not yet been translated into one of the two languages, **When** a visitor views that project in the untranslated language, **Then** the page still renders correctly using the available content rather than showing broken or missing text.

---

### User Story 3 - Watch video work (Priority: P3)

A visitor watches YERRMAK's showreel from the homepage, and separately watches the embedded video and browses the behind-the-scenes gallery on an individual film project's page.

**Why this priority**: Video is the primary medium of the portfolio's film work, but browsing (Story 1) already delivers value without playback; this story adds the actual viewing experience.

**Independent Test**: Can be fully tested by opening the homepage, opening the showreel from the hero button, closing it, then opening a film project and playing its embedded video and behind-the-scenes gallery — independently verifiable without photo or bilingual functionality.

**Acceptance Scenarios**:

1. **Given** a visitor is on the homepage, **When** they select the showreel button, **Then** a video modal opens and plays the full showreel.
2. **Given** the showreel modal is open, **When** the visitor closes it (via a close control or the Escape key), **Then** the modal closes and the underlying page is unaffected.
3. **Given** a visitor opens a film project's page, **When** the page loads, **Then** they see the embedded video and a behind-the-scenes gallery for that project.
4. **Given** a visitor has not yet interacted with a project's embedded video, **When** the project page first loads, **Then** the video's remote content is not yet being downloaded.

---

### User Story 4 - View photo work (Priority: P4)

A visitor sees a photography preview on the homepage (once photo projects exist), filters the Work page to Photography, and opens a photo project to browse its gallery in a full-size lightbox view.

**Why this priority**: Photography is a secondary but explicitly required work type; it depends on the portfolio structure from Story 1 but is independently testable once at least one photo project exists.

**Independent Test**: Can be fully tested by publishing one photo project, confirming the homepage photography preview appears, filtering Work to "Photography", opening the project, and browsing its gallery images in the lightbox — independently verifiable without video functionality.

**Acceptance Scenarios**:

1. **Given** at least one photo project is published, **When** a visitor views the homepage, **Then** a photography preview section is shown.
2. **Given** a visitor is on the Work page, **When** they select the "Photography" filter, **Then** only photo projects are shown.
3. **Given** a visitor opens a photo project's page, **When** the page loads, **Then** they see its photo gallery instead of a video player.
4. **Given** a visitor selects an image in a photo project's gallery, **When** the lightbox opens, **Then** they can move to the next and previous image and close the lightbox back to the gallery.

---

### User Story 5 - Learn about YERRMAK and get in touch (Priority: P5)

A visitor reads a short biography and views a portrait on the About & Contact page, then reaches out directly via email, Instagram, or YouTube.

**Why this priority**: This closes the loop from "impressed by the work" to "can make contact," but the site delivers portfolio value (Story 1) without it, so it is scoped as its own slice.

**Independent Test**: Can be fully tested by opening the About & Contact page and confirming the biography, portrait, and each contact link (email, Instagram, YouTube) are present and functional — independently verifiable without any other story.

**Acceptance Scenarios**:

1. **Given** a visitor opens the About & Contact page, **When** the page loads, **Then** they see a portrait, a short biography, and contact links for email, Instagram, and YouTube.
2. **Given** a visitor selects the email contact link, **When** their device handles the link, **Then** it opens a pre-addressed email to YERRMAK — no on-site contact form is presented anywhere on the site.
3. **Given** a visitor is on the homepage, **When** they select the contact call-to-action, **Then** they are taken to the About & Contact page's contact information.

---

### User Story 6 - Manage portfolio content without a developer (Priority: P6)

The site owner, who is not technical, signs in to a content management interface and adds a brand-new project, edits an existing one, changes the display order of projects, and adds a translation — all without writing code or asking a developer for help.

**Why this priority**: This is what makes the site sustainable after launch, but the public-facing site (Stories 1-5) must exist first before there is anything to manage; it is independently testable against an already-published portfolio.

**Independent Test**: Can be fully tested by having a non-technical user, using only the content management interface, publish a new project (choosing Video or Photo), edit an existing project's details, change the order of two projects, and add a missing translation — then confirming those changes appear correctly on the live site.

**Acceptance Scenarios**:

1. **Given** the site owner is in the content management interface, **When** they create a new project, **Then** they choose a single Video-or-Photo type for it and are shown only the fields relevant to that type.
2. **Given** the site owner edits an existing project's details or translations, **When** they publish the change, **Then** the update appears on the live site without any code change or developer action.
3. **Given** the site owner changes the display order of projects, **When** they publish the change, **Then** the Work page and homepage selected-work preview reflect the new order.
4. **Given** the site owner adds a translation for a project that previously existed in only one language, **When** they publish it, **Then** the project displays correctly in both languages.
5. **Given** the site owner is not a developer, **When** they perform any of the above actions, **Then** they do so entirely through the content management interface, without editing code or files directly.

### Edge Cases

- What happens when a project is missing an optional field (producer/director credit, recognition/stats note)? The corresponding label and value are simply omitted from the project page rather than shown empty.
- How does the previous/next project navigation behave at the first or last project in the display order? Navigation always wraps: from the last project, "next" goes to the first project, and from the first project, "previous" goes to the last project. Both directions are always available, at every position in the list.
- What happens if a visitor's connection cannot buffer the hero background video? The poster image continues to display; the page remains usable and readable regardless of video load state.
- What happens when only one project total exists? The Work filter and prev/next navigation still function without error, simply reflecting a single-item list.
- What happens when a visitor's device or browser has "reduce motion" enabled? Non-essential animations and transitions are disabled or minimized site-wide.
- What happens when the site owner deletes or unpublishes the last remaining photo project? The homepage photography preview and the "Photography" Work filter option stop appearing, consistent with the "only if photo projects exist" rule.
- What happens when a visitor navigates directly to a project detail URL that does not exist or has been unpublished? They see a clear not-found state rather than a broken page.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The homepage MUST display a fullscreen hero showing the YERRMAK brand name and a short professional tagline over a looping background video.
- **FR-002**: The hero background video MUST show a static poster image immediately on page load, and MUST begin playing automatically only once it has buffered, without blocking or delaying the rest of the page from being usable.
- **FR-003**: The homepage MUST provide a control that opens a full showreel video in a modal, separate from the hero background video.
- **FR-004**: The showreel modal MUST be closable both via an explicit close control and via the Escape key, and MUST NOT allow the underlying page to scroll while open.
- **FR-005**: The homepage MUST show a preview of selected work drawn from the published projects.
- **FR-006**: The homepage MUST show a photography preview section only when at least one photo-type project is published, and MUST omit that section entirely otherwise.
- **FR-007**: The homepage MUST provide a contact call-to-action that leads to the site's contact information.
- **FR-008**: The Work page MUST list all published projects and MUST provide a filter between "All", "Films", and "Photography".
- **FR-009**: The Work filter MUST be driven by a single type value stored on each project (Video or Photo), not by a separate, independently maintained category field.
- **FR-010**: Each project MUST have its own page displaying its title, year, location, role, short description, and, when present, an optional producer/director credit and an optional recognition/stats note.
- **FR-011**: A Video-type project's page MUST show an embedded YouTube video and a behind-the-scenes photo gallery for that project.
- **FR-012**: A Photo-type project's page MUST show a photo gallery with a lightbox for viewing images at full size, instead of a video player.
- **FR-013**: Each project's page MUST provide navigation to the previous and next project in the portfolio's display order.
- **FR-014**: The embedded YouTube video on a project page, and the homepage showreel, MUST NOT begin downloading their remote video content until the visitor explicitly interacts with them (e.g. selects play).
- **FR-015**: A photo gallery's lightbox MUST allow the visitor to move to the next and previous image and to close back to the gallery view.
- **FR-016**: The About & Contact page MUST combine a short biography, a portrait image, and contact information (email, Instagram, YouTube) on a single page.
- **FR-017**: The site MUST NOT present any on-site contact form; all contact MUST occur via direct links (email, Instagram, YouTube).
- **FR-018**: The entire site MUST be available in both Ukrainian and English, each under its own distinct URL path.
- **FR-019**: The header MUST provide a language switcher, available on every page, that moves the visitor to the equivalent page in the other language.
- **FR-020**: When a visitor switches language while viewing a specific project, the switcher MUST land them on that same project's page in the other language.
- **FR-021**: The site MUST render usable content for a project even when one of its two language translations is incomplete, rather than showing broken or missing text.
- **FR-022**: The site owner MUST be able to create, edit, reorder, and unpublish/delete projects through a content management interface, without writing or editing code.
- **FR-023**: The content management interface MUST let the site owner choose, per project, whether it is a Video or Photo project via a single choice, and MUST show only the fields relevant to that choice.
- **FR-024**: The content management interface MUST let the site owner provide and edit both Ukrainian and English translations for every translatable project and site field.
- **FR-025**: Changes published by the site owner through the content management interface MUST appear on the live site without requiring any code change, redeploy performed by hand, or developer involvement.
- **FR-026**: The site MUST render correctly on both mobile and desktop screen sizes for every page and both languages.
- **FR-027**: All interactive elements (navigation, language switcher, Work filter, video modal, lightbox, contact links) MUST be operable via keyboard alone, with a visible focus indicator.
- **FR-028**: The site MUST honor a visitor's "reduce motion" preference by disabling or minimizing non-essential animations and transitions.
- **FR-029**: Images displayed across the site (project covers, galleries, portrait) MUST be optimized for size and MUST load lazily as the visitor scrolls to them, rather than all loading immediately on page load.

### Key Entities

- **Project**: A single film or photography work in the portfolio. Holds a type (Video or Photo) that determines which fields apply and how its page renders. Translated into Ukrainian and English: title, role, short description, and (when present) the optional producer/director credit and optional recognition/stats note. Stored once, not language-dependent: year/date, location, and display order — place names and dates read identically in both languages for this project's real launch content, so duplicating them per language would add translation work with no reader-facing benefit. For Video-type projects: a linked video and a behind-the-scenes gallery. For Photo-type projects: a primary photo gallery. A flag marks whether it appears in the homepage's selected-work preview.
- **Site Profile**: The site owner's public identity and contact details — brand name, full name, professional tagline, biography, and portrait, each translated into Ukrainian and English where text-based — plus contact channels (email address, Instagram link, YouTube link).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor can reach any individual project's full detail page within two selections starting from the homepage.
- **SC-002**: A visitor can switch the entire site between Ukrainian and English in a single action from any page, landing on the fully translated equivalent of the page they were on.
- **SC-003**: The Work page's "All", "Films", and "Photography" filters always show a project count and set that exactly matches the projects' underlying type, with zero mismatched or miscategorized items.
- **SC-004**: The homepage's hero brand name, tagline, and poster image are visible to the visitor before the background video has finished loading, on a simulated slow mobile connection.
- **SC-005**: On a simulated slow mobile connection, no showreel or project video downloads any of its remote content until the visitor explicitly opens it.
- **SC-006**: A non-technical site owner can publish a brand-new, fully bilingual project (choosing Video or Photo type) to the live site, unassisted by a developer, in a single content-management session.
- **SC-007**: Every interactive control on the site (navigation, filters, video modal, lightbox, contact links) can be reached and activated using only a keyboard, with the current focus always visibly indicated.
- **SC-008**: When a visitor's device is set to reduce motion, no page shows an auto-playing animation or transition beyond the essential hero video.
- **SC-009**: The site renders without layout errors or overflow on both a typical mobile screen and a typical desktop screen, for every page and both languages.
- **SC-010**: The homepage's photography preview section is present when at least one photo project is published and absent when none are, with no manual toggle required from the site owner.

## Assumptions

- The six existing projects and the existing biography from YERRMAK's current site are used as real launch content, not placeholder data, for the initial version of the site.
- "Reorder" means the site owner controls a single display order for projects that governs both the Work page listing and the homepage's selected-work preview and prev/next navigation.
- A project is exclusively Video or exclusively Photo — a single project never combines a primary YouTube video and a primary photo gallery; a Video project's gallery is understood to be a secondary behind-the-scenes set, not its main content.
- "Recognition/stats" is a short free-text note (e.g. a festival selection or a view count) rather than a structured rating or numeric field with defined units.
- Contact is limited to the three named direct channels (email, Instagram, YouTube); no contact form, live chat, or booking capability is in scope.
- The site does not require visitor accounts, sign-in, payments, or e-commerce capability of any kind.
- Every published page has a counterpart at both the Ukrainian and English paths; there is no page that exists in only one language by design (temporary missing translations are handled per FR-021, not by design).
- The content management interface is used by exactly one site owner; multi-user roles or permission levels are out of scope.
