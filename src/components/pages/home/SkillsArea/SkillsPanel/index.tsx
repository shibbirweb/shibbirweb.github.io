import { cn } from '@/utils/cn';
import styles from '@/components/pages/home/SkillsArea/SkillsPanel/SkillsPanel.module.css';
import type { ReactNode } from 'react';

/**
 * The shared backdrop for the whole skills section: AI engineering on top, the
 * full-stack foundation below. It has no border of its own (the AI skill cards
 * carry the borders); it only holds the two halves together and carries the
 * signature violet bloom from the top, where the AI half is
 * (SkillsPanel.module.css).
 */
export default function SkillsPanel({ children }: { children: ReactNode }) {
    return (
        <div
            data-skills-panel
            className={cn(styles.panel, 'relative isolate')}
        >
            <div className="relative">{children}</div>
        </div>
    );
}
