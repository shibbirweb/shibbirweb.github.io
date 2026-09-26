import { RefObject, useEffect } from 'react';
import {
    SIGNATURE_PATH_D,
    SIGNATURE_VIEW_BOX,
} from '@/components/icons/shibbir';
import {
    ACTIVITY_FIELD_SEED,
    breatheLevel,
    createRandom,
    generateActivityLevels,
    listActivityCells,
} from '@/components/layout/Footer/SignatureSpotlight/activityField';
import { shadeIndexFor } from '@/components/layout/Footer/SignatureSpotlight/activityColors';
import {
    drawActivityGraph,
    readShadeColors,
} from '@/components/layout/Footer/SignatureSpotlight/drawActivityGraph';
import { mapDaysToCells } from '@/components/layout/Footer/SignatureSpotlight/githubActivity';
import { watchGithubActivity } from '@/components/layout/Footer/SignatureSpotlight/githubActivityStore';
import { easeToward } from '@/utils/easeToward';

// How gently the graph settles onto new data (the real calendar replacing the
// decorative fallback): the time constant of an exponential ease.
const LEVEL_FADE_MS = 650;
// Close enough to the target to stop fading and settle on it.
const LEVEL_SETTLE_DISTANCE = 0.02;
// Each lit square breathes on its own slow cycle, somewhere in this range, so
// the graph drifts softly instead of pulsing in step.
const BREATH_PERIOD_MIN_MS = 2600;
const BREATH_PERIOD_MAX_MS = 4200;
// How quickly breathing swells in when the spotlight lights and dies away when
// it goes dark, and when it counts as fully faded out.
const BREATH_ENVELOPE_MS = 500;
const BREATH_ENVELOPE_SETTLE = 0.002;
// Cap on one frame's elapsed time, so a backgrounded tab does not jump.
const MAX_FRAME_MS = 100;

/**
 * Draws the signature as the maintainer's GitHub contribution graph on
 * `canvasRef`: squares whose centres fall inside the letters, the year running
 * left to right (see mapDaysToCells). Until the real calendar arrives (from the
 * 4-hour cache or the proxy, via watchGithubActivity) it shows a seeded
 * decorative graph, then fades onto the real one. The graph always shows
 * faintly, so it is drawn for every visitor and redrawn on resize and theme
 * change. While the pointer spotlight is lit (--spotlight-opacity, written to
 * `spotlightRef` by usePointerSpotlight) the active squares breathe gently
 * around their real level and empty days glow faintly, and the frame loop stops
 * once the spotlight goes dark. Reduced motion and coarse / hoverless pointers
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

        const reduceMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches;
        const allowBreathing =
            window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
            !reduceMotion;
        const levelFadeMs = reduceMotion ? 0 : LEVEL_FADE_MS;

        // Each square's resting level (where it is heading), the level it rests
        // at right now while fading there, and what is drawn (resting level
        // plus breathing). lastShades remembers the drawn shade, so a frame only
        // repaints when some square actually changes shade.
        const targetLevels = Float32Array.from(
            generateActivityLevels(cells.length)
        );
        const restingLevels = Float32Array.from(targetLevels);
        const shownLevels = Float32Array.from(targetLevels);
        const lastShades = new Int16Array(cells.length).fill(-1);
        const breathRandom = createRandom(ACTIVITY_FIELD_SEED + 1);
        const breathPhases = Float32Array.from(
            cells,
            () => breathRandom() * Math.PI * 2
        );
        const breathPeriodsMs = Float32Array.from(
            cells,
            () =>
                BREATH_PERIOD_MIN_MS +
                breathRandom() * (BREATH_PERIOD_MAX_MS - BREATH_PERIOD_MIN_MS)
        );
        let breathEnvelope = 0;
        let hasDrawn = false;
        let shadeColors = readShadeColors(canvas);

        const draw = () => {
            hasDrawn = true;
            drawActivityGraph(
                canvas,
                context,
                cells,
                shownLevels,
                shadeColors,
                viewBoxWidth,
                viewBoxHeight
            );
        };

        const isSpotlightLit = () =>
            parseFloat(
                spotlight.style.getPropertyValue('--spotlight-opacity')
            ) > 0.01;

        let frame = 0;
        let lastFrameTime = 0;
        const animate = (time: number) => {
            const elapsedMs = lastFrameTime
                ? Math.min(time - lastFrameTime, MAX_FRAME_MS)
                : 16;
            lastFrameTime = time;
            const lit = allowBreathing && isSpotlightLit();
            breathEnvelope = easeToward(
                breathEnvelope,
                lit ? 1 : 0,
                elapsedMs,
                BREATH_ENVELOPE_MS
            );
            if (!lit && breathEnvelope < BREATH_ENVELOPE_SETTLE) {
                breathEnvelope = 0;
            }

            let stillFading = false;
            let shadeChanged = false;
            for (let index = 0; index < cells.length; index++) {
                const target = targetLevels[index];
                if (restingLevels[index] !== target) {
                    const next = easeToward(
                        restingLevels[index],
                        target,
                        elapsedMs,
                        levelFadeMs
                    );
                    const settled =
                        Math.abs(next - target) < LEVEL_SETTLE_DISTANCE;
                    restingLevels[index] = settled ? target : next;
                    stillFading ||= !settled;
                }
                const wave = breathEnvelope
                    ? Math.sin(
                          breathPhases[index] +
                              (time / breathPeriodsMs[index]) * Math.PI * 2
                      )
                    : 0;
                shownLevels[index] = breatheLevel(
                    restingLevels[index],
                    wave,
                    breathEnvelope
                );
                const shade = shadeIndexFor(shownLevels[index]);
                if (shade !== lastShades[index]) {
                    lastShades[index] = shade;
                    shadeChanged = true;
                }
            }
            if (shadeChanged) {
                draw();
            }

            if (lit || breathEnvelope > 0 || stillFading) {
                frame = requestAnimationFrame(animate);
                return;
            }
            frame = 0;
            lastFrameTime = 0;
        };
        const startAnimation = () => {
            if (frame) {
                return;
            }
            // Re-read the colours as the graph wakes, so a stylesheet swap (hot
            // reload in dev, or a theme change the observers missed) never
            // leaves the canvas painting stale shades.
            shadeColors = readShadeColors(canvas);
            frame = requestAnimationFrame(animate);
        };

        // The real calendar: applied instantly if it arrives before the first
        // paint (a warm cache), otherwise faded onto the decorative graph.
        const stopWatchingActivity = watchGithubActivity(
            spotlight,
            (dayLevels) => {
                targetLevels.set(mapDaysToCells(cells, dayLevels));
                if (!hasDrawn) {
                    restingLevels.set(targetLevels);
                    shownLevels.set(targetLevels);
                    return;
                }
                startAnimation();
            }
        );

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

        // usePointerSpotlight rewrites the spotlight's inline style as the
        // pointer moves; that is the cue to wake the breathing loop.
        const spotlightObserver = new MutationObserver(() => {
            if (isSpotlightLit()) {
                startAnimation();
            }
        });
        if (allowBreathing) {
            spotlightObserver.observe(spotlight, {
                attributes: true,
                attributeFilter: ['style'],
            });
        }

        return () => {
            if (frame) {
                cancelAnimationFrame(frame);
            }
            stopWatchingActivity();
            spotlightObserver.disconnect();
            themeObserver.disconnect();
            colorSchemeQuery.removeEventListener('change', redrawForTheme);
            resizeObserver.disconnect();
        };
    }, [canvasRef, spotlightRef]);
}
