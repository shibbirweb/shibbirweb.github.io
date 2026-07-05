'use client';

import {
    createContext,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

type GradientColors = readonly [string, string];

type PageGradientContextValue = {
    /** Colours a page has claimed for the wash, or null to fall back to the route. */
    override: GradientColors | null;
    setOverride: (colors: GradientColors | null) => void;
};

const PageGradientContext = createContext<PageGradientContextValue | null>(null);

/**
 * Lets a page override the global wash colours (via `SyncPageGradient`) so the
 * full-page gradient can match that page's own accent rather than the generic
 * route-hash colour. Wraps both the `PageGradientBackground` and the page
 * content in the root layout so they share one override slot.
 */
export function PageGradientProvider({ children }: { children: ReactNode }) {
    const [override, setOverride] = useState<GradientColors | null>(null);
    const value = useMemo(() => ({ override, setOverride }), [override]);
    return (
        <PageGradientContext.Provider value={value}>
            {children}
        </PageGradientContext.Provider>
    );
}

/**
 * Reads the current wash override. Returns a no-op setter and null override when
 * used outside a provider, so the background degrades to route-derived colours.
 */
export function usePageGradientOverride(): PageGradientContextValue {
    return useContext(PageGradientContext) ?? { override: null, setOverride: () => {} };
}
