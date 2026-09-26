import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EMPTY_DAY_GLOW } from '@/components/layout/Footer/SignatureSpotlight/activityField';
import { DAY_TEXTURE_DEPTH } from '@/components/layout/Footer/SignatureSpotlight/githubActivity';
import { watchGithubActivity } from '@/components/layout/Footer/SignatureSpotlight/githubActivityStore';
import { createLetterMask } from '@/components/layout/Footer/SignatureSpotlight/letterMask';
import { startActivityGraph } from '@/components/layout/Footer/SignatureSpotlight/startActivityGraph';

// Every paint, recorded: the levels drawn and the shade colours used.
const draws: { levels: number[]; shadeColors: string[] }[] = [];
vi.mock(
    '@/components/layout/Footer/SignatureSpotlight/drawActivityGraph',
    async (importOriginal) => {
        const actual =
            await importOriginal<
                typeof import('@/components/layout/Footer/SignatureSpotlight/drawActivityGraph')
            >();
        return {
            ...actual,
            drawActivityGraph: vi.fn(
                (
                    _canvas: HTMLCanvasElement,
                    _context: CanvasRenderingContext2D,
                    _cells: unknown,
                    levels: ArrayLike<number>,
                    shadeColors: readonly string[]
                ) => {
                    draws.push({
                        levels: Array.from(levels),
                        shadeColors: [...shadeColors],
                    });
                }
            ),
        };
    }
);
vi.mock(
    '@/components/layout/Footer/SignatureSpotlight/githubActivityStore',
    () => ({ watchGithubActivity: vi.fn(() => () => {}) })
);
const mockedWatch = vi.mocked(watchGithubActivity);
// jsdom has no canvas backend, so by default the letter mask is unavailable
// and the graph falls back to the stubbed isPointInPath below.
vi.mock('@/components/layout/Footer/SignatureSpotlight/letterMask', () => ({
    createLetterMask: vi.fn(() => null),
}));
const mockedLetterMask = vi.mocked(createLetterMask);

let pendingFrames = new Map<number, FrameRequestCallback>();
let nextFrameId = 1;
let frameTime = 0;

function runFrame(stepMs = 16) {
    frameTime += stepMs;
    const frames = [...pendingFrames.values()];
    pendingFrames = new Map();
    frames.forEach((callback) => callback(frameTime));
}

function runFramesFor(durationMs: number) {
    for (let elapsed = 0; elapsed < durationMs; elapsed += 16) {
        runFrame();
    }
}

function runFramesUntilIdle(limit = 2000) {
    for (let i = 0; i < limit && pendingFrames.size > 0; i++) {
        runFrame();
    }
}

// Lets MutationObserver callbacks (theme and spotlight watches) run.
const flushObservers = () => new Promise((resolve) => setTimeout(resolve, 0));

function stubMedia({
    canHover = true,
    reduceMotion = false,
}: {
    canHover?: boolean;
    reduceMotion?: boolean;
}) {
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
        matches:
            (query === '(hover: hover) and (pointer: fine)' && canHover) ||
            (query === '(prefers-reduced-motion: reduce)' && reduceMotion),
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
    }));
}

function renderGraph({ hasContext = true } = {}) {
    const canvas = document.createElement('canvas');
    ['#eeeeee', '#bbbbbb', '#888888', '#555555', '#222222'].forEach(
        (color, level) =>
            canvas.style.setProperty(`--activity-level-${level}`, color)
    );
    document.body.append(canvas);
    // Only a narrow strip counts as "inside the letters", so the graph has a
    // few hundred cells rather than thousands.
    vi.spyOn(canvas, 'getContext').mockReturnValue(
        hasContext
            ? ({
                  isPointInPath: (_path: unknown, x: number) => x < 20,
              } as unknown as CanvasRenderingContext2D)
            : null
    );
    const spotlight = document.createElement('div');
    const stop = startActivityGraph(canvas, spotlight);
    if (stop) {
        runningGraphs.push(stop);
    }
    const cleanUp = () => stop?.();
    const lightSpotlight = async (opacity: number) => {
        spotlight.style.setProperty('--spotlight-opacity', String(opacity));
        await flushObservers();
    };
    return { stop, cleanUp, canvas, lightSpotlight };
}

const lastDraw = () => draws[draws.length - 1];

// Every graph a test starts, stopped after the test so its observers never
// react to a later test's theme switch.
const runningGraphs: (() => void)[] = [];

describe('startActivityGraph', () => {
    beforeEach(() => {
        draws.length = 0;
        mockedWatch.mockReset();
        mockedWatch.mockImplementation(() => () => {});
        mockedLetterMask.mockReset();
        mockedLetterMask.mockReturnValue(null);
        pendingFrames = new Map();
        nextFrameId = 1;
        frameTime = 0;
        vi.stubGlobal('Path2D', class {});
        vi.stubGlobal(
            'ResizeObserver',
            class {
                constructor(private callback: ResizeObserverCallback) {}
                observe() {
                    this.callback([], this as unknown as ResizeObserver);
                }
                disconnect() {}
            }
        );
        vi.stubGlobal(
            'requestAnimationFrame',
            vi.fn((callback: FrameRequestCallback) => {
                const id = nextFrameId++;
                pendingFrames.set(id, callback);
                return id;
            })
        );
        vi.stubGlobal(
            'cancelAnimationFrame',
            vi.fn((id: number) => pendingFrames.delete(id))
        );
    });

    afterEach(() => {
        runningGraphs.splice(0).forEach((stop) => stop());
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('paints the decorative graph on mount and starts watching for real data', () => {
        stubMedia({});
        renderGraph();

        expect(draws).toHaveLength(1);
        expect(lastDraw().levels.length).toBeGreaterThan(0);
        expect(lastDraw().shadeColors[0]).toBe('#eeeeee');
        expect(mockedWatch).toHaveBeenCalledTimes(1);
    });

    it('shows a warm cache on the first paint without animating', () => {
        stubMedia({});
        mockedWatch.mockImplementation((_target, onLevels) => {
            onLevels(new Array(30).fill(4));
            return () => {};
        });
        renderGraph();

        expect(draws).toHaveLength(1);
        for (const level of lastDraw().levels) {
            expect(level).toBeGreaterThanOrEqual(4 * (1 - DAY_TEXTURE_DEPTH));
        }
        expect(requestAnimationFrame).not.toHaveBeenCalled();
    });

    it('fades freshly fetched data in over several frames', () => {
        stubMedia({});
        let deliver: (levels: number[]) => void = () => {};
        mockedWatch.mockImplementation((_target, onLevels) => {
            deliver = onLevels;
            return () => {};
        });
        renderGraph();
        const drawsBeforeData = draws.length;

        deliver(new Array(30).fill(4));
        runFramesUntilIdle();

        expect(draws.length - drawsBeforeData).toBeGreaterThan(3);
        for (const level of lastDraw().levels) {
            expect(level).toBeGreaterThanOrEqual(4 * (1 - DAY_TEXTURE_DEPTH));
        }
        expect(pendingFrames.size).toBe(0);
    });

    it('snaps new data into place under reduced motion', () => {
        stubMedia({ reduceMotion: true });
        let deliver: (levels: number[]) => void = () => {};
        mockedWatch.mockImplementation((_target, onLevels) => {
            deliver = onLevels;
            return () => {};
        });
        renderGraph();
        const drawsBeforeData = draws.length;

        deliver(new Array(30).fill(4));
        runFrame();

        expect(draws.length - drawsBeforeData).toBe(1);
        expect(pendingFrames.size).toBe(0);
    });

    it('redraws in the new colours when the theme changes', async () => {
        stubMedia({});
        const { canvas } = renderGraph();
        const drawsBeforeSwitch = draws.length;

        canvas.style.setProperty('--activity-level-0', '#111111');
        document.documentElement.setAttribute('data-theme', 'dark');
        await flushObservers();

        expect(draws.length).toBe(drawsBeforeSwitch + 1);
        expect(lastDraw().shadeColors[0]).toBe('#111111');
    });

    it('breathes active days while the spotlight is lit, then settles back', async () => {
        stubMedia({});
        mockedWatch.mockImplementation((_target, onLevels) => {
            onLevels(new Array(30).fill(3));
            return () => {};
        });
        const { lightSpotlight } = renderGraph();
        const restingLevels = lastDraw().levels;

        await lightSpotlight(0.8);
        expect(pendingFrames.size).toBe(1);
        runFramesFor(1500);
        const breathing = lastDraw().levels;
        expect(breathing).not.toEqual(restingLevels);

        await lightSpotlight(0);
        runFramesUntilIdle();
        expect(pendingFrames.size).toBe(0);
        expect(lastDraw().levels).toEqual(restingLevels);
    });

    it('lets empty days glow only faintly while lit', async () => {
        stubMedia({});
        mockedWatch.mockImplementation((_target, onLevels) => {
            onLevels(new Array(30).fill(0));
            return () => {};
        });
        const { lightSpotlight } = renderGraph();

        await lightSpotlight(0.8);
        runFramesFor(3000);
        const glowing = draws.slice(1).flatMap((draw) => draw.levels);

        expect(Math.max(...glowing)).toBeGreaterThan(0);
        expect(Math.max(...glowing)).toBeLessThanOrEqual(EMPTY_DAY_GLOW);
    });

    it('keeps the graph still under reduced motion', async () => {
        stubMedia({ reduceMotion: true });
        const { lightSpotlight } = renderGraph();

        await lightSpotlight(0.8);

        expect(requestAnimationFrame).not.toHaveBeenCalled();
        expect(draws).toHaveLength(1);
    });

    it('keeps the graph still on touch devices', async () => {
        stubMedia({ canHover: false });
        const { lightSpotlight } = renderGraph();

        await lightSpotlight(0.8);

        expect(requestAnimationFrame).not.toHaveBeenCalled();
    });

    it('stops everything when cleaned up', async () => {
        stubMedia({});
        const stopWatching = vi.fn();
        mockedWatch.mockImplementation(() => stopWatching);
        const { cleanUp } = renderGraph();
        const drawsBeforeCleanUp = draws.length;

        cleanUp();
        document.documentElement.setAttribute('data-theme', 'light');
        await flushObservers();

        expect(stopWatching).toHaveBeenCalledTimes(1);
        expect(draws).toHaveLength(drawsBeforeCleanUp);
    });

    it('does nothing when the canvas has no 2D context', () => {
        stubMedia({});
        const { stop } = renderGraph({ hasContext: false });

        expect(stop).toBeNull();
        expect(draws).toHaveLength(0);
        expect(mockedWatch).not.toHaveBeenCalled();
    });

    it('lays out the squares from the letter mask when one is available', () => {
        stubMedia({});
        renderGraph();
        const fallbackCellCount = lastDraw().levels.length;

        draws.length = 0;
        // A mask half as wide as the fallback strip.
        mockedLetterMask.mockReturnValue((x: number) => x < 10);
        renderGraph();

        expect(lastDraw().levels.length).toBeGreaterThan(0);
        expect(lastDraw().levels.length).toBeLessThan(fallbackCellCount);
    });
});
