/** A red asterisk marking a required form field, with a screen-reader label. */
export default function RequiredMark() {
    return (
        <span className="text-red-600 dark:text-red-400">
            <span aria-hidden> *</span>
            <span className="sr-only"> (required)</span>
        </span>
    );
}
