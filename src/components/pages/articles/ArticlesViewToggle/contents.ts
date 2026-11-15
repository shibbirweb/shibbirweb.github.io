import LayoutGrid from '@/components/icons/layout-grid';
import LayoutList from '@/components/icons/layout-list';
import type { ArticlesView } from '@/components/pages/articles/ArticlesViewToggle/articlesView';
import type { ComponentType, SVGProps } from 'react';

export type ArticlesViewOption = {
    view: ArticlesView;
    label: string;
    Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

/** The layouts the toggle offers, in order; the first is the default. */
export const articlesViewOptions: ArticlesViewOption[] = [
    {
        view: 'grid',
        label: 'Grid view',
        Icon: LayoutGrid,
    },
    {
        view: 'list',
        label: 'List view',
        Icon: LayoutList,
    },
];
