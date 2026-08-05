import { cn } from '@/utils/cn';
import styles from '@/components/pages/home/ContactArea/CaptchaSlot.module.css';
import { captchaPlaceholderLabel } from '@/components/pages/home/ContactArea/contents';

type CaptchaSlotProps = {
    /** The callback ref from `useHCaptcha`, attached to the widget's container. */
    setContainer: (node: HTMLDivElement | null) => void;
    isWidgetRendered: boolean;
    /** The vendor script is in flight, so the placeholder should read as busy. */
    isLoading: boolean;
    /** Opens the captcha gate. Pointing at the slot is intent enough to start. */
    onIntent: () => void;
};

/**
 * Holds the widget's space in the form and stands in for it until it arrives.
 *
 * hCaptcha renders a fixed 302x76 widget. Below ~368px that cannot fit the panel,
 * so it is scaled down from the left inside an overflow-hidden wrapper (which also
 * caps the layout width so nothing spills past the rounded panel). `scale()` only
 * affects paint, never layout, so the wrapper's content box is 76px tall at every
 * width and one unconditional `min-h` reserves it correctly everywhere.
 *
 * That reservation is what keeps the deferred load free: without it the widget
 * would drop in under the reader's eyes and shove the submit button down.
 *
 * The placeholder says what belongs here and nothing more. It deliberately does not
 * mock up the widget's checkbox: a checkbox that cannot be ticked is a lie about
 * what the reader is looking at, and they would click it before the real one exists.
 *
 * Pointing at the slot opens the gate, so the script is usually already on its way
 * before the reader reaches for a field, and the shimmer that runs while it loads
 * is reporting real work rather than decorating a wait.
 */
export default function CaptchaSlot({
    setContainer,
    isWidgetRendered,
    isLoading,
    onIntent,
}: CaptchaSlotProps) {
    return (
        <div
            className="relative min-h-[76px] w-full overflow-hidden"
            onPointerEnter={onIntent}
        >
            {!isWidgetRendered && (
                // Absolutely positioned, so removing it cannot reflow anything.
                <div
                    aria-hidden="true"
                    className={cn(
                        styles.placeholder,
                        'border-foreground/15 bg-foreground/5 text-foreground/55 pointer-events-none absolute top-0 left-0 flex h-[76px] w-[302px] origin-top-left items-center justify-center overflow-hidden rounded-md border text-sm max-[368px]:scale-[0.8]',
                        isLoading && styles.loading
                    )}
                >
                    {captchaPlaceholderLabel}
                </div>
            )}
            <div
                ref={setContainer}
                className="flex origin-top-left justify-start max-[368px]:scale-[0.8]"
            />
        </div>
    );
}
