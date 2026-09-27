import Sun from '@/components/icons/sun';
import Moon from '@/components/icons/moon';
import type { Theme } from '@/components/layout/ThemeToggle/theme';

export interface ThemeOption {
    value: Theme;
    label: string;
    Icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
}

/** The two theme choices, shared by the segmented ThemeToggle (mobile) and the
 *  round ThemeMenu (desktop). Ordered light -> dark. */
export const themeOptions: ThemeOption[] = [
    { value: 'light', label: 'Light', Icon: Sun },
    { value: 'dark', label: 'Dark', Icon: Moon },
];
