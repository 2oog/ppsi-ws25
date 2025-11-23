import { BookingList } from '@/components/booking-list';
import { auth } from '@/lib/auth';
import { db, bookings, tutors, users } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import { redirect } from 'next/navigation';

async function getStudentBookings(studentUserId: number) {
    // We need to find the student record first
    const { students } = await import('@/lib/db');
    const studentRecord = await db
        .select()
        .from(students)
        .where(eq(students.userId, studentUserId))
        .limit(1);

    if (studentRecord.length === 0) return [];

    const results = await db
        .select({
            id: bookings.id,
            subject: bookings.subject,
            sessionDate: bookings.sessionDate,
            durationMinutes: bookings.durationMinutes,
            status: bookings.status,
            notes: bookings.notes,
            tutorName: users.fullname,
            tutorId: tutors.id
        })
        .from(bookings)
        .innerJoin(tutors, eq(bookings.tutorId, tutors.id))
        .innerJoin(users, eq(tutors.userId, users.id))
        .where(eq(bookings.studentId, studentRecord[0].id))
        .orderBy(desc(bookings.sessionDate));

    // Map to match BookingList interface
    return results.map(b => ({
        ...b,
        sessionDate: b.sessionDate.toISOString(),
        status: b.status as 'pending' | 'confirmed' | 'completed' | 'cancelled'
    }));
}

export default async function StudentBookingsPage() {
    const session = await auth();
    if (!session?.user || session.user.role !== 'student') {
        redirect('/login');
    }

    const myBookings = await getStudentBookings(parseInt(session.user.id!));

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">My Bookings</h1>
            <BookingList bookings={myBookings} role="student" />
        </div>
    );
}
