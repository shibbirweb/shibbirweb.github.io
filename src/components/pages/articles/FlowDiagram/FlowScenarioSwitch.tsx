'use client';

import styles from '@/components/pages/articles/FlowDiagram/FlowDiagram.module.css';
import type { FlowScenario } from '@/components/pages/articles/FlowDiagram/types';

/**
 * Chooses which route through the diagram is lit. Rendered only when there is more
 * than one, which the control bar decides: a single scenario has nothing to switch
 * between, and one pill permanently pressed reads as broken.
 */
export default function FlowScenarioSwitch({
    scenarios,
    activeScenarioId,
    onSelectScenario,
}: {
    scenarios: FlowScenario[];
    activeScenarioId: string;
    onSelectScenario: (scenarioId: string) => void;
}) {
    return (
        <div
            className={styles.scenarioSwitch}
            role="group"
            aria-label="Diagram scenario"
        >
            {scenarios.map((scenario) => (
                <button
                    key={scenario.id}
                    type="button"
                    onClick={() => onSelectScenario(scenario.id)}
                    aria-pressed={scenario.id === activeScenarioId}
                    className={styles.scenarioButton}
                >
                    {scenario.label}
                </button>
            ))}
        </div>
    );
}
