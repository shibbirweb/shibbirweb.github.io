import AdminShell from '@/components/admin/AdminShell';
import Overview from '@/components/admin/Overview';

export default function AdminHomePage() {
    return (
        <AdminShell>
            <Overview />
        </AdminShell>
    );
}
