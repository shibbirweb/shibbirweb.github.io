import { homeSectionIds } from '@/components/layout/Navbar/contents';
import { socialLinks } from '@/components/pages/home/HeroArea/contents';
import {
    collapsedPackageProjectCount,
    packageProjects,
} from '@/components/pages/home/ProjectsArea/contents';
import { personGivenName, professionalTitle } from '@/config/constants';
import { expect, publishedArticles, test } from '@tests/e2e/fixtures';

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

    test('reveals the remaining packages with "Show more"', async ({
        page,
    }) => {
        test.skip(
            packageProjects.length <= collapsedPackageProjectCount,
            'every package already fits in the collapsed grid'
        );
        const toggle = page
            .locator('#work')
            .getByRole('button', { name: 'Show more' });

        await toggle.scrollIntoViewIfNeeded();
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await toggle.click();

        const expanded = page
            .locator('#work')
            .getByRole('button', { name: 'Show less' });
        await expect(expanded).toHaveAttribute('aria-expanded', 'true');
        const revealRegion = page.locator(
            `#${await expanded.getAttribute('aria-controls')}`
        );
        await expect(revealRegion).toBeVisible();
    });

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
