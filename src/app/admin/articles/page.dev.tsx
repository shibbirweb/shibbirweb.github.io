import AdminShell from '@/components/admin/AdminShell';
import ArticlesDashboard from '@/components/admin/Dashboard';

export default function ArticlesAdminPage() {
    return (
        <AdminShell>
            <ArticlesDashboard />
        </AdminShell>
    );
}
