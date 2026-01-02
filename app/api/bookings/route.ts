import { db, bookings, tutors, students, users, notifications } from '@/lib/db';
import { auth } from '@/lib/auth';
import { eq, and, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const createBookingSchema = z.object({
    tutorId: z.number(),
    subject: z.string().min(1),
    sessionDate: z.string().datetime(),
    durationMinutes: z.number().min(30).default(60),
    notes: z.string().optional()
});

/**
 * Creates a new booking request.
 *
 * @remarks
 * Allows a student to book a session with a tutor.
 * Automatically notifies the tutor of the new booking request.
 *
 * @param request - The incoming HTTP request containing booking details.
 * @param request.body - JSON payload with tutorId, subject, sessionDate, durationMinutes, notes.
 *
 * @returns A JSON response with the created booking.
 * @throws 401 - Unauthorized if not a student.
 * @throws 404 - Student profile not found.
 * @throws 400 - Invalid input.
 * @throws 500 - Internal server error.
 */
export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user || session.user.role !== 'student') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { tutorId, subject, sessionDate, durationMinutes, notes } = createBookingSchema.parse(body);

        const studentRecord = await db
            .select()
            .from(students)
            .where(eq(students.userId, parseInt(session.user.id!)))
            .limit(1);

        if (studentRecord.length === 0) {
            return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
        }

        const [newBooking] = await db
            .insert(bookings)
            .values({
                studentId: studentRecord[0].id,
                tutorId,
                subject,
                sessionDate: new Date(sessionDate),
                durationMinutes,
                notes,
                status: 'pending'
            })
            .returning();

        // Notify the tutor
        const tutorRecord = await db
            .select({ userId: tutors.userId })
            .from(tutors)
            .where(eq(tutors.id, tutorId))
            .limit(1);

        if (tutorRecord.length > 0) {
            const studentUser = await db
                .select({ fullname: users.fullname })
                .from(users)
                .where(eq(users.id, parseInt(session.user.id!)))
                .limit(1);

            const studentName = studentUser[0]?.fullname || 'A student';

            await db.insert(notifications).values({
                userId: tutorRecord[0].userId,
                type: 'new_booking',
                message: `New booking request: ${subject} from ${studentName}`,
                isRead: false
            });
        }

        return NextResponse.json(newBooking, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
        }
        console.error('Error creating booking:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * Retrieves a list of bookings for the authenticated user.
 *
 * @remarks
 * Returns bookings relevant to the user's role (student or tutor).
 * Data includes details about the counterparty (tutor name for students, student name for tutors).
 *
 * @param request - The incoming HTTP request.
 *
 * @returns A JSON response containing an array of bookings.
 * @throws 401 - Unauthorized.
 * @throws 403 - Invalid role.
 * @throws 500 - Internal server error.
 */
export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userId = parseInt(session.user.id!);
        let results;

        if (session.user.role === 'student') {
            const studentRecord = await db
                .select()
                .from(students)
                .where(eq(students.userId, userId))
                .limit(1);

            if (studentRecord.length === 0) return NextResponse.json([]);

            results = await db
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
        } else if (session.user.role === 'tutor') {
            const tutorRecord = await db
                .select()
                .from(tutors)
                .where(eq(tutors.userId, userId))
                .limit(1);

            if (tutorRecord.length === 0) return NextResponse.json([]);

            results = await db
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
        } else {
            return NextResponse.json({ error: 'Invalid role' }, { status: 403 });
        }

        return NextResponse.json(results);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
