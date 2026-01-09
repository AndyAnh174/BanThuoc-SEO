import { redirect } from 'next/navigation';

export default function AdminDashboardPage() {
    // For now, redirect to user management as it's the primary feature implemented
    // Later this can be a stats dashboard
    redirect('/admin/users');
}
