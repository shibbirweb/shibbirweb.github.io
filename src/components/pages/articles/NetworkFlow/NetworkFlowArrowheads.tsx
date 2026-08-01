import styles from '@/components/pages/articles/NetworkFlow/NetworkFlow.module.css';
import type { NetworkFlowTone } from '@/components/pages/articles/NetworkFlow/types';

const TONES: NetworkFlowTone[] = ['neutral', 'secure', 'blocked', 'allowed'];

/**
 * The `<defs>` block of arrowheads, one per tone. Markers do not inherit the
 * stroke of the path that references them in every browser, so each tone gets its
 * own marker coloured from the module instead of relying on `context-stroke`.
 */
export default function NetworkFlowArrowheads({
    markerPrefix,
}: {
    markerPrefix: string;
}) {
    return (
        <defs>
            {TONES.map((tone) => (
                <marker
                    key={tone}
                    id={`${markerPrefix}-${tone}`}
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                >
                    <path
                        d="M 0 1 L 9 5 L 0 9 z"
                        data-tone={tone}
                        className={styles.arrowhead}
                    />
                </marker>
            ))}
        </defs>
    );
}
