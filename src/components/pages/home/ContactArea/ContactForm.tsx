'use client';

import { cn } from '@/utils/cn';
import GridBackground from '@/components/backgrounds/GridBackground';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import ContactAside from '@/components/pages/home/ContactArea/ContactAside';
import ContactSuccess from '@/components/pages/home/ContactArea/ContactSuccess';
import styles from '@/components/pages/home/ContactArea/ContactForm.module.css';
import { useContactForm } from '@/components/pages/home/ContactArea/hooks/useContactForm';
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
    'text-foreground/50 text-[0.7rem] font-semibold tracking-[0.14em] uppercase';

export default function ContactForm() {
    const { setContainer, token, reset: resetCaptcha } = useHCaptcha();
    const { values, status, errorMessage, updateField, handleSubmit, reset } =
        useContactForm({ captchaToken: token, resetCaptcha });

    const isSubmitting = status === 'submitting';

    return (
        <div className="w-full max-w-4xl">
            <div
                className={cn(
                    styles.panel,
                    'border-foreground/10 bg-background/50 relative isolate overflow-hidden rounded-3xl border p-4 shadow-sm backdrop-blur-sm sm:p-8 md:p-10'
                )}
            >
                <GridBackground className="opacity-60" />

                <div className="relative z-10 grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] md:gap-12">
                    <ContactAside />

                    <div className="min-w-0">
                        {status === 'success' ? (
                            <ContactSuccess onResend={reset} />
                        ) : (
                            <form
                                onSubmit={handleSubmit}
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
                                        updateField('message', event.target.value)
                                    }
                                />

                                {/* hCaptcha renders a fixed 302px widget. Below
                                    ~368px that cannot fit the panel, so scale it
                                    down from the left inside an overflow-hidden
                                    wrapper (the wrapper caps the layout width so
                                    nothing spills past the rounded panel). */}
                                <div className="w-full overflow-hidden">
                                    <div
                                        ref={setContainer}
                                        className="flex origin-top-left justify-start max-[368px]:scale-[0.8]"
                                    />
                                </div>

                                {status === 'error' && errorMessage && (
                                    <p
                                        role="status"
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
                                    {!token && (
                                        <span className="text-foreground/50 text-xs">
                                            Complete the captcha to enable
                                            sending.
                                        </span>
                                    )}
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
