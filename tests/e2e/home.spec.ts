import { homeSectionIds } from '@/components/layout/Navbar/contents';
import { socialLinks } from '@/components/pages/home/HeroArea/contents';
import {
    collapsedPackageProjectCount,
    collapsedPersonalProjectCount,
    packageProjects,
    personalProjects,
} from '@/components/pages/home/ProjectsArea/contents';
import {
    aiShowcaseTitle,
    aiToolkit,
    aiToolkitTitle,
    featuredAiSkills,
    stackGroups,
    stackOverviewTitle,
} from '@/components/pages/home/SkillsArea/contents';
import { personGivenName, professionalTitle } from '@/config/constants';
import {
    expect,
    publishedArticles,
    test,
    waitForHydration,
} from '@tests/e2e/fixtures';

// The ids match the `revealRegionId` each ProjectGroup gets in ProjectsArea.
const projectGroups = [
    {
        name: 'package',
        projects: packageProjects,
        collapsedCount: collapsedPackageProjectCount,
        revealRegionId: 'more-package-projects',
    },
    {
        name: 'personal',
        projects: personalProjects,
        collapsedCount: collapsedPersonalProjectCount,
        revealRegionId: 'more-personal-projects',
    },
];

test.describe('home page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('shows the hero with the name and professional title', async ({
        page,
    }) => {
        const hero = page.locator('#hero');

        await expect(hero.getByRole('heading', { level: 1 })).toContainText(
            personGivenName
        );
        await expect(hero.getByText(professionalTitle)).toBeVisible();
    });

    test('renders every home section in the page', async ({ page }) => {
        for (const sectionId of homeSectionIds) {
            const section = page.locator(`#${sectionId}`);
            await section.scrollIntoViewIfNeeded();
            await expect(section, `#${sectionId}`).toBeVisible();
        }
    });

    test('links every social profile in a new tab', async ({ page }) => {
        const links = page.locator('#hero a[target="_blank"]');

        await expect(links).toHaveCount(socialLinks.length);
        for (const link of await links.all()) {
            await expect(link).toHaveAttribute('rel', /noopener/);
            await expect(link).toHaveAccessibleName(/.+/);
        }
    });

    test('leads the skills section with the AI engineering panel', async ({
        page,
    }) => {
        const skills = page.locator('#skills');
        const panelHeading = skills.getByRole('heading', {
            level: 3,
            name: aiShowcaseTitle,
        });
        const stackHeading = skills.getByRole('heading', {
            level: 3,
            name: stackOverviewTitle,
        });

        await panelHeading.scrollIntoViewIfNeeded();
        await expect(panelHeading).toBeVisible();
        for (const skill of featuredAiSkills) {
            await expect(
                skills.getByRole('heading', {
                    level: 4,
                    name: skill.name,
                    exact: true,
                })
            ).toBeVisible();
        }
        await expect(
            skills
                .getByRole('list', { name: aiToolkitTitle })
                .getByRole('listitem')
        ).toHaveCount(aiToolkit.length);

        const panelTop = (await panelHeading.boundingBox())?.y ?? 0;
        const stackTop = (await stackHeading.boundingBox())?.y ?? 0;
        expect(stackTop).toBeGreaterThan(panelTop);
    });

    test('borders the featured AI cards, not the panel around them', async ({
        page,
    }) => {
        const panel = page.locator('#skills [data-skills-panel]');
        const featuredCards = panel.locator('li[data-spotlight-surface]', {
            has: page.getByRole('heading', { level: 4 }),
        });

        await panel.scrollIntoViewIfNeeded();
        await expect(panel).toHaveCSS('border-top-width', '0px');
        await expect(featuredCards).toHaveCount(featuredAiSkills.length);
        for (const card of await featuredCards.all()) {
            await expect(card).toHaveCSS('border-top-width', '1px');
        }
        await expect(
            panel.getByRole('heading', { level: 3, name: stackOverviewTitle })
        ).toBeAttached();
    });

    test('lists every full-stack row with its skills', async ({ page }) => {
        const skills = page.locator('#skills');

        for (const group of stackGroups) {
            const row = skills.getByRole('list', {
                name: group.title,
                exact: true,
            });
            await row.scrollIntoViewIfNeeded();
            await expect(row, group.title).toBeVisible();
            await expect(row.getByRole('listitem')).toHaveCount(
                group.skills.length
            );
        }
    });

    test('loads the skill logos only once the section nears the screen', async ({
        page,
    }) => {
        const logoRequests: string[] = [];
        page.on('request', (request) => {
            if (request.url().includes('/icons/skills/')) {
                logoRequests.push(request.url());
            }
        });
        await page.goto('/');
        await waitForHydration(page);

        const region = page.locator('#skills [data-skill-icons]');
        await expect(region).toHaveAttribute('data-skill-icons', 'pending');
        expect(logoRequests).toEqual([]);

        await page.locator('#skills').scrollIntoViewIfNeeded();
        await expect(region).toHaveAttribute('data-skill-icons', 'ready');
        await expect(
            page.locator('#skills [data-skill-icon="claude"]')
        ).toHaveCSS('mask-image', /icons\/skills\/claude\.svg/);
        await expect.poll(() => logoRequests.length).toBeGreaterThan(0);
    });

    test('blooms a skill chip logo to its brand colour on hover', async ({
        page,
    }, testInfo) => {
        test.skip(
            testInfo.project.name === 'mobile' ||
                testInfo.project.name === 'tablet',
            'touch devices have no hover'
        );
        const chip = page
            .locator('#skills')
            .getByRole('listitem')
            .filter({ hasText: /^Claude$/ });
        const logo = chip.locator('[data-skill-icon]');

        await chip.scrollIntoViewIfNeeded();
        await expect(logo).not.toHaveCSS('color', 'rgb(217, 119, 87)');
        await chip.hover();
        await expect(logo).toHaveCSS('color', 'rgb(217, 119, 87)');
    });

    test('lights a skill chip border near the cursor on hover', async ({
        page,
    }, testInfo) => {
        test.skip(
            testInfo.project.name === 'mobile' ||
                testInfo.project.name === 'tablet',
            'touch devices have no hover'
        );
        const chip = page
            .locator('#skills')
            .getByRole('listitem')
            .filter({ hasText: /^Vector Search$/ });
        const litEdge = chip.locator('span[aria-hidden]').last();

        await chip.scrollIntoViewIfNeeded();
        await expect(chip).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
        await expect(litEdge).toHaveCSS('opacity', '0');
        await chip.hover();
        await expect(chip).not.toHaveCSS(
            'border-top-color',
            'rgba(0, 0, 0, 0)'
        );
        await expect(litEdge).toHaveCSS('opacity', '1');
        await expect(chip).toHaveCSS('cursor', 'pointer');
    });

    for (const group of projectGroups) {
        test(`reveals the remaining ${group.name} projects with "Show more"`, async ({
            page,
        }) => {
            test.skip(
                group.projects.length <= group.collapsedCount,
                `every ${group.name} project already fits in the collapsed grid`
            );
            const toggle = page.locator(
                `#work button[aria-controls="${group.revealRegionId}"]`
            );
            const revealRegion = page.locator(`#${group.revealRegionId}`);

            await toggle.scrollIntoViewIfNeeded();
            await expect(toggle).toHaveText('Show more');
            await expect(toggle).toHaveAttribute('aria-expanded', 'false');
            await expect(revealRegion).toBeHidden();
            await toggle.click();

            await expect(toggle).toHaveText('Show less');
            await expect(toggle).toHaveAttribute('aria-expanded', 'true');
            await expect(revealRegion).toBeVisible();
        });
    }

    test('teases the newest articles', async ({ page }) => {
        const articles = publishedArticles();
        test.skip(articles.length === 0, 'no published articles');
        const teaser = page.locator('#articles');
        const expectedCount = Math.min(3, articles.length);

        await teaser.scrollIntoViewIfNeeded();
        for (const article of articles.slice(0, expectedCount)) {
            await expect(
                teaser.locator(`a[href="${article.path}"]`).first()
            ).toBeAttached();
        }
        await expect(
            teaser.getByRole('link', { name: 'View all articles' })
        ).toHaveAttribute('href', '/articles');
    });
});

test.describe('hero animations', () => {
    test('stay still until 5 seconds after the page loads', async ({
        page,
    }) => {
        // The fake clock flows in real time until runFor skips it ahead, so
        // hydration still settles normally before the delay is fast-forwarded.
        await page.clock.install();
        await page.goto('/');
        await waitForHydration(page);

        const hero = page.locator('#hero');
        const nameShine = hero.getByRole('heading', { level: 1 }).locator('..');
        const gridPulse = hero.locator('> div').last();

        await expect(nameShine).toHaveCSS('animation-name', 'none');
        await expect(gridPulse).toHaveCSS('animation-name', 'none');

        await page.clock.runFor(5_000);

        await expect(nameShine).toHaveCSS('animation-name', /shine/);
        await expect(gridPulse).toHaveCSS('animation-name', 'pulse');
    });
});
