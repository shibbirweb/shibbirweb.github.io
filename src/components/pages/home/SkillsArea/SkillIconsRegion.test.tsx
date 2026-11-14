import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SkillIconsRegion from '@/components/pages/home/SkillsArea/SkillIconsRegion';

/** Stubs IntersectionObserver; `report` plays an intersection change. */
function stubIntersectionObserver() {
    const observer = {
        report: (() => {}) as (isIntersecting: boolean) => void,
    };
    vi.stubGlobal(
        'IntersectionObserver',
        class {
            constructor(callback: IntersectionObserverCallback) {
                observer.report = (isIntersecting) =>
                    callback(
                        [{ isIntersecting } as IntersectionObserverEntry],
                        this as unknown as IntersectionObserver
                    );
            }
            observe() {}
            disconnect() {}
        }
    );
    return observer;
}

function renderRegion() {
    render(
        <SkillIconsRegion className="mx-auto">
            <p>Claude</p>
        </SkillIconsRegion>
    );
    return screen.getByText('Claude').parentElement as HTMLElement;
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('SkillIconsRegion', () => {
    it('holds the logos back while the section is far from the viewport', () => {
        stubIntersectionObserver();

        expect(renderRegion()).toHaveAttribute('data-skill-icons', 'pending');
    });

    it('marks the logos ready once the section nears the viewport', () => {
        const observer = stubIntersectionObserver();
        const region = renderRegion();

        act(() => observer.report(true));

        expect(region).toHaveAttribute('data-skill-icons', 'ready');
    });

    it('renders its children and class straight through', () => {
        stubIntersectionObserver();
        const region = renderRegion();

        expect(region).toHaveClass('mx-auto');
        expect(screen.getByText('Claude')).toBeVisible();
    });
});
