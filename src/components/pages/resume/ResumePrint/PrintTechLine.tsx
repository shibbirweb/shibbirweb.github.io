/** Small grey "Stack:" line listing an entry's technologies. */
export default function PrintTechLine({ tech }: { tech: string[] }) {
    return (
        <p className="mt-0.5 text-[9pt] text-neutral-500">
            <span className="font-semibold text-neutral-600">Stack:</span>{' '}
            {tech.join(', ')}
        </p>
    );
}
