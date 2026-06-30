import type { IconName } from '@/components/admin/ui/Icon';

export type EditorMode = 'visual' | 'split' | 'markdown';

export const EDITOR_MODES: { id: EditorMode; label: string; icon: IconName }[] = [
    { id: 'visual', label: 'Visual', icon: 'pencil' },
    { id: 'split', label: 'Split', icon: 'split' },
    { id: 'markdown', label: 'Markdown', icon: 'code' },
];
