import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import ImageLightbox from '@/components/pages/articles/ImageLightbox';

/** An article body with three content images and one inside an embedded gist. */
function addArticleImages() {
    const article = document.createElement('article');
    article.innerHTML = `
        <div class="prose">
            <img src="/images/first.png" alt="The router rack">
            <p>Some prose.</p>
            <img src="/images/second.png" alt="Pi-hole dashboard">
            <img src="/images/third.png" alt="">
            <div class="gist-embed"><img src="/images/gist.png" alt="Gist avatar"></div>
        </div>
    `;
    document.body.appendChild(article);
    return article;
}

function contentImage(alt: string): HTMLImageElement {
    return document.querySelector(
        `article img[alt="${alt}"]`
    ) as HTMLImageElement;
}

function viewer() {
    return screen.getByRole('dialog', { name: 'Image viewer' });
}

function shownImage(): HTMLImageElement {
    return viewer().querySelector('img') as HTMLImageElement;
}

afterEach(() => {
    document.querySelector('article')?.remove();
});

describe('ImageLightbox', () => {
    it('renders nothing on an article without images', () => {
        const { container } = render(<ImageLightbox />);

        expect(container).toBeEmptyDOMElement();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('turns each content image into a focusable zoom button', () => {
        addArticleImages();

        render(<ImageLightbox />);

        const image = contentImage('The router rack');
        expect(image).toHaveAttribute('role', 'button');
        expect(image).toHaveAttribute('tabindex', '0');
        expect(image).toHaveAttribute('title', 'Click to zoom');
        expect(image.style.cursor).toBe('zoom-in');
    });

    it('leaves images inside embedded gists alone', () => {
        addArticleImages();

        render(<ImageLightbox />);

        const gistImage = contentImage('Gist avatar');
        expect(gistImage).not.toHaveAttribute('role');
        expect(gistImage).not.toHaveAttribute('tabindex');
    });

    it('opens the viewer on click with the image, its alt as caption, and a counter', async () => {
        const user = userEvent.setup();
        addArticleImages();
        render(<ImageLightbox />);

        await user.click(contentImage('Pi-hole dashboard'));

        expect(viewer()).toHaveAttribute('aria-modal', 'true');
        expect(shownImage().getAttribute('src')).toContain(
            '/images/second.png'
        );
        expect(
            within(viewer()).getByText('Pi-hole dashboard')
        ).toBeInTheDocument();
        expect(within(viewer()).getByText('2 / 3')).toBeInTheDocument();
    });

    it('opens the viewer from the keyboard with Enter', () => {
        addArticleImages();
        render(<ImageLightbox />);

        fireEvent.keyDown(contentImage('The router rack'), { key: 'Enter' });

        expect(shownImage().getAttribute('src')).toContain('/images/first.png');
    });

    it('omits the caption when the image has no alt text', async () => {
        const user = userEvent.setup();
        addArticleImages();
        render(<ImageLightbox />);

        await user.click(
            document.querySelector('img[src="/images/third.png"]')!
        );

        expect(within(viewer()).getByText('3 / 3')).toBeInTheDocument();
        expect(viewer().querySelectorAll('p')).toHaveLength(1);
    });

    it('pages with the arrow keys and wraps at both ends', async () => {
        const user = userEvent.setup();
        addArticleImages();
        render(<ImageLightbox />);
        await user.click(contentImage('The router rack'));

        await user.keyboard('{ArrowLeft}');
        expect(within(viewer()).getByText('3 / 3')).toBeInTheDocument();

        await user.keyboard('{ArrowRight}');
        expect(within(viewer()).getByText('1 / 3')).toBeInTheDocument();

        await user.keyboard('{ArrowRight}');
        expect(within(viewer()).getByText('2 / 3')).toBeInTheDocument();
    });

    it('pages with the Previous and Next buttons', async () => {
        const user = userEvent.setup();
        addArticleImages();
        render(<ImageLightbox />);
        await user.click(contentImage('Pi-hole dashboard'));

        await user.click(screen.getByRole('button', { name: 'Next image' }));
        expect(within(viewer()).getByText('3 / 3')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Next image' }));
        expect(within(viewer()).getByText('1 / 3')).toBeInTheDocument();

        await user.click(
            screen.getByRole('button', { name: 'Previous image' })
        );
        expect(within(viewer()).getByText('3 / 3')).toBeInTheDocument();
    });

    it('closes on Escape', async () => {
        const user = userEvent.setup();
        addArticleImages();
        render(<ImageLightbox />);
        await user.click(contentImage('The router rack'));

        await user.keyboard('{Escape}');

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('closes from the close button, which takes focus on open', async () => {
        const user = userEvent.setup();
        addArticleImages();
        render(<ImageLightbox />);
        await user.click(contentImage('The router rack'));

        const close = screen.getByRole('button', {
            name: 'Close image viewer',
        });
        expect(close).toHaveFocus();
        await user.click(close);

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('closes on a backdrop click but not on the image itself', async () => {
        const user = userEvent.setup();
        addArticleImages();
        render(<ImageLightbox />);
        await user.click(contentImage('The router rack'));

        await user.click(shownImage());
        expect(viewer()).toBeInTheDocument();

        await user.click(viewer());
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('hides paging controls for a single image', async () => {
        const user = userEvent.setup();
        const article = document.createElement('article');
        article.innerHTML =
            '<div class="prose"><img src="/images/solo.png" alt="Solo"></div>';
        document.body.appendChild(article);
        render(<ImageLightbox />);

        await user.click(contentImage('Solo'));

        expect(
            screen.queryByRole('button', { name: 'Next image' })
        ).not.toBeInTheDocument();
        expect(within(viewer()).queryByText('1 / 1')).not.toBeInTheDocument();
    });

    it('restores the images on unmount', () => {
        addArticleImages();
        const { unmount } = render(<ImageLightbox />);

        unmount();

        const image = contentImage('The router rack');
        expect(image).not.toHaveAttribute('role');
        expect(image).not.toHaveAttribute('tabindex');
        expect(image).not.toHaveAttribute('title');
        expect(image.style.cursor).toBe('');
    });
});
