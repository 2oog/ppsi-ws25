import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function StudentDashboard() {
    const session = await auth();
    if (session?.user?.role !== 'student') {
        redirect('/dashboard');
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Student Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Find a Tutor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Search for verified tutors by subject.</p>
                        {/* Search Component will go here */}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>You have no upcoming sessions.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Past Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>View your learning history.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
