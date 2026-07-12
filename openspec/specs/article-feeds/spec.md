# article-feeds Specification

## Purpose
TBD - created by archiving change feed-and-polish-pack. Update Purpose after archive.
## Requirements
### Requirement: RSS 2.0 feed

The system SHALL serve a valid RSS 2.0 feed as a static file at `/feed.xml` with content type `application/rss+xml`, listing every published (non-draft) article newest first.

#### Scenario: Feed lists published articles

- **WHEN** the site is built and `/feed.xml` is requested
- **THEN** the response is well-formed RSS 2.0 XML containing channel metadata (title, link, description, language, `lastBuildDate`, self `atom:link`) and one `<item>` per published article, ordered newest first

#### Scenario: Item carries full content and metadata

- **WHEN** an article appears as an `<item>`
- **THEN** it includes `<title>`, an absolute `<link>` and `<guid>`, `<pubDate>` in RFC-822 format, a `<category>` per tag, and the full rendered article HTML in `<content:encoded>` wrapped in CDATA

#### Scenario: No published articles

- **WHEN** there are no published articles
- **THEN** the build still produces a valid RSS feed with channel metadata and zero items rather than failing

### Requirement: Atom 1.0 feed

The system SHALL serve a valid Atom 1.0 feed as a static file at `/atom.xml` with content type `application/atom+xml`, listing every published article newest first.

#### Scenario: Feed structure

- **WHEN** `/atom.xml` is requested
- **THEN** the response is well-formed Atom 1.0 XML with a feed `<id>`, `<title>`, `<updated>`, an `<author>`, a self `<link rel="self">`, and one `<entry>` per published article

#### Scenario: Entry content and dates

- **WHEN** an article appears as an `<entry>`
- **THEN** it includes `<id>`, `<title>`, an absolute `<link>`, `<updated>` and `<published>` in RFC-3339 format, and the full rendered article HTML in `<content type="html">`

### Requirement: JSON Feed 1.1 feed

The system SHALL serve a valid JSON Feed 1.1 document as a static file at `/feed.json` with content type `application/feed+json`, listing every published article newest first.

#### Scenario: Feed structure

- **WHEN** `/feed.json` is requested
- **THEN** the response is valid JSON with `version` `https://jsonfeed.org/version/1.1`, `title`, `home_page_url`, `feed_url`, `authors`, and an `items` array ordered newest first

#### Scenario: Item content and dates

- **WHEN** an article appears in `items`
- **THEN** it includes `id`, `url`, `title`, `content_html` with the full rendered article HTML, `date_published`, and `date_modified` (when the article was updated), all dates in RFC-3339 format

### Requirement: Absolute URLs and shared source of truth

Every link and image reference in every feed SHALL be an absolute URL, and all channel/author values SHALL come from `src/config/constants.ts` rather than being hardcoded.

#### Scenario: Absolute links

- **WHEN** any feed references an article page or image
- **THEN** the URL is absolute (begins with the configured `siteURL`), and article images resolve to a crawlable raster the same way the sitemap does

#### Scenario: Config-sourced channel data

- **WHEN** feed channel metadata (site name, description, author, author email, site URL) is emitted
- **THEN** its values are read from `src/config/constants.ts`, with no personal data duplicated in feed code

### Requirement: Feed autodiscovery

The site head SHALL advertise all three feeds via `<link rel="alternate">` tags so browsers and readers can discover them automatically.

#### Scenario: Discovery links present

- **WHEN** any page of the site is loaded
- **THEN** the document `<head>` contains `<link rel="alternate">` entries for `application/rss+xml` (`/feed.xml`), `application/atom+xml` (`/atom.xml`), and `application/feed+json` (`/feed.json`)

