import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db, tutors, bookings, students, users } from '@/lib/db';
import { eq, and, gt, desc, count, asc } from 'drizzle-orm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DashboardBookingActions } from '@/components/dashboard-booking-actions';

export default async function TutorDashboard() {
    const session = await auth();

    if (session?.user?.role !== 'tutor') {
        redirect('/dashboard');
    }

    // Fetch tutor profile
    const tutorRecord = await db
        .select()
        .from(tutors)
        .where(eq(tutors.userId, parseInt(session.user.id!)))
        .limit(1);

    if (tutorRecord.length === 0) {
        return (
            <div className="p-6">
                <Card className="bg-yellow-50 border-yellow-200">
                    <CardHeader>
                        <CardTitle className="text-yellow-800">Profile Incomplete</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-yellow-700 mb-4">
                            Your tutor profile is missing information. Please complete your profile to start receiving bookings.
                        </p>
                        <Link href="/dashboard/tutor/profile">
                            <Button variant="outline" className="bg-white hover:bg-yellow-100 border-yellow-300 text-yellow-900">
                                Complete Profile
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const tutorId = tutorRecord[0].id;

    // Parallel data fetching
    const [
        pendingRequestsCount,
        nextSessionResult,
        totalSessionsCount,
        pendingBookings,
        upcomingSessions
    ] = await Promise.all([
        // 1. Pending Requests Count
        db.select({ count: count() })
            .from(bookings)
            .where(and(
                eq(bookings.tutorId, tutorId),
                eq(bookings.status, 'pending')
            )),

        // 2. Next confirmed session
        db.select({ sessionDate: bookings.sessionDate })
            .from(bookings)
            .where(and(
                eq(bookings.tutorId, tutorId),
                eq(bookings.status, 'confirmed'),
                gt(bookings.sessionDate, new Date())
            ))
            .orderBy(asc(bookings.sessionDate))
            .limit(1),

        // 3. Total completed sessions
        db.select({ count: count() })
            .from(bookings)
            .where(and(
                eq(bookings.tutorId, tutorId),
                eq(bookings.status, 'completed')
            )),

        // 4. Recent Pending Requests (List)
        db.select({
            id: bookings.id,
            subject: bookings.subject,
            sessionDate: bookings.sessionDate,
            studentName: users.fullname,
            educationLevel: students.educationLevel
        })
            .from(bookings)
            .innerJoin(students, eq(bookings.studentId, students.id))
            .innerJoin(users, eq(students.userId, users.id))
            .where(and(
                eq(bookings.tutorId, tutorId),
                eq(bookings.status, 'pending')
            ))
            .orderBy(asc(bookings.sessionDate))
            .limit(5),

        // 5. Upcoming Sessions (List)
        db.select({
            id: bookings.id,
            subject: bookings.subject,
            sessionDate: bookings.sessionDate,
            studentName: users.fullname,
            status: bookings.status
        })
            .from(bookings)
            .innerJoin(students, eq(bookings.studentId, students.id))
            .innerJoin(users, eq(students.userId, users.id))
            .where(and(
                eq(bookings.tutorId, tutorId),
                eq(bookings.status, 'confirmed'),
                gt(bookings.sessionDate, new Date())
            ))
            .orderBy(asc(bookings.sessionDate))
            .limit(5)
    ]);

    const stats = {
        pendingRequests: pendingRequestsCount[0]?.count || 0,
        nextSession: nextSessionResult[0]?.sessionDate,
        totalSessions: totalSessionsCount[0]?.count || 0,
        averageRating: tutorRecord[0].averageRating || '0.0',
        verificationStatus: tutorRecord[0].verificationStatus ?? 'pending'
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Tutor Dashboard</h1>
                <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${stats.verificationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                        stats.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                        Status: {stats.verificationStatus.charAt(0).toUpperCase() + stats.verificationStatus.slice(1)}
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingRequests}</div>
                        <p className="text-xs text-muted-foreground">
                            Waiting for your action
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Next Session</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.nextSession
                                ? new Date(stats.nextSession).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
                                : '-'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats.nextSession
                                ? new Date(stats.nextSession).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                                : 'No upcoming confirmed sessions'}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalSessions}</div>
                        <p className="text-xs text-muted-foreground">
                            Completed sessions
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.averageRating}</div>
                        <p className="text-xs text-muted-foreground">
                            Based on student reviews
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Pending Requests List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>Booking Requests</span>
                            <Link href="/dashboard/tutor/schedule" className="text-sm text-blue-600 hover:underline">
                                View all
                            </Link>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pendingBookings.length > 0 ? (
                            <ul className="space-y-4">
                                {pendingBookings.map((booking) => (
                                    <li key={booking.id} className="border-b pb-3 last:border-0 last:pb-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-semibold">{booking.subject}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {booking.studentName} • {booking.educationLevel || 'Student'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium">
                                                    {new Date(booking.sessionDate).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {new Date(booking.sessionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                        <DashboardBookingActions bookingId={booking.id} />
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-6 text-muted-foreground">
                                No pending requests at the moment.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Upcoming Sessions List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>Upcoming Schedule</span>
                            <Link href="/dashboard/tutor/schedule" className="text-sm text-blue-600 hover:underline">
                                View calendar
                            </Link>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {upcomingSessions.length > 0 ? (
                            <ul className="space-y-4">
                                {upcomingSessions.map((booking) => (
                                    <li key={booking.id} className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-medium">{booking.subject}</p>
                                            <p className="text-sm text-muted-foreground">Student: {booking.studentName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold">
                                                {new Date(booking.sessionDate).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(booking.sessionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-6 text-muted-foreground">
                                No upcoming sessions scheduled.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
