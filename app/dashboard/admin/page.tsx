import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminDashboard() {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
        redirect('/dashboard');
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Verification Queue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>No pending verifications.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Platform Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Overview of system usage.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
