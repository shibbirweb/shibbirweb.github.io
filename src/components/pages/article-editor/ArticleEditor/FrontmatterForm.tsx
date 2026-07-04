'use client';

import { useId } from 'react';
import ChevronIcon from '@/components/icons/chevron';
import TagListInput from '@/components/pages/article-editor/ArticleEditor/TagListInput';
import type {
    ArticleFrontmatter,
    EditorSuggestions,
} from '@/components/pages/article-editor/ArticleEditor/types';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'] as const;
const inputClassName =
    'border-foreground/15 bg-background/60 mt-2 w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-foreground/40';

export default function FrontmatterForm({
    frontmatter,
    suggestions,
    onChange,
}: {
    frontmatter: ArticleFrontmatter;
    suggestions: EditorSuggestions;
    onChange: (patch: Partial<ArticleFrontmatter>) => void;
}) {
    const categoryListId = useId();
    const seriesListId = useId();

    return (
        <details
            open
            className="border-foreground/10 bg-background/45 group rounded-2xl border shadow-sm backdrop-blur"
        >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 select-none sm:px-6 [&::-webkit-details-marker]:hidden">
                <span>
                    <span className="text-foreground/45 block text-xs font-semibold tracking-[0.2em] uppercase">
                        Frontmatter
                    </span>
                    <span className="mt-1 block text-xl font-semibold">
                        Article details
                    </span>
                </span>
                <span className="text-foreground/50 flex items-center gap-2 text-xs">
                    <span className="hidden group-open:hidden sm:inline">
                        Expand
                    </span>
                    <span className="hidden group-open:sm:inline">
                        Collapse
                    </span>
                    <ChevronIcon className="rotate-180 transition-transform group-open:rotate-0" />
                </span>
            </summary>

            <div className="border-foreground/10 grid gap-5 border-t p-4 sm:grid-cols-2 sm:p-6">
                <label className="sm:col-span-2">
                    <span className="text-sm font-medium">Title</span>
                    <input
                        className={inputClassName}
                        value={frontmatter.title}
                        onChange={(event) =>
                            onChange({ title: event.target.value })
                        }
                    />
                </label>
                <label className="sm:col-span-2">
                    <span className="text-sm font-medium">Description</span>
                    <textarea
                        className={`${inputClassName} min-h-24 resize-y`}
                        value={frontmatter.description}
                        onChange={(event) =>
                            onChange({ description: event.target.value })
                        }
                    />
                </label>
                <label>
                    <span className="text-sm font-medium">Publish date</span>
                    <input
                        type="date"
                        className={inputClassName}
                        value={frontmatter.date}
                        onChange={(event) =>
                            onChange({ date: event.target.value })
                        }
                    />
                </label>
                <label>
                    <span className="text-sm font-medium">Updated date</span>
                    <input
                        type="date"
                        className={inputClassName}
                        value={frontmatter.updated ?? ''}
                        onChange={(event) =>
                            onChange({
                                updated: event.target.value || undefined,
                            })
                        }
                    />
                </label>
                <label>
                    <span className="text-sm font-medium">Category</span>
                    <input
                        className={inputClassName}
                        value={frontmatter.category ?? ''}
                        list={categoryListId}
                        onChange={(event) =>
                            onChange({
                                category: event.target.value || undefined,
                            })
                        }
                    />
                    <datalist id={categoryListId}>
                        {suggestions.categories.map((category) => (
                            <option
                                key={category}
                                value={category}
                            />
                        ))}
                    </datalist>
                </label>
                <label>
                    <span className="text-sm font-medium">Difficulty</span>
                    <select
                        className={`${inputClassName} cursor-pointer`}
                        value={frontmatter.difficulty ?? ''}
                        onChange={(event) =>
                            onChange({
                                difficulty:
                                    (event.target
                                        .value as ArticleFrontmatter['difficulty']) ||
                                    undefined,
                            })
                        }
                    >
                        <option value="">Not set</option>
                        {DIFFICULTIES.map((difficulty) => (
                            <option
                                key={difficulty}
                                value={difficulty}
                            >
                                {difficulty}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="sm:col-span-2">
                    <span className="text-sm font-medium">Cover path</span>
                    <input
                        className={inputClassName}
                        value={frontmatter.cover ?? ''}
                        onChange={(event) =>
                            onChange({ cover: event.target.value || undefined })
                        }
                    />
                </label>

                <div className="border-foreground/10 grid gap-4 rounded-xl border p-4 sm:col-span-2 sm:grid-cols-[1fr_8rem]">
                    <label>
                        <span className="text-sm font-medium">Series</span>
                        <input
                            className={inputClassName}
                            value={frontmatter.series?.name ?? ''}
                            list={seriesListId}
                            placeholder="Optional series name"
                            onChange={(event) =>
                                onChange({
                                    series: event.target.value
                                        ? {
                                              name: event.target.value,
                                              order:
                                                  frontmatter.series?.order ??
                                                  1,
                                          }
                                        : undefined,
                                })
                            }
                        />
                        <datalist id={seriesListId}>
                            {suggestions.seriesNames.map((series) => (
                                <option
                                    key={series}
                                    value={series}
                                />
                            ))}
                        </datalist>
                    </label>
                    <label>
                        <span className="text-sm font-medium">Part</span>
                        <input
                            type="number"
                            min="1"
                            className={inputClassName}
                            disabled={!frontmatter.series}
                            value={frontmatter.series?.order ?? 1}
                            onChange={(event) =>
                                frontmatter.series &&
                                onChange({
                                    series: {
                                        ...frontmatter.series,
                                        order: Number(event.target.value) || 1,
                                    },
                                })
                            }
                        />
                    </label>
                </div>

                <div className="sm:col-span-2">
                    <TagListInput
                        label="Tags"
                        values={frontmatter.tags}
                        suggestions={suggestions.tags}
                        placeholder="Type a tag and press Enter"
                        onChange={(tags) => onChange({ tags })}
                    />
                </div>
                <div className="sm:col-span-2">
                    <TagListInput
                        label="Tech"
                        values={frontmatter.tech}
                        suggestions={suggestions.tech}
                        placeholder="Type a technology and press Enter"
                        onChange={(tech) => onChange({ tech })}
                    />
                </div>
                <div className="sm:col-span-2">
                    <TagListInput
                        label="What readers will learn"
                        values={frontmatter.learn}
                        placeholder="Type a takeaway and press Enter"
                        onChange={(learn) => onChange({ learn })}
                    />
                </div>

                <label className="flex cursor-pointer items-center gap-2.5">
                    <input
                        type="checkbox"
                        className="accent-foreground size-4 cursor-pointer"
                        checked={frontmatter.draft}
                        onChange={(event) =>
                            onChange({ draft: event.target.checked })
                        }
                    />
                    <span className="text-sm font-medium">Draft</span>
                    <span className="text-foreground/45 text-xs">
                        Kept out of the published collection
                    </span>
                </label>
            </div>
        </details>
    );
}
