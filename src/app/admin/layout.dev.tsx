import type { Metadata } from 'next';
import ToastProvider from '@/components/admin/ui/Toast';

// The Article Studio is a development-only tool. These routes use the `.dev.tsx`
// suffix, which next.config.ts only registers as routable in development, so the
// production static export never contains any admin page. `noindex` is a belt
// and braces measure in case a route is ever served by accident.
export const metadata: Metadata = {
    title: 'Article Studio',
    robots: { index: false, follow: false },
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // `scheme-light-dark` opts native controls (select popups, date pickers,
    // number spinners) into the OS theme so they are legible in dark mode.
    // color-scheme inherits, so portalled overlays set it on their own roots.
    return (
        <ToastProvider>
            <div className="scheme-light-dark">{children}</div>
        </ToastProvider>
    );
}
