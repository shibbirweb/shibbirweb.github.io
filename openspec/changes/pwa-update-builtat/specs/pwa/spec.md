## MODIFIED Requirements

### Requirement: Build version endpoint

The site SHALL expose a static `version.json` describing the current build, and SHALL bake the same build identity into the client bundle, so the running client can compare its own build against the deployed one. The build identity SHALL be a `builtAt` timestamp (ISO 8601, produced at build time) that advances on every build, so newer builds are distinguishable from older ones by comparison. The endpoint SHALL NOT emit a numeric `version` field.

#### Scenario: Version endpoint is emitted

- **WHEN** `pnpm build` completes
- **THEN** `out/version.json` exists and contains a `builtAt` timestamp and no `version` field

#### Scenario: Build identity advances across builds

- **WHEN** a build follows a previous one
- **THEN** its `builtAt` timestamp is strictly later than the previous deployed build's `builtAt`

#### Scenario: Client and endpoint agree at build time

- **WHEN** a freshly deployed build serves `version.json`
- **THEN** its `builtAt` matches the `builtAt` baked into the client that was shipped with it

### Requirement: Update-available notification and reload

When a newer build is detected, the site SHALL show a non-blocking notification offering to reload, and SHALL swap to the latest content on the visitor's action rather than interrupting them automatically.

#### Scenario: New deploy detected via service worker lifecycle

- **WHEN** a new build is deployed and a tab with the old build triggers a service worker update that enters the `waiting` state
- **THEN** a non-blocking "New version available, Reload" notification appears

#### Scenario: New deploy detected via version poll

- **WHEN** a long-lived tab polls `version.json` and its `builtAt` is strictly later than the client's baked `builtAt`
- **THEN** the client checks for a service worker update so the notification can surface without waiting for the browser's periodic byte-check

#### Scenario: Poll is not masked by caching

- **WHEN** the client polls `version.json`
- **THEN** the request is cache-busted (a per-request query and `no-store`) so an intermediary cache cannot hide a fresh deploy, and each poll reflects the currently deployed build

#### Scenario: Applying the update

- **WHEN** the visitor activates the reload action in the notification
- **THEN** the waiting service worker takes control and the page reloads to the latest content

#### Scenario: No interruption without action

- **WHEN** a new version is available but the visitor has not acted on the notification
- **THEN** the current page is not reloaded automatically and reading is uninterrupted
