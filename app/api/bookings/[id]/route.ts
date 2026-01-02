import { db, bookings, tutors, students } from '@/lib/db';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const updateBookingSchema = z.object({
    status: z.enum(['confirmed', 'cancelled', 'completed'])
});

/**
 * Updates the status of an existing booking.
 *
 * @remarks
 * This endpoint allows tutors and students to update the status of a booking.
 * - Tutors can confirm, cancel, or complete bookings.
 * - Students can only cancel bookings.
 * Notifications are sent to the counterparty upon status update.
 *
 * @param request - The incoming HTTP request containing the new status.
 * @param params - The route parameters containing the booking ID.
 * @param params.id - The unique identifier of the booking.
 *
 * @returns A JSON response containing the updated booking record.
 * @throws 401 - Unauthorized if the user is not logged in.
 * @throws 403 - Forbidden if the user is not authorized to update this booking.
 * @throws 404 - Not Found if the booking does not exist.
 * @throws 500 - Internal server error.
 */
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const bookingId = parseInt(id);

    try {
        const body = await request.json();
        const { status } = updateBookingSchema.parse(body);
        const userId = parseInt(session.user.id!);

        // Verify ownership/permission
        const booking = await db
            .select()
            .from(bookings)
            .where(eq(bookings.id, bookingId))
            .limit(1);

        if (booking.length === 0) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        let isAuthorized = false;

        if (session.user.role === 'tutor') {
            const tutorRecord = await db
                .select()
                .from(tutors)
                .where(eq(tutors.userId, userId))
                .limit(1);
            if (tutorRecord.length > 0 && tutorRecord[0].id === booking[0].tutorId) {
                isAuthorized = true;
            }
        } else if (session.user.role === 'student') {
            // Students can only cancel
            if (status === 'cancelled') {
                const studentRecord = await db
                    .select()
                    .from(students)
                    .where(eq(students.userId, userId))
                    .limit(1);
                if (studentRecord.length > 0 && studentRecord[0].id === booking[0].studentId) {
                    isAuthorized = true;
                }
            }
        }

        if (!isAuthorized) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const [updatedBooking] = await db
            .update(bookings)
            .set({ status, updatedAt: new Date() })
            .where(eq(bookings.id, bookingId))
            .returning();

        // Create Notification
        let notifyUserId: number | null = null;
        let message = '';

        if (session.user.role === 'tutor') {
            const student = await db
                .select({ userId: students.userId })
                .from(students)
                .where(eq(students.id, booking[0].studentId))
                .limit(1);

            if (student.length > 0) {
                notifyUserId = student[0].userId;
                message = `Your booking for ${booking[0].subject} was ${status}.`;
            }
        } else if (session.user.role === 'student') {
            const tutor = await db
                .select({ userId: tutors.userId })
                .from(tutors)
                .where(eq(tutors.id, booking[0].tutorId))
                .limit(1);

            if (tutor.length > 0) {
                notifyUserId = tutor[0].userId;
                message = `Booking for ${booking[0].subject} was ${status} by student.`;
            }
        }

        if (notifyUserId) {
            const { notifications } = await import('@/lib/db');
            await db.insert(notifications).values({
                userId: notifyUserId,
                message,
                type: 'booking_update',
                isRead: false
            });
        }

        return NextResponse.json(updatedBooking);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
        }
        console.error('Error updating booking:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
