'use client';

import { useEffect, useState } from 'react';

/** Quiet lead-in before the first glitch (the "after ~10s" from issue #12). */
export const INITIAL_DELAY_MS = 10_000;
/** Start-to-start spacing between glitches: hold a face, then glitch to the next. */
export const CYCLE_INTERVAL_MS = 10_000;
/** When the flicker settles on (and holds) the cycle's target face. */
export const GLITCH_SETTLE_MS = 360;

export type FontPhase = 'display' | 'sans';

/**
 * The faces each glitch settles on and HOLDS until the next glitch, in order:
 * Zain -> Noto Sans -> Zain ... so the font visibly changes and stays changed,
 * and the name periodically returns to the original Zain. Both faces are already
 * loaded on the home route (Zain is the hero display font, Noto Sans is the
 * global body font), so this ships no extra font bytes. JetBrains Mono is
 * deliberately not used here so the monospace font keeps loading only on the
 * pages that opt into it (the breadcrumb and article detail page).
 */
const TARGET_FONTS: FontPhase[] = ['sans', 'display'];

/**
 * The rapid stutter played before the face settles, read as a digital glitch.
 * Each entry is the face to flash and its offset in ms from the glitch start.
 */
const FLICKER_FRAMES: { font: FontPhase; at: number }[] = [
    { font: 'sans', at: 0 },
    { font: 'display', at: 90 },
    { font: 'sans', at: 160 },
    { font: 'display', at: 230 },
    { font: 'sans', at: 300 },
];

interface GlitchController {
    fontPhase: FontPhase;
}

/**
 * Drives the hero name's recurring font glitch. Stays on the display font (Zain)
 * on the server and on the first client render (so hydration matches). Only when
 * motion is allowed it waits INITIAL_DELAY_MS, then every CYCLE_INTERVAL_MS
 * plays a brief flicker and settles on the next target face, holding it until
 * the next glitch. Only the font-family changes, so the ShinyTextAnimation
 * shimmer is preserved throughout. Reduced motion keeps it static forever,
 * mirroring AnimatedUnderline's static fallback.
 */
export function useGlitchFontSwap(): GlitchController {
    const [fontPhase, setFontPhase] = useState<FontPhase>('display');

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return; // keep the static Zain shiny name: no font glitch
        }

        // Which face the next glitch settles on. A plain counter in the effect
        // scope (not React state) so advancing it never triggers a render.
        let targetIndex = 0;

        // Timers for the glitch currently playing. Reset each glitch so they do
        // not accumulate; the previous glitch's timers have already fired by the
        // time the next one starts (the flicker is far shorter than the interval).
        const flickerTimers: ReturnType<typeof setTimeout>[] = [];

        const playGlitch = () => {
            flickerTimers.forEach(clearTimeout);
            flickerTimers.length = 0;
            const target = TARGET_FONTS[targetIndex % TARGET_FONTS.length];
            targetIndex += 1;
            for (const frame of FLICKER_FRAMES) {
                flickerTimers.push(
                    setTimeout(() => setFontPhase(frame.font), frame.at)
                );
            }
            flickerTimers.push(
                setTimeout(() => setFontPhase(target), GLITCH_SETTLE_MS)
            );
        };

        let intervalId: ReturnType<typeof setInterval>;
        const startId = setTimeout(() => {
            playGlitch();
            intervalId = setInterval(playGlitch, CYCLE_INTERVAL_MS);
        }, INITIAL_DELAY_MS);

        return () => {
            clearTimeout(startId);
            clearInterval(intervalId);
            flickerTimers.forEach(clearTimeout);
        };
    }, []);

    return { fontPhase };
}
