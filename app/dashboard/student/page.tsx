import { db, students, bookings, tutors, users } from '@/lib/db';
import { eq, and, gt, desc, lte } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchInput } from '@/app/dashboard/search';

export default async function StudentDashboard() {
    const session = await auth();
    if (session?.user?.role !== 'student') {
        redirect('/dashboard');
    }

    const studentRecord = await db
        .select()
        .from(students)
        .where(eq(students.userId, parseInt(session.user.id!)))
        .limit(1);

    if (studentRecord.length === 0) {
        return (
            <div className="p-6">
                <p>Student profile not found. Please contact support.</p>
            </div>
        );
    }

    const upcomingSessions = await db
        .select({
            id: bookings.id,
            subject: bookings.subject,
            sessionDate: bookings.sessionDate,
            tutorName: users.fullname,
            tutorId: tutors.id
        })
        .from(bookings)
        .innerJoin(tutors, eq(bookings.tutorId, tutors.id))
        .innerJoin(users, eq(tutors.userId, users.id))
        .where(
            and(
                eq(bookings.studentId, studentRecord[0].id),
                gt(bookings.sessionDate, new Date())
            )
        )
        .orderBy(bookings.sessionDate)
        .limit(3);

    const pastSessions = await db
        .select({
            id: bookings.id,
            subject: bookings.subject,
            sessionDate: bookings.sessionDate,
            tutorName: users.fullname
        })
        .from(bookings)
        .innerJoin(tutors, eq(bookings.tutorId, tutors.id))
        .innerJoin(users, eq(tutors.userId, users.id))
        .where(
            and(
                eq(bookings.studentId, studentRecord[0].id),
                lte(bookings.sessionDate, new Date())
            )
        )
        .orderBy(desc(bookings.sessionDate))
        .limit(3);

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Student Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Find a Tutor</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>Search for verified tutors by subject.</p>
                        <SearchInput basePath="/dashboard/student/search" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {upcomingSessions.length > 0 ? (
                            <ul className="space-y-2">
                                {upcomingSessions.map((session) => (
                                    <li key={session.id} className="border-b pb-2 last:border-0">
                                        <p className="font-medium">{session.subject}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(session.sessionDate).toLocaleString()}
                                        </p>
                                        <p className="text-sm">with {session.tutorName}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>You have no upcoming sessions.</p>
                        )}
                        <div className="mt-4">
                            <a href="/dashboard/student/bookings" className="text-sm text-blue-600 hover:underline">View all upcoming</a>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Past Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pastSessions.length > 0 ? (
                            <ul className="space-y-2">
                                {pastSessions.map((session) => (
                                    <li key={session.id} className="border-b pb-2 last:border-0">
                                        <p className="font-medium">{session.subject}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(session.sessionDate).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm">with {session.tutorName}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No past sessions.</p>
                        )}
                        <div className="mt-4">
                            <a href="/dashboard/student/bookings" className="text-sm text-blue-600 hover:underline">View history</a>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
