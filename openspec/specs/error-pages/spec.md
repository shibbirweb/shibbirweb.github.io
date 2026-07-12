# error-pages Specification

## Purpose
TBD - created by archiving change feed-and-polish-pack. Update Purpose after archive.
## Requirements
### Requirement: Branded 404 page

The system SHALL provide a branded not-found page that is statically exported to `out/404.html` and reuses the site's existing layout and section primitives.

#### Scenario: Unknown path

- **WHEN** a visitor requests a path that does not exist on the deployed site
- **THEN** GitHub Pages serves the branded 404 page (from `out/404.html`) showing a clear not-found heading, short explanatory copy, and working links back to the home page and to the articles index

#### Scenario: Reuses existing primitives

- **WHEN** the 404 page renders
- **THEN** it composes existing shared primitives (such as `SectionHeading` and `cn`) and the site layout rather than introducing a separate styling system

### Requirement: Client error boundary

The system SHALL provide a branded client error boundary that catches runtime render errors on the exported site.

#### Scenario: Runtime render error

- **WHEN** a client-side render error occurs on a page
- **THEN** the branded error boundary renders a message, a control that invokes `reset()` to retry, and a link back to the home page

