## ADDED Requirements

### Requirement: Page-visit tracking on every route change

The system SHALL push a `page_view` event to the GTM `dataLayer` on initial page load and on every subsequent client-side App Router navigation. The event MUST include `page_path` (the current pathname) and `page_title` (the document title at navigation time). Tracking SHALL be active only when `process.env.NODE_ENV === 'production'`, matching the existing GTM gate.

#### Scenario: Landing on the site

- **WHEN** a visitor first loads any route in production
- **THEN** exactly one `page_view` event is pushed to `dataLayer` with `page_path` set to that route's pathname and `page_title` set to the document title

#### Scenario: Client-side navigation between routes

- **WHEN** a visitor navigates client-side from one route to another (e.g. `/` to `/now`)
- **THEN** a new `page_view` event is pushed for the destination pathname without a full page reload

#### Scenario: Development environment

- **WHEN** the app runs with `NODE_ENV` other than `production`
- **THEN** no analytics events are pushed and no tracker is mounted

### Requirement: Distinct article-view tracking

The system SHALL, in addition to the `page_view` event, push a distinct `article_view` event to the GTM `dataLayer` when the visited route is an individual article detail page (`/articles/<slug>`, a single path segment after `/articles/` that is not the reserved `search` segment). The `article_view` event MUST include `article_slug` (the URL slug) and `article_title` (the document title at navigation time).

#### Scenario: Viewing an article

- **WHEN** a visitor is on `/articles/<slug>` where `<slug>` is a single path segment and not `search`
- **THEN** both a `page_view` event and a separate `article_view` event are pushed, the latter carrying `article_slug` and `article_title`

#### Scenario: Article index and search are not article views

- **WHEN** a visitor is on `/articles` or `/articles/search`
- **THEN** a `page_view` event is pushed but no `article_view` event is pushed

### Requirement: Events forwardable to GA4 without duplication

The emitted `dataLayer` events SHALL be structured as custom events (named `page_view` and `article_view`) so that a GTM container can forward them to GA4 via Custom Event triggers. The design SHALL document the required GTM container configuration and SHALL avoid duplicate landing-page hits by not relying on GTM's built-in Page View trigger for the same measurement.

#### Scenario: GTM forwards a page visit to GA4

- **WHEN** the GTM container has a GA4 event tag bound to the `page_view` Custom Event trigger
- **THEN** each `page_view` dataLayer push results in exactly one GA4 event, with no duplicate hit from GTM's built-in Page View trigger
