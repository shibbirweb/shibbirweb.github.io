## 1. Shared feed builder

- [x] 1.1 Create `src/lib/feed.ts` exporting a builder that returns channel metadata (from `src/config/constants.ts`: `siteURL`, `siteName`, `siteDescription`, `siteAuthor`, `siteAuthorEmail`, `twitterUsername`) plus ordered feed items.
- [x] 1.2 Load ordered summaries via `getAllArticles()` and full rendered HTML via `getArticle(slug)` from `src/lib/posts.ts`; build absolute article URLs and image URLs (reuse the sitemap's cover/OG raster logic in `src/utils/generateArticleCover`).
- [x] 1.3 Add date formatters: RFC-822 (RSS) and RFC-3339 (Atom/JSON) built from `new Date(\`${date}T00:00:00\`)`; expose `date` and optional `updated`.
- [x] 1.4 Add an XML text-escaping helper; wrap full HTML bodies in CDATA for XML feeds.
- [x] 1.5 Guard the empty-corpus case so the builder returns valid channel metadata with zero items.

## 2. Feed route handlers

- [x] 2.1 Create `src/app/feed.xml/route.ts` (`dynamic = 'force-static'`, `GET`) emitting RSS 2.0 with `content:encoded`, self `atom:link`, `lastBuildDate`, per-item `guid`/`pubDate`/`category`; `Content-Type: application/rss+xml`.
- [x] 2.2 Create `src/app/atom.xml/route.ts` emitting Atom 1.0 with feed `<id>`, self `<link rel="self">`, `<author>`, and `<entry>` items (`content type="html"`, `<updated>`, `<published>`); `Content-Type: application/atom+xml`.
- [x] 2.3 Create `src/app/feed.json/route.ts` emitting JSON Feed 1.1 (`version`, `title`, `home_page_url`, `feed_url`, `authors`, `items[].content_html`, `date_published`, `date_modified`); `Content-Type: application/feed+json`.

## 3. Feed discovery

- [x] 3.1 Add `alternates.types` for the three feeds to the root `metadata` in `src/app/layout.tsx` (RSS, Atom, JSON Feed), using absolute URLs from `siteURL`.

## 4. Error pages

- [x] 4.1 Create `src/app/not-found.tsx` (server component) using `SectionHeading` and `cn`, with a not-found heading, short copy, and links to `/` and `/articles`.
- [x] 4.2 Create `src/app/error.tsx` (`'use client'`, `{ error, reset }`) with a branded message, a `reset()` retry control, and a home link. Extract shared markup into `src/components/` if it grows.

## 5. Verify

- [x] 5.1 `pnpm build` succeeds and writes `out/feed.xml`, `out/atom.xml`, `out/feed.json`, `out/404.html`.
- [x] 5.2 Validate feeds: `xmllint --noout` on the XML feeds; `JSON.parse` on `feed.json`; eyeball absolute URLs, one item per published article, full HTML present, valid dates.
- [x] 5.3 Serve `out/` locally: open each feed URL, confirm the `<link rel="alternate">` tags in the home `<head>`, and hit an unknown path to see the branded 404.
- [x] 5.4 `pnpm lint` is clean.
