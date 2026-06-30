'use client';

import { createPortal } from 'react-dom';
import { useOverlayEscape } from '@/components/admin/ui/hooks/useOverlayEscape';
import { useLockBodyScroll } from '@/components/admin/ui/hooks/useLockBodyScroll';
import Icon from '@/components/admin/ui/Icon';
import {
    SelectField,
    TextField,
    TextAreaField,
    Toggle,
} from '@/components/admin/ui/Field';
import TagPicker from '@/components/admin/Editor/fields/TagPicker';
import ListField from '@/components/admin/Editor/fields/ListField';
import SeriesField from '@/components/admin/Editor/fields/SeriesField';
import CoverField from '@/components/admin/Editor/fields/CoverField';
import FormSection from '@/components/admin/Editor/fields/FormSection';
import { cn } from '@/utils/cn';
import type {
    ArticleFrontmatter,
    ArticleStatus,
    StudioMeta,
} from '@/lib/admin/types';

/**
 * The structured frontmatter editor, as a slide-over drawer. It never exposes
 * raw YAML: every field is a typed control, and the store serializes the result.
 */
export default function FrontmatterDrawer({
    open,
    onClose,
    frontmatter,
    setFrontmatter,
    slug,
    setSlug,
    meta,
    status,
}: {
    open: boolean;
    onClose: () => void;
    frontmatter: ArticleFrontmatter;
    setFrontmatter: (patch: Partial<ArticleFrontmatter>) => void;
    slug: string;
    setSlug: (slug: string) => void;
    meta: StudioMeta;
    status: ArticleStatus;
}) {
    useOverlayEscape(open, onClose);
    useLockBodyScroll(open);
    if (typeof document === 'undefined') return null;

    return createPortal(
        <div
            className={cn(
                'fixed inset-0 z-[80]',
                open ? '' : 'pointer-events-none'
            )}
            aria-hidden={!open}
        >
            <button
                type="button"
                aria-label="Close details"
                onClick={onClose}
                className={cn(
                    'absolute inset-0 bg-black/40 transition-opacity',
                    open ? 'opacity-100' : 'opacity-0'
                )}
            />
            <aside
                role="dialog"
                aria-label="Article details"
                className={cn(
                    'bg-background scheme-light-dark absolute top-0 right-0 flex h-full w-full max-w-md flex-col border-l border-foreground/10 shadow-2xl transition-transform duration-300',
                    open ? 'translate-x-0' : 'translate-x-full'
                )}
            >
                <header className="border-foreground/10 flex items-center justify-between border-b px-5 py-4">
                    <h2 className="font-semibold">Article details</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="text-foreground/50 hover:bg-foreground/10 hover:text-foreground rounded-lg p-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none"
                    >
                        <Icon name="close" className="size-5" />
                    </button>
                </header>

                <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
                    <FormSection title="Basics">
                        <TextField
                            label="Slug"
                            value={slug}
                            onChange={(event) => setSlug(event.target.value)}
                            hint="Sets the URL and filename. Saving renames the file."
                            placeholder="my-article"
                        />
                        <TextAreaField
                            label="Description"
                            value={frontmatter.description}
                            onChange={(event) =>
                                setFrontmatter({ description: event.target.value })
                            }
                            rows={3}
                            hint="Used on cards and as the SEO description."
                            placeholder="A one or two sentence summary"
                        />
                    </FormSection>

                    <FormSection title="Taxonomy">
                        <div className="relative">
                            <TextField
                                label="Category"
                                value={frontmatter.category ?? ''}
                                onChange={(event) =>
                                    setFrontmatter({
                                        category: event.target.value || undefined,
                                    })
                                }
                                list="studio-category-suggestions"
                                placeholder="Backend"
                            />
                            <datalist id="studio-category-suggestions">
                                {meta.categories.map((category) => (
                                    <option key={category} value={category} />
                                ))}
                            </datalist>
                        </div>
                        <TagPicker
                            label="Tags"
                            value={frontmatter.tags}
                            suggestions={meta.tags}
                            onChange={(tags) => setFrontmatter({ tags })}
                        />
                        <TagPicker
                            label="Tech stack"
                            value={frontmatter.tech}
                            suggestions={[]}
                            onChange={(tech) => setFrontmatter({ tech })}
                            placeholder="Add a tool"
                        />
                        <SelectField
                            label="Difficulty"
                            value={frontmatter.difficulty ?? ''}
                            onChange={(event) =>
                                setFrontmatter({
                                    difficulty:
                                        (event.target
                                            .value as ArticleFrontmatter['difficulty']) ||
                                        undefined,
                                })
                            }
                        >
                            <option value="">Not set</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </SelectField>
                    </FormSection>

                    <FormSection title="Publishing">
                        <div className="grid grid-cols-2 gap-3">
                            <TextField
                                label="Published date"
                                type="date"
                                value={frontmatter.date}
                                onChange={(event) =>
                                    setFrontmatter({ date: event.target.value })
                                }
                            />
                            <TextField
                                label="Updated date"
                                type="date"
                                value={frontmatter.updated ?? ''}
                                onChange={(event) =>
                                    setFrontmatter({
                                        updated: event.target.value || undefined,
                                    })
                                }
                            />
                        </div>
                        <Toggle
                            label="Featured"
                            description="Highlight this article"
                            checked={frontmatter.featured === true}
                            onChange={(featured) => setFrontmatter({ featured })}
                        />
                        <Toggle
                            label="Draft flag"
                            description={
                                status === 'draft'
                                    ? 'This file lives in the drafts folder.'
                                    : 'Keeps a published file hidden from the site.'
                            }
                            checked={frontmatter.draft === true}
                            onChange={(draft) =>
                                setFrontmatter({ draft: draft || undefined })
                            }
                        />
                    </FormSection>

                    <FormSection title="Series">
                        <SeriesField
                            value={frontmatter.series}
                            suggestions={meta.series}
                            onChange={(series) => setFrontmatter({ series })}
                        />
                    </FormSection>

                    <FormSection title="What you'll learn">
                        <ListField
                            value={frontmatter.learn}
                            onChange={(learn) => setFrontmatter({ learn })}
                            placeholder="A key takeaway"
                        />
                    </FormSection>

                    <FormSection title="SEO & media">
                        <CoverField
                            value={frontmatter.cover}
                            slug={slug}
                            onChange={(cover) => setFrontmatter({ cover })}
                        />
                        <TextField
                            label="Canonical URL"
                            value={frontmatter.canonical ?? ''}
                            onChange={(event) =>
                                setFrontmatter({
                                    canonical: event.target.value || undefined,
                                })
                            }
                            placeholder="https://shibbir.me/articles/..."
                        />
                        <TagPicker
                            label="SEO keywords"
                            value={frontmatter.keywords}
                            suggestions={meta.tags}
                            onChange={(keywords) => setFrontmatter({ keywords })}
                        />
                    </FormSection>
                </div>
            </aside>
        </div>,
        document.body
    );
}
