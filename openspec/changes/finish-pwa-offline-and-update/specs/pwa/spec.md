## ADDED Requirements

### Requirement: Service worker registration

The site SHALL register a service worker in production only, so the static export gains offline capability without affecting the turbopack dev server.

#### Scenario: Registered in production
- **WHEN** a visitor loads the production site
- **THEN** the service worker at `/sw.js` is registered and reaches an activated state

#### Scenario: Absent in development
- **WHEN** the site runs under `pnpm dev`
- **THEN** no service worker is registered and turbopack HMR is unaffected

#### Scenario: Emitted into the static export
- **WHEN** `pnpm build` completes
- **THEN** `out/sw.js` exists and is non-empty and is served from the site root

### Requirement: Offline runtime caching of visited pages

The service worker SHALL cache pages and their assets at runtime, so a page or article a visitor has already opened remains readable without a network connection.

#### Scenario: Visited page works offline
- **WHEN** a visitor opens an article while online and later loads it with no network
- **THEN** the previously visited article and the app shell render from cache

#### Scenario: Unvisited page while offline
- **WHEN** a visitor navigates to a route they have not visited while offline
- **THEN** an offline fallback response is served rather than a browser error page

#### Scenario: Static assets served from cache
- **WHEN** a visited page requests already-cached static assets (scripts, styles, images)
- **THEN** those assets are served from the cache without a network round trip

### Requirement: Build version endpoint

The site SHALL expose a static `version.json` describing the current build, and SHALL bake the same build version into the client bundle, so the running client can compare its own version against the deployed one. The `version` SHALL be a monotonically increasing integer that advances on each build, so newer builds are distinguishable from older ones by comparison.

#### Scenario: Version endpoint is emitted
- **WHEN** `pnpm build` completes
- **THEN** `out/version.json` exists and contains an integer `version` and a `builtAt` field

#### Scenario: Version increases across builds
- **WHEN** a build follows a new commit
- **THEN** its `version` integer is greater than the previous deployed build's `version`

#### Scenario: Client and endpoint agree at build time
- **WHEN** a freshly deployed build serves `version.json`
- **THEN** its `version` matches the build version baked into the client that was shipped with it

### Requirement: Update-available notification and reload

When a newer build is detected, the site SHALL show a non-blocking notification offering to reload, and SHALL swap to the latest content on the visitor's action rather than interrupting them automatically.

#### Scenario: New deploy detected via service worker lifecycle
- **WHEN** a new build is deployed and a tab with the old build triggers a service worker update that enters the `waiting` state
- **THEN** a non-blocking "New version available, Reload" notification appears

#### Scenario: New deploy detected via version poll
- **WHEN** a long-lived tab polls `version.json` and its `version` is greater than the client's baked build version
- **THEN** the client checks for a service worker update so the notification can surface without waiting for the browser's periodic byte-check

#### Scenario: Applying the update
- **WHEN** the visitor activates the reload action in the notification
- **THEN** the waiting service worker takes control and the page reloads to the latest content

#### Scenario: No interruption without action
- **WHEN** a new version is available but the visitor has not acted on the notification
- **THEN** the current page is not reloaded automatically and reading is uninterrupted
