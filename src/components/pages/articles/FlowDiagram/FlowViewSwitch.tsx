'use client';

import styles from '@/components/pages/articles/FlowDiagram/FlowDiagram.module.css';
import type { FlowView } from '@/components/pages/articles/FlowDiagram/types';

/**
 * Chooses which rendering of the diagram is on screen. Always present: every
 * diagram has both a static picture and a live canvas.
 */
export default function FlowViewSwitch({
    view,
    onSelectView,
}: {
    view: FlowView;
    onSelectView: (view: FlowView) => void;
}) {
    return (
        <div
            className={styles.viewSwitch}
            role="group"
            aria-label="Diagram rendering"
        >
            <button
                type="button"
                onClick={() => onSelectView('static')}
                aria-pressed={view === 'static'}
                className={styles.scenarioButton}
            >
                Static
            </button>
            <button
                type="button"
                onClick={() => onSelectView('interactive')}
                aria-pressed={view === 'interactive'}
                className={styles.scenarioButton}
            >
                Interactive
            </button>
        </div>
    );
}
