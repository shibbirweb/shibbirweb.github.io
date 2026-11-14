# Home page

> **In short:** `src/app/page.tsx` stacks six sections inside one `<main class="home-sections">`. Each section is a folder under `src/components/pages/home/` with its data in a `contents.ts`.

## Files involved

| Folder under `src/components/pages/home/` | Anchor      | Data file                               |
| ----------------------------------------- | ----------- | --------------------------------------- |
| `HeroArea/`                               | `#hero`     | `HeroArea/contents.ts` (social links)   |
| `AboutMeArea/`                            | `#about`    | `AboutMeArea/contents.ts` (facets)      |
| `SkillsArea/`                             | `#skills`   | `SkillsArea/contents.ts`                |
| `ProjectsArea/`                           | `#work`     | `ProjectsArea/contents.ts`              |
| `ArticlesArea/`                           | `#articles` | Latest posts from `src/lib/posts.ts`    |
| `ContactArea/`                            | `#contact`  | `ContactArea/contents.ts` (form fields) |

## Page order

```mermaid
flowchart TD
    P[src/app/page.tsx<br/>main.home-sections] --> S0[SectionUrlSync]
    P --> H[HeroArea]
    P --> A[AboutMeArea]
    P --> SK[SkillsArea]
    P --> PR[ProjectsArea]
    P --> AR[ArticlesArea]
    P --> C[ContactArea]
    H --> H1[GridBackground + ShinyTextAnimation + SocialIcons]
    A --> A1[SystemDiagram on lg, Bento below lg]
    SK --> SK1[SkillsPanel: AiShowcase + BuiltOnDivider + StackOverview]
    PR --> PR1[ProjectGrid of ProjectCard + ResumeBridge]
    AR --> AR1[3 x ArticleCard]
    C --> C1[ContactForm + SocialIcons]
```

## Each section

- **Hero.** Full screen. The name (`HeroName`) uses the Zain font and a shine animation over a pulsing grid. Then the job title and social icons. Name and title come from `constants.ts`. Both animations wait until 5 seconds after the page loads (`DeferredAnimations`), so they stay out of what Lighthouse and other speed tools measure.
- **About me.** Four "facet" cards around a portrait (`Core`). On large screens, `SystemDiagram` draws connector lines when you scroll to it (`useDrawOnScroll`). On smaller screens, `Bento` shows a 2x2 grid.
- **Skills.** AI comes first. `SkillsPanel` is a borderless backdrop with a soft violet glow at the top. The top half (`AiShowcase`) shows four featured AI skills as bordered `SkillCard`s (icon, name, one-line `summary`) and the rest of the AI toolkit as `SkillChip` pills. A `BuiltOnDivider` ("Built on") joins it to the bottom half (`StackOverview`): the full-stack skills as labelled `StackGroup` rows of chips. Cards and chips share the cards' hover: the border brightens and a brand-coloured arc follows the cursor (chips rest on a soft fill with no visible border). Each skill can set a brand `color`.
- **Projects** (heading "Open Source"). Two `ProjectGroup`s: "Packages & Plugins" shows the first 4 cards and "Personal Projects" the first 2, and each has its own "Show more" (`MoreProjects`) for the rest. The counts are `collapsedPackageProjectCount` and `collapsedPersonalProjectCount` in `contents.ts`. Then a link to `/resume`. Card glow colours are spread around the colour wheel by index.
- **Articles.** The 3 newest posts as cards and a "View all articles" link. The section is hidden when there are no posts.
- **Contact.** A form with captcha. See [Contact form](Contact-Form.md).

## Section backgrounds

Each `<section>` inside `main.home-sections` is at least one screen tall and has a soft vertical colour swell. The colours cycle indigo, blue, yellow, teal (`nth-of-type` in `globals.css`). The hero is a `<div>`, so the cycle starts at About. See [Page backgrounds](Page-Backgrounds.md).

## How to change it

- **Edit text or lists:** change the section's `contents.ts`. Keep `index.tsx` thin.
- **Change name, title, links:** edit `src/config/constants.ts`.
- **Add a skill:** drop its logo into `public/icons/skills/<name>.svg` (a 24x24 `viewBox`; only the shape is used), then put the skill in `SkillsArea/contents.ts` with `icon: '<name>'`: `featuredAiSkills` (needs a `summary`), `aiToolkit`, or the right row of `stackGroups`.
- **Add a section:** create a folder with `index.tsx`, add it to `page.tsx`, add its id to `homeSectionIds` in `Navbar/contents.ts`, and give its surfaces the accent bloom (see [Design system](Design-System.md)).

## Good to know

- **Skill logos load lazily.** They are not inline SVG: each `SkillIcon` is a CSS mask pointing at its file in `public/icons/skills/`, painted with `currentColor`. `SkillIconsRegion` turns the masks on only when the section is about 600px from the screen (`useHasNearedViewport`), so the logos stay out of the page's HTML and start-up. Skill names, headings and summaries are plain text in the static HTML, so search engines see everything.

- Section headings use the shared `SectionHeading` from `src/components/pages/common/`.
- `AnimatedUnderline` and `DotBackground` exist but are not used on any page right now.

## Related pages

- [Contact form](Contact-Form.md)
- [Navigation and scroll](Navigation-and-Scroll.md)
- [Design system](Design-System.md)
