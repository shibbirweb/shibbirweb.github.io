import { RefObject, useEffect } from 'react';
import {
    SIGNATURE_PATH_D,
    SIGNATURE_VIEW_BOX,
} from '@/components/icons/shibbir';
import {
    createRandom,
    generateActivityLevels,
    listActivityCells,
    pickActivityLevel,
} from '@/components/layout/Footer/SignatureSpotlight/activityField';
import { shadeIndexFor } from '@/components/layout/Footer/SignatureSpotlight/activityColors';
import {
    drawActivityGraph,
    readShadeColors,
} from '@/components/layout/Footer/SignatureSpotlight/drawActivityGraph';
import { easeToward } from '@/utils/easeToward';

// How often the graph shifts, and how many squares change level each tick. A
// slow cadence and a light touch keep it quietly alive rather than noisy.
const ACTIVITY_INTERVAL_MS = 900;
const LEVEL_CHANGES_PER_TICK = 6;
// How gently a square fades to its new level: the time constant of an
// exponential ease, so a change is mostly done in about three times this.
const LEVEL_FADE_MS = 650;
// Close enough to the target to stop fading and settle on it.
const LEVEL_SETTLE_DISTANCE = 0.02;
// Cap on one frame's elapsed time, so a backgrounded tab does not jump.
const MAX_FRAME_MS = 100;

/**
 * Draws the signature as a contribution graph on `canvasRef`: squares whose
 * centres fall inside the letters, each tinted by an activity level. The graph
 * always shows faintly, so it is drawn for every visitor and redrawn on resize
 * and theme change. On a slow interval it re-rolls a few levels so the graph
 * looks live, each square fading gently to its new shade over a couple of
 * seconds, but only while the pointer spotlight is lit (gauged by the
 * --spotlight-opacity usePointerSpotlight writes to `spotlightRef`), so the
 * resting footer costs nothing. Reduced motion and coarse / hoverless pointers
 * get a still graph.
 */
export function useActivityGraph(
    canvasRef: RefObject<HTMLCanvasElement | null>,
    spotlightRef: RefObject<HTMLElement | null>
) {
    useEffect(() => {
        const canvas = canvasRef.current;
        const spotlight = spotlightRef.current;
        if (!canvas || !spotlight) {
            return;
        }
        const context = canvas.getContext('2d');
        if (!context) {
            return;
        }

        const [, , viewBoxWidth, viewBoxHeight] =
            SIGNATURE_VIEW_BOX.split(' ').map(Number);
        const letters = new Path2D(SIGNATURE_PATH_D);
        // Hit-test in raw viewBox units, before any draw sets a transform. The
        // wordmark uses the even-odd rule, so the holes in B, R, A and D stay empty.
        const cells = listActivityCells(viewBoxWidth, viewBoxHeight, (x, y) =>
            context.isPointInPath(letters, x, y, 'evenodd')
        );
        // Where each square is heading, and the (possibly fractional) level it
        // shows right now while it fades there.
        const targetLevels = generateActivityLevels(cells.length);
        const displayedLevels = Float32Array.from(targetLevels);
        const fadingCells = new Set<number>();
        let shadeColors = readShadeColors(canvas);
        const random = createRandom(Date.now());
        const allowMotion =
            window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
            !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const draw = () => {
            drawActivityGraph(
                canvas,
                context,
                cells,
                displayedLevels,
                shadeColors,
                viewBoxWidth,
                viewBoxHeight
            );
        };

        // Match the backing store to the rendered size times the pixel ratio,
        // so the squares stay crisp at any width and on high-density screens.
        const resizeObserver = new ResizeObserver(() => {
            const pixelRatio = window.devicePixelRatio || 1;
            canvas.width = Math.round(canvas.clientWidth * pixelRatio);
            canvas.height = Math.round(canvas.clientHeight * pixelRatio);
            draw();
        });
        resizeObserver.observe(canvas);

        // The square colours come from theme-aware custom properties, so re-read
        // them when the theme switcher flips data-theme or the OS scheme changes.
        const redrawForTheme = () => {
            shadeColors = readShadeColors(canvas);
            draw();
        };
        const themeObserver = new MutationObserver(redrawForTheme);
        themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });
        const colorSchemeQuery = window.matchMedia(
            '(prefers-color-scheme: dark)'
        );
        colorSchemeQuery.addEventListener('change', redrawForTheme);

        const cleanUpThemeWatch = () => {
            themeObserver.disconnect();
            colorSchemeQuery.removeEventListener('change', redrawForTheme);
            resizeObserver.disconnect();
        };
        if (!allowMotion) {
            return cleanUpThemeWatch;
        }

        let frame = 0;
        let lastFrameTime = 0;
        const animateFades = (time: number) => {
            const elapsedMs = lastFrameTime
                ? Math.min(time - lastFrameTime, MAX_FRAME_MS)
                : 16;
            lastFrameTime = time;
            // Only repaint when some square actually crosses into a new shade.
            let shadeChanged = false;
            for (const index of fadingCells) {
                const previousShade = shadeIndexFor(displayedLevels[index]);
                const target = targetLevels[index];
                let next = easeToward(
                    displayedLevels[index],
                    target,
                    elapsedMs,
                    LEVEL_FADE_MS
                );
                if (Math.abs(next - target) < LEVEL_SETTLE_DISTANCE) {
                    next = target;
                    fadingCells.delete(index);
                }
                displayedLevels[index] = next;
                if (shadeIndexFor(next) !== previousShade) {
                    shadeChanged = true;
                }
            }
            if (shadeChanged) {
                draw();
            }
            if (fadingCells.size > 0) {
                frame = requestAnimationFrame(animateFades);
                return;
            }
            frame = 0;
            lastFrameTime = 0;
        };

        const tick = () => {
            const opacity = parseFloat(
                spotlight.style.getPropertyValue('--spotlight-opacity')
            );
            if (!(opacity > 0.01)) {
                return;
            }
            // Re-read the colours while lit, so a stylesheet swap (hot reload in
            // dev, or any theme change the observers missed) never leaves the
            // canvas painting stale shades.
            shadeColors = readShadeColors(canvas);
            for (let change = 0; change < LEVEL_CHANGES_PER_TICK; change++) {
                const index = Math.floor(random() * cells.length);
                targetLevels[index] = pickActivityLevel(random());
                fadingCells.add(index);
            }
            if (!frame) {
                frame = requestAnimationFrame(animateFades);
            }
        };
        const timer = window.setInterval(tick, ACTIVITY_INTERVAL_MS);

        return () => {
            window.clearInterval(timer);
            if (frame) {
                cancelAnimationFrame(frame);
            }
            cleanUpThemeWatch();
        };
    }, [canvasRef, spotlightRef]);
}
