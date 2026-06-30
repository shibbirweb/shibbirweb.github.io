/** A label + helper-text wrapper shared by every Studio form control. */
export default function FieldShell({
    label,
    hint,
    htmlFor,
    children,
    className,
}: {
    label?: string;
    hint?: string;
    htmlFor?: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={className}>
            {label && (
                <label
                    htmlFor={htmlFor}
                    className="text-foreground/70 mb-1.5 block text-xs font-semibold tracking-wide"
                >
                    {label}
                </label>
            )}
            {children}
            {hint && <p className="text-foreground/45 mt-1 text-xs">{hint}</p>}
        </div>
    );
}
