import { getAdminSession } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';
import AdminNav from '../components/AdminNav';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

export default async function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  // Check auth session
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col lg:flex-row">
      {/* Sidebar navigation */}
      <AdminNav />

      {/* Main content area */}
      <div className="flex-1 lg:pl-64 min-h-screen flex flex-col">
        <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
