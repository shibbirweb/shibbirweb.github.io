import Link from 'next/link';
import type { ComponentProps } from 'react';
import { buttonClassName, type ButtonVariant } from '@/components/ui/Button';

type ButtonLinkProps = ComponentProps<typeof Link> & {
    variant?: ButtonVariant;
};

/**
 * A link that reads as a button, sharing Button's variants and styling. Use for
 * navigations that should look like button actions (e.g. an offline page's "Back
 * home"), keeping the look in one place instead of re-styling an anchor.
 */
export default function ButtonLink({
    variant = 'primary',
    className,
    ...rest
}: ButtonLinkProps) {
    return (
        <Link
            className={buttonClassName(variant, className)}
            {...rest}
        />
    );
}
