import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const role = session.user.role;

  if (role === 'student') {
    redirect('/dashboard/student');
  } else if (role === 'tutor') {
    redirect('/dashboard/tutor');
  } else if (role === 'admin') {
    redirect('/dashboard/admin');
  }

  return (
    <div className="flex items-center justify-center h-full">
      <p>Redirecting...</p>
    </div>
  );
}
