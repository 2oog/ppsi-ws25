import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db, tutors, users, students, bookings } from '@/lib/db';
import { count, eq, desc } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import Link from 'next/link';

export default async function AdminDashboard() {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
        redirect('/dashboard');
    }

    const studentUsers = alias(users, 'studentUsers');
    const tutorUsers = alias(users, 'tutorUsers');

    const [
        pendingTutorsResult,
        totalUsersResult,
        totalTutorsResult,
        totalStudentsResult,
        totalBookingsResult,
        recentBookings
    ] = await Promise.all([
        db.select({ count: count() }).from(tutors).where(eq(tutors.verificationStatus, 'pending')),
        db.select({ count: count() }).from(users),
        db.select({ count: count() }).from(tutors),
        db.select({ count: count() }).from(students),
        db.select({ count: count() }).from(bookings),
        db.select({
            id: bookings.id,
            subject: bookings.subject,
            status: bookings.status,
            sessionDate: bookings.sessionDate,
            studentName: studentUsers.fullname,
            tutorName: tutorUsers.fullname,
        })
            .from(bookings)
            .innerJoin(students, eq(bookings.studentId, students.id))
            .innerJoin(studentUsers, eq(students.userId, studentUsers.id))
            .innerJoin(tutors, eq(bookings.tutorId, tutors.id))
            .innerJoin(tutorUsers, eq(tutors.userId, tutorUsers.id))
            .orderBy(desc(bookings.createdAt))
            .limit(5)
    ]);

    const pendingCount = pendingTutorsResult[0]?.count || 0;
    const totalUsers = totalUsersResult[0]?.count || 0;
    const totalTutors = totalTutorsResult[0]?.count || 0;
    const totalStudents = totalStudentsResult[0]?.count || 0;
    const totalBookings = totalBookingsResult[0]?.count || 0;

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tutors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTutors}</div>
                        <p className="text-xs text-muted-foreground">{pendingCount} pending verification</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStudents}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalBookings}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Verification Queue */}
                <Card>
                    <CardHeader>
                        <CardTitle>Verification Queue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pendingCount > 0 ? (
                            <div className="space-y-4">
                                <p className="text-2xl font-bold">{pendingCount}</p>
                                <p className="text-muted-foreground">Pending verification requests</p>
                                <Link href="/dashboard/admin/verification" className="text-blue-600 hover:underline block">
                                    View Verification Queue &rarr;
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p>No pending verifications.</p>
                                <Link href="/dashboard/admin/verification" className="text-blue-600 hover:underline block">
                                    View All Tutors &rarr;
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Bookings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentBookings.length > 0 ? (
                            <ul className="space-y-4">
                                {recentBookings.map((booking) => (
                                    <li key={booking.id} className="border-b pb-4 last:border-0 last:pb-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium">{booking.subject}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    by {booking.studentName} with {booking.tutorName}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-xs px-2 py-1 rounded-full ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                                'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {booking.sessionDate ? new Date(booking.sessionDate).toLocaleDateString() : 'No Date'}
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground">No recent bookings found.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
