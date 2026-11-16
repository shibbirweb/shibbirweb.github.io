/**
 * Class on the hidden, pre-rendered diagram images that the Markdown pipeline
 * adds for browser reading modes (see src/lib/diagramImages.ts).
 *
 * The name is load-bearing: Readability treats `aria-hidden` content as invisible,
 * except when its class contains "fallback-image" (the exception it keeps for
 * Wikipedia's math images). Kept in its own module so client code, such as the
 * image lightbox that must skip these images, can read it without importing the
 * server-only pipeline.
 */
export const DIAGRAM_FALLBACK_IMAGE_CLASS = 'diagram-fallback-image';
