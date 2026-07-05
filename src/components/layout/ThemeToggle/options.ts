import Sun from '@/components/icons/sun';
import Monitor from '@/components/icons/monitor';
import Moon from '@/components/icons/moon';
import type { ThemePreference } from '@/components/layout/ThemeToggle/theme';

export interface ThemeOption {
    value: ThemePreference;
    label: string;
    Icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
}

/** The three theme choices, shared by the segmented ThemeToggle (mobile) and the
 *  round ThemeMenu (desktop). Ordered system -> light -> dark. */
export const themeOptions: ThemeOption[] = [
    { value: 'system', label: 'System', Icon: Monitor },
    { value: 'light', label: 'Light', Icon: Sun },
    { value: 'dark', label: 'Dark', Icon: Moon },
];
