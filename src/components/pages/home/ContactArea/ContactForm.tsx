'use client';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import ContactSuccess from '@/components/pages/home/ContactArea/ContactSuccess';
import { useContactForm } from '@/components/pages/home/ContactArea/hooks/useContactForm';
import { useHCaptcha } from '@/components/pages/home/ContactArea/hooks/useHCaptcha';
import {
    contactFields,
    messageField,
    submitLabel,
    submittingLabel,
} from '@/components/pages/home/ContactArea/contents';

export default function ContactForm() {
    const { setContainer, token, reset: resetCaptcha } = useHCaptcha();
    const { values, status, errorMessage, updateField, handleSubmit, reset } =
        useContactForm({ captchaToken: token, resetCaptcha });

    if (status === 'success') {
        return (
            <div className="mt-10 w-full max-w-xl">
                <ContactSuccess onResend={reset} />
            </div>
        );
    }

    const isSubmitting = status === 'submitting';

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-10 flex w-full max-w-xl flex-col gap-5"
        >
            {contactFields.map((field) => (
                <Input
                    key={field.name}
                    label={field.label}
                    type={field.type}
                    placeholder={field.placeholder}
                    autoComplete={field.autoComplete}
                    required
                    value={values[field.name]}
                    onChange={(event) =>
                        updateField(field.name, event.target.value)
                    }
                />
            ))}

            <Textarea
                label={messageField.label}
                placeholder={messageField.placeholder}
                required
                value={values.message}
                onChange={(event) => updateField('message', event.target.value)}
            />

            <div
                ref={setContainer}
                className="flex justify-center sm:justify-start"
            />

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
                    className="w-full sm:w-auto"
                >
                    {isSubmitting ? submittingLabel : submitLabel}
                </Button>
                {!token && (
                    <span className="text-foreground/50 text-xs">
                        Complete the captcha to enable sending.
                    </span>
                )}
            </div>
        </form>
    );
}
