'use client';

import { useRef } from 'react';
import { cn } from '@/utils/cn';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import SpotlightBorder from '@/components/pages/common/SpotlightBorder';
import { useSpotlightSurfaces } from '@/components/pages/common/hooks/useSpotlightSurfaces';
import { spotlightSurfaceProps } from '@/components/pages/common/spotlightSurface';
import CaptchaSlot from '@/components/pages/home/ContactArea/CaptchaSlot';
import ContactAside from '@/components/pages/home/ContactArea/ContactAside';
import ContactSuccess from '@/components/pages/home/ContactArea/ContactSuccess';
import styles from '@/components/pages/home/ContactArea/ContactForm.module.css';
import { captchaHint } from '@/components/pages/home/ContactArea/captchaHint';
import { useContactForm } from '@/components/pages/home/ContactArea/hooks/useContactForm';
import { useFirstInteraction } from '@/components/pages/home/ContactArea/hooks/useFirstInteraction';
import { useHCaptcha } from '@/components/pages/home/ContactArea/hooks/useHCaptcha';
import {
    contactFields,
    messageField,
    submitLabel,
    submittingLabel,
} from '@/components/pages/home/ContactArea/contents';

const fieldAccentClassName =
    'focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/15';
const fieldLabelClassName =
    'text-foreground/70 text-xs font-semibold tracking-[0.14em] uppercase';

export default function ContactForm() {
    // The panel is its own spotlight group: one delegated pointer listener here
    // writes --pointer-x/y to the panel, which the cursor glow and the lit border in
    // ContactForm.module.css both read.
    const panelRef = useRef<HTMLDivElement>(null);
    useSpotlightSurfaces(panelRef);

    // hCaptcha is third-party JS for a control at the very bottom of the page, so
    // it is fetched when the reader actually engages with the form rather than at
    // hydration. Most visitors read and leave, and they should not pay for it.
    const { hasInteracted, interactionProps, markInteracted } =
        useFirstInteraction();

    const {
        setContainer,
        token,
        reset: resetCaptcha,
        isWidgetRendered,
    } = useHCaptcha({ shouldLoad: hasInteracted });
    const { values, status, errorMessage, updateField, handleSubmit, reset } =
        useContactForm({ captchaToken: token, resetCaptcha });

    const isSubmitting = status === 'submitting';
    const hintMessage = captchaHint({
        hasToken: Boolean(token),
        hasInteracted,
        isWidgetRendered,
    });

    return (
        <div className="w-full max-w-4xl">
            {/* No overflow-hidden: ::before and ::after round their own corners, the
                hCaptcha widget has its own clipping wrapper below, and clipping to the
                padding box would swallow the lit border ring, which sits a pixel out
                to land on the panel's real border rather than just inside it. */}
            <div
                ref={panelRef}
                {...spotlightSurfaceProps}
                className={cn(
                    styles.panel,
                    'border-foreground/10 bg-background/50 relative isolate rounded-3xl border p-4 shadow-sm backdrop-blur-sm sm:p-8 md:p-10'
                )}
            >
                <div className="relative z-10 grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] md:gap-12">
                    <ContactAside />

                    <div className="min-w-0">
                        {status === 'success' ? (
                            <ContactSuccess onResend={reset} />
                        ) : (
                            <form
                                onSubmit={handleSubmit}
                                // Opens the captcha gate: every field and the
                                // captcha slot itself sit inside this form, so any
                                // click or tab into it counts as engagement.
                                {...interactionProps}
                                className="flex flex-col gap-5"
                            >
                                {contactFields.map((field) => (
                                    <Input
                                        key={field.name}
                                        label={field.label}
                                        labelClassName={fieldLabelClassName}
                                        className={fieldAccentClassName}
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        autoComplete={field.autoComplete}
                                        required
                                        value={values[field.name]}
                                        onChange={(event) =>
                                            updateField(
                                                field.name,
                                                event.target.value
                                            )
                                        }
                                    />
                                ))}

                                <Textarea
                                    label={messageField.label}
                                    labelClassName={fieldLabelClassName}
                                    className={fieldAccentClassName}
                                    placeholder={messageField.placeholder}
                                    required
                                    value={values.message}
                                    onChange={(event) =>
                                        updateField(
                                            'message',
                                            event.target.value
                                        )
                                    }
                                />

                                <CaptchaSlot
                                    setContainer={setContainer}
                                    isWidgetRendered={isWidgetRendered}
                                    isLoading={
                                        hasInteracted && !isWidgetRendered
                                    }
                                    onIntent={markInteracted}
                                />

                                {status === 'error' && errorMessage && (
                                    <p
                                        role="alert"
                                        className="text-sm text-red-600 dark:text-red-400"
                                    >
                                        {errorMessage}
                                    </p>
                                )}

                                <div className="flex flex-col items-start gap-2">
                                    <Button
                                        type="submit"
                                        isLoading={isSubmitting}
                                        disabled={!token}
                                        className="group w-full sm:w-auto"
                                    >
                                        {isSubmitting
                                            ? submittingLabel
                                            : submitLabel}
                                        {!isSubmitting && (
                                            <svg
                                                aria-hidden="true"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="size-4 transition-transform group-hover:translate-x-0.5"
                                            >
                                                <path d="M5 12h14M13 6l6 6-6 6" />
                                            </svg>
                                        )}
                                    </Button>
                                    {hintMessage && (
                                        <span className="text-foreground/70 text-xs">
                                            {hintMessage}
                                        </span>
                                    )}
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                <SpotlightBorder
                    className={styles.spotlightBorder}
                />
            </div>
        </div>
    );
}
