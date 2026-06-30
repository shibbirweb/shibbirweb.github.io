import Icon from '@/components/admin/ui/Icon';
import Button, { iconButtonClasses } from '@/components/admin/ui/Button';
import Spinner from '@/components/admin/ui/Spinner';
import { SelectField, CONTROL } from '@/components/admin/ui/Field';
import { cn } from '@/utils/cn';
import type { StudioMeta } from '@/lib/admin/types';
import type {
    DashboardFilters,
    SortKey,
    StatusFilter,
    ViewMode,
} from '@/components/admin/Dashboard/types';

/** Search, filter, sort, view-toggle, and the primary create action. */
export default function DashboardToolbar({
    filters,
    onChange,
    meta,
    view,
    onViewChange,
    onCreate,
    creating,
}: {
    filters: DashboardFilters;
    onChange: (patch: Partial<DashboardFilters>) => void;
    meta: StudioMeta;
    view: ViewMode;
    onViewChange: (view: ViewMode) => void;
    onCreate: () => void;
    creating: boolean;
}) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Icon
                        name="search"
                        className="text-foreground/40 pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                    />
                    <input
                        type="search"
                        value={filters.search}
                        onChange={(event) =>
                            onChange({ search: event.target.value })
                        }
                        placeholder="Search title, description, slug, tags..."
                        className={cn(CONTROL, 'h-10 pr-3 pl-9')}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <div className="border-foreground/15 flex h-10 items-center rounded-lg border p-0.5">
                        {(['list', 'grid'] as const).map((mode) => (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => onViewChange(mode)}
                                aria-label={`${mode} view`}
                                aria-pressed={view === mode}
                                className={iconButtonClasses(
                                    cn(
                                        'size-8',
                                        view === mode &&
                                            'bg-foreground/10 text-foreground'
                                    )
                                )}
                            >
                                <Icon
                                    name={mode === 'list' ? 'list' : 'layers'}
                                    className="size-4"
                                />
                            </button>
                        ))}
                    </div>
                    <Button
                        variant="primary"
                        onClick={onCreate}
                        disabled={creating}
                    >
                        {creating ? (
                            <Spinner className="size-4" />
                        ) : (
                            <Icon name="plus" className="size-4" />
                        )}
                        New article
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-end">
                <SelectField
                    label="Status"
                    value={filters.status}
                    onChange={(event) =>
                        onChange({
                            status: event.target.value as StatusFilter,
                        })
                    }
                    className="sm:w-40"
                >
                    <option value="all">All statuses</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="hidden">Hidden</option>
                </SelectField>

                <SelectField
                    label="Category"
                    value={filters.category}
                    onChange={(event) =>
                        onChange({ category: event.target.value })
                    }
                    className="sm:w-44"
                >
                    <option value="all">All categories</option>
                    {meta.categories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </SelectField>

                <SelectField
                    label="Tag"
                    value={filters.tag}
                    onChange={(event) => onChange({ tag: event.target.value })}
                    className="sm:w-44"
                >
                    <option value="all">All tags</option>
                    {meta.tags.map((tag) => (
                        <option key={tag} value={tag}>
                            {tag}
                        </option>
                    ))}
                </SelectField>

                <SelectField
                    label="Sort by"
                    value={filters.sort}
                    onChange={(event) =>
                        onChange({ sort: event.target.value as SortKey })
                    }
                    className="sm:w-44"
                >
                    <option value="recent">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="updated">Recently edited</option>
                    <option value="title">Title (A to Z)</option>
                    <option value="reading">Reading time</option>
                </SelectField>
            </div>
        </div>
    );
}
