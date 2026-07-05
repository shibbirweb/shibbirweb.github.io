import type { Metadata } from 'next';
import { cn } from '@/utils/cn';
import Breadcrumb from '@/components/layout/Breadcrumb';
import DownloadPdfButton from '@/components/pages/resume/DownloadPdfButton';
import ResumeDocument from '@/components/pages/resume/ResumeDocument';
import {
    resumeContacts,
    resumeLocation,
    resumeName,
    resumeSections,
} from '@/app/resume/contents';
import { jetBrainsMono } from '@/config/monoFont';
import { siteName } from '@/config/constants';

const description = `The professional resume of ${siteName}: work experience, projects, technical skills, and education, with a one-click Save as PDF.`;

export const metadata: Metadata = {
    title: 'Resume',
    description,
    alternates: { canonical: '/resume' },
    openGraph: {
        title: `Resume | ${siteName}`,
        description,
        url: '/resume',
        type: 'website',
    },
};

export default function ResumePage() {
    return (
        // JetBrains Mono drives the meta lines (dates, contact). In print we flip
        // the theme tokens to a light document on this subtree (custom props
        // inherit and win over :root[data-theme='dark']), so all `text-foreground`
        // prints dark-on-white; browsers already drop backgrounds in print.
        <main
            className={cn(
                jetBrainsMono.variable,
                'container mx-auto px-4 py-20 sm:py-28',
                'print:mx-0 print:max-w-none print:px-0 print:py-0',
                'print:scheme-light print:[--background:#fff] print:[--foreground:#000]'
            )}
        >
            <div className="print:hidden">
                <Breadcrumb />
            </div>
            <div className="mx-auto mb-8 flex max-w-4xl justify-end print:hidden">
                <DownloadPdfButton />
            </div>
            <ResumeDocument
                name={resumeName}
                location={resumeLocation}
                contacts={resumeContacts}
                sections={resumeSections}
            />
        </main>
    );
}
