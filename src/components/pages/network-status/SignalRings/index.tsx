import { cn } from '@/utils/cn';
import styles from '@/components/pages/network-status/SignalRings/SignalRings.module.css';

/**
 * "Searching for signal" radar glyph: a solid core node with concentric rings
 * that pulse outward and fade, evoking a device reaching for a network that is
 * not there. Pure CSS so it also animates inside the script-stripped offline
 * fallback snapshot; it collapses to a single static ring under reduced motion.
 */
export default function SignalRings() {
    return (
        <div
            aria-hidden="true"
            className={cn(styles.radar, 'relative grid place-items-center')}
        >
            <span className={styles.halo} />
            <span className={styles.ring} />
            <span className={styles.ring} />
            <span className={styles.ring} />
            <span className={styles.core} />
        </div>
    );
}
