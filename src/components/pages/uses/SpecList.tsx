import { Fragment } from 'react';
import { cn } from '@/utils/cn';

interface SpecListProps {
    label?: string;
    specs: { label: string; value: string }[];
}

export default function SpecList({ label, specs }: SpecListProps) {
    return (
        <div>
            {label && (
                <h3 className="text-foreground/60 text-xl font-bold">
                    {label}
                </h3>
            )}
            <dl
                className={cn(
                    'grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2',
                    label && 'mt-3'
                )}
            >
                {specs.map((spec) => (
                    <Fragment key={spec.label}>
                        <dt className="text-foreground/60 text-xl font-semibold">
                            {spec.label}
                        </dt>
                        <dd className="text-xl">{spec.value}</dd>
                    </Fragment>
                ))}
            </dl>
        </div>
    );
}
