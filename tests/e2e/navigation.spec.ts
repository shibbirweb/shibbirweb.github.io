import { expect, test } from '@tests/e2e/fixtures';

test.describe('desktop navigation', () => {
    test.skip(({ isMobile }) => isMobile, 'desktop navbar only');

    test('scrolls to a section and writes its hash', async ({ page }) => {
        await page.goto('/');
        await page
            .getByRole('navigation', { name: 'Primary' })
            .getByRole('link', { name: 'Skills' })
            .click();

        await expect(page).toHaveURL(/#skills$/);
        await expect(page.locator('#skills')).toBeInViewport();
    });

    test('keeps the hash in step while scrolling', async ({ page }) => {
        await page.goto('/');
        await page.locator('#contact').scrollIntoViewIfNeeded();

        await expect(page).toHaveURL(/#contact$/);
    });

    test('lands on the section named in the URL', async ({ page }) => {
        await page.goto('/#work');

        await expect(page.locator('#work')).toBeInViewport({ timeout: 10_000 });
    });

    test('still lands on the section on a slow device', async ({
        page,
        browserName,
    }) => {
        test.skip(browserName !== 'chromium', 'CPU throttling needs Chromium');
        // A 4x slower CPU used to cut the smooth glide short, leaving the
        // visitor at the top with the hash dropped.
        const devtools = await page.context().newCDPSession(page);
        await devtools.send('Emulation.setCPUThrottlingRate', { rate: 4 });
        await page.goto('/#work');

        await expect(page.locator('#work')).toBeInViewport({ timeout: 10_000 });
        await page.waitForTimeout(2_000);
        await expect(page.locator('#work')).toBeInViewport();
        await expect(page).toHaveURL(/#work$/);
    });

    test('opens each top-level page', async ({ page }) => {
        const primary = page.getByRole('navigation', { name: 'Primary' });
        for (const [name, path] of [
            ['Articles', '/articles'],
            ['Uses', '/uses'],
            ['Now', '/now'],
            ['Resume', '/resume'],
        ]) {
            await page.goto('/');
            await primary.getByRole('link', { name, exact: true }).click();
            await expect(page).toHaveURL(new RegExp(`${path}$`));
            await expect(page.locator('main#main')).toBeVisible();
        }
    });

    test('offers a skip link as the first focusable element', async ({
        page,
    }) => {
        await page.goto('/');
        await page.keyboard.press('Tab');

        await expect(
            page.getByRole('link', { name: 'Skip to content' })
        ).toBeFocused();
    });
});

test.describe('mobile navigation', () => {
    test.skip(({ isMobile }) => !isMobile, 'mobile menu only');

    test('opens and closes the menu', async ({ page }) => {
        await page.goto('/');
        const menuButton = page.getByRole('button', { name: 'Open menu' });

        await menuButton.click();
        await expect(
            page.getByRole('button', { name: 'Close menu' })
        ).toHaveAttribute('aria-expanded', 'true');
        await page.keyboard.press('Escape');
        await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    test('navigates from the menu and closes it', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: 'Open menu' }).click();
        await page.getByRole('link', { name: 'Uses', exact: true }).click();

        await expect(page).toHaveURL(/\/uses$/);
        await expect(
            page.getByRole('button', { name: 'Open menu' })
        ).toHaveAttribute('aria-expanded', 'false');
    });
});
