import { BookingList } from '@/components/booking-list';
import { auth } from '@/lib/auth';
import { db, bookings, tutors, users, students } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import { redirect } from 'next/navigation';

async function getTutorBookings(tutorUserId: number) {
    const tutorRecord = await db
        .select()
        .from(tutors)
        .where(eq(tutors.userId, tutorUserId))
        .limit(1);

    if (tutorRecord.length === 0) return [];

    const results = await db
        .select({
            id: bookings.id,
            subject: bookings.subject,
            sessionDate: bookings.sessionDate,
            durationMinutes: bookings.durationMinutes,
            status: bookings.status,
            notes: bookings.notes,
            studentName: users.fullname,
            studentId: students.id
        })
        .from(bookings)
        .innerJoin(students, eq(bookings.studentId, students.id))
        .innerJoin(users, eq(students.userId, users.id))
        .where(eq(bookings.tutorId, tutorRecord[0].id))
        .orderBy(desc(bookings.sessionDate));

    return results.map(b => ({
        ...b,
        sessionDate: b.sessionDate.toISOString(),
        status: b.status as 'pending' | 'confirmed' | 'completed' | 'cancelled'
    }));
}

export default async function TutorSchedulePage() {
    const session = await auth();
    if (!session?.user || session.user.role !== 'tutor') {
        redirect('/login');
    }

    const myBookings = await getTutorBookings(parseInt(session.user.id!));

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Schedule & Requests</h1>
            <BookingList bookings={myBookings} role="tutor" />
        </div>
    );
}
