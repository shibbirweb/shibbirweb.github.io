import { useCallback, useState } from 'react';
import { contactProvider } from '@/lib/contact';
import { emptyContactValues } from '@/components/pages/home/ContactArea/contents';
import type {
    ContactFormValues,
    ContactStatus,
} from '@/components/pages/home/ContactArea/types';

type UseContactFormArgs = {
    captchaToken: string | null;
    resetCaptcha: () => void;
};

/**
 * Owns the contact form state and submission flow. Vendor-agnostic: it only
 * talks to `contactProvider`, never a specific service. The captcha token and
 * its reset are injected so the captcha vendor stays a separate concern.
 */
export function useContactForm({
    captchaToken,
    resetCaptcha,
}: UseContactFormArgs) {
    const [values, setValues] = useState<ContactFormValues>(emptyContactValues);
    const [status, setStatus] = useState<ContactStatus>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const updateField = useCallback(
        (field: keyof ContactFormValues, value: string) => {
            setValues((prev) => ({ ...prev, [field]: value }));
        },
        []
    );

    const handleSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (status === 'submitting') {
                return;
            }

            setStatus('submitting');
            setErrorMessage(null);

            const result = await contactProvider.submit({
                ...values,
                captchaToken,
            });

            // hCaptcha tokens are single-use, so reset the widget either way to
            // leave the form ready for another attempt.
            resetCaptcha();

            if (result.ok) {
                setStatus('success');
            } else {
                setStatus('error');
                setErrorMessage(
                    result.error ??
                        'Something went wrong sending your message. Please try again.'
                );
            }
        },
        [status, values, captchaToken, resetCaptcha]
    );

    const reset = useCallback(() => {
        setValues(emptyContactValues);
        setStatus('idle');
        setErrorMessage(null);
        resetCaptcha();
    }, [resetCaptcha]);

    return { values, status, errorMessage, updateField, handleSubmit, reset };
}
