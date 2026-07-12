## MODIFIED Requirements

### Requirement: Live theme synchronization

The comment widget SHALL initialize with a custom giscus theme that matches the site color scheme, derived from the site's currently resolved theme (light or dark), and SHALL update the giscus theme live when the site theme changes, without a page reload. The theme value SHALL be a full, origin-derived URL to a site-hosted giscus theme stylesheet (`${origin}/giscus-light.css` or `${origin}/giscus-dark.css`) rather than a built-in `light`/`dark` preset, so the widget palette matches the site and the widget renders as a rounded card in the site design system (like `ProjectCard`: hairline `foreground/10` border, rounded corners, faint fill, crimson inline-code chips, JetBrains Mono).

#### Scenario: Initial theme matches the site

- **WHEN** the widget first loads
- **THEN** its `data-theme` is set to the origin-derived custom theme URL for the resolved site theme (`getResolvedTheme()` in `@/components/layout/ThemeToggle/theme`), `dark` yielding `${origin}/giscus-dark.css` and otherwise `${origin}/giscus-light.css`

#### Scenario: Theme toggle flips the widget

- **WHEN** the reader changes the site theme (manual toggle, or an OS scheme change while on `system`)
- **THEN** the widget receives a `postMessage` `setConfig` update whose `theme` is the origin-derived custom theme URL for the new resolved theme, and re-themes to match with no reload

#### Scenario: Custom theme matches the site palette

- **WHEN** the custom giscus theme stylesheet loads inside the widget
- **THEN** the widget renders as a rounded card in the site design system (like `ProjectCard`: hairline `foreground/10` border, rounded corners, faint fill, crimson inline-code chips), and text, borders, input/comment surfaces, and accent colors match the site palette (`--foreground` and the muted site accent) in both light and dark
