import { homeSectionIds } from '@/components/layout/Navbar/contents';
import { socialLinks } from '@/components/pages/home/HeroArea/contents';
import {
    collapsedPackageProjectCount,
    collapsedPersonalProjectCount,
    packageProjects,
    personalProjects,
} from '@/components/pages/home/ProjectsArea/contents';
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
