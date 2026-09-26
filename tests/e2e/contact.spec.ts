import type { Page, Request } from '@playwright/test';
import {
    submitLabel,
    successTitle,
} from '@/components/pages/home/ContactArea/contents';
import { expect, test } from '@tests/e2e/fixtures';

const HCAPTCHA_SCRIPT = /^https:\/\/js\.hcaptcha\.com\//;
const WEB3FORMS_SUBMIT = 'https://api.web3forms.com/submit';
const CAPTCHA_TOKEN = 'e2e-captcha-token';

// A stand-in for the hCaptcha API: render() draws one button that "solves"
// the challenge, so the real form flow runs without the real widget.
const MOCK_HCAPTCHA_API = `
window.hcaptcha = {
    render: function (container, options) {
        var button = document.createElement('button');
        button.type = 'button';
        button.textContent = 'Solve mock captcha';
        button.onclick = function () { options.callback('${CAPTCHA_TOKEN}'); };
        container.appendChild(button);
        return 'mock-widget';
    },
    reset: function () {},
    remove: function () {},
};
`;

async function mockCaptcha(page: Page) {
    await page.route(HCAPTCHA_SCRIPT, (route) =>
        route.fulfill({
            contentType: 'text/javascript',
            body: MOCK_HCAPTCHA_API,
        })
    );
}

async function fillForm(page: Page) {
    const form = page.locator('#contact form');
    await form.getByLabel('Name').fill('E2E Tester');
    await form.getByLabel('Email').fill('e2e@example.com');
    await form.getByLabel('Message').fill('Hello from the browser tests.');
}

test.describe('contact form', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.locator('#contact').scrollIntoViewIfNeeded();
    });

    test('does not download hCaptcha until the visitor engages', async ({
        page,
    }) => {
        const captchaRequests: Request[] = [];
        page.on('request', (request) => {
            if (HCAPTCHA_SCRIPT.test(request.url())) {
                captchaRequests.push(request);
            }
        });
        await mockCaptcha(page);

        await page.waitForTimeout(500);
        expect(captchaRequests).toHaveLength(0);

        await page.locator('#contact form').getByLabel('Name').focus();
        await expect
            .poll(() => captchaRequests.length, { timeout: 5_000 })
            .toBe(1);
    });

    test('keeps Send disabled until the captcha is solved', async ({
        page,
    }) => {
        await mockCaptcha(page);
        await fillForm(page);
        const send = page.getByRole('button', { name: submitLabel });

        await expect(send).toBeDisabled();
        await page.getByRole('button', { name: 'Solve mock captcha' }).click();
        await expect(send).toBeEnabled();
    });

    test('sends the message and shows the success state', async ({ page }) => {
        await mockCaptcha(page);
        let payload: Record<string, string> = {};
        await page.route(WEB3FORMS_SUBMIT, async (route) => {
            payload = route.request().postDataJSON();
            await route.fulfill({ json: { success: true, message: 'OK' } });
        });

        await fillForm(page);
        await page.getByRole('button', { name: 'Solve mock captcha' }).click();
        await page.getByRole('button', { name: submitLabel }).click();

        await expect(page.getByText(successTitle)).toBeVisible();
        expect(payload).toMatchObject({
            name: 'E2E Tester',
            email: 'e2e@example.com',
            message: 'Hello from the browser tests.',
            'h-captcha-response': CAPTCHA_TOKEN,
        });
        expect(payload.access_key).toBeTruthy();
    });

    test('shows the provider error and keeps the form', async ({ page }) => {
        await mockCaptcha(page);
        await page.route(WEB3FORMS_SUBMIT, (route) =>
            route.fulfill({
                status: 429,
                json: { success: false, message: 'Too many requests' },
            })
        );

        await fillForm(page);
        await page.getByRole('button', { name: 'Solve mock captcha' }).click();
        await page.getByRole('button', { name: submitLabel }).click();

        await expect(page.locator('#contact').getByRole('alert')).toContainText(
            'Too many requests'
        );
        await expect(
            page.locator('#contact form').getByLabel('Name')
        ).toHaveValue('E2E Tester');
    });
});
