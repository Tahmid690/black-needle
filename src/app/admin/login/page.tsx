import { getAdminSession } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';
import LoginForm from './LoginForm';

export default async function LoginPage() {
  // Check auth session, redirect to dashboard if logged in
  const isAdmin = await getAdminSession();
  if (isAdmin) {
    redirect('/admin/dashboard');
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <LoginForm />
    </div>
  );
}
