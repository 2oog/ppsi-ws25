import { auth } from '@/lib/auth';
import { db, reviews, bookings, tutors } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const createReviewSchema = z.object({
    bookingId: z.number(),
    rating: z.number().min(1).max(5),
    comment: z.string().min(1)
});

/**
 * Creates a new review for a completed booking.
 *
 * @remarks
 * Allows students to rate and comment on a tutor after a completed session.
 * Automatically recalculates and updates the tutor's average rating.
 *
 * @param request - The incoming HTTP request.
 * @param request.body - JSON payload with bookingId, rating (1-5), and comment.
 *
 * @returns A JSON response with the created review.
 * @throws 401 - Unauthorized or not a student.
 * @throws 404 - Booking not found.
 * @throws 400 - Invalid input or session not completed.
 * @throws 500 - Internal server error.
 */
export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user || session.user.role !== 'student') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { bookingId, rating, comment } = createReviewSchema.parse(body);
        const userId = parseInt(session.user.id!);

        const booking = await db
            .select()
            .from(bookings)
            .where(eq(bookings.id, bookingId))
            .limit(1);

        if (booking.length === 0) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        if (booking[0].status !== 'completed') {
            return NextResponse.json({ error: 'Session must be completed to review' }, { status: 400 });
        }

        const [newReview] = await db
            .insert(reviews)
            .values({
                tutorId: booking[0].tutorId,
                studentId: booking[0].studentId,
                bookingId: booking[0].id,
                rating,
                comment
            })
            .returning();

        // Update tutor average rating
        const tutorReviews = await db
            .select({ rating: reviews.rating })
            .from(reviews)
            .where(eq(reviews.tutorId, booking[0].tutorId));

        const avgRating = tutorReviews.reduce((acc, r) => acc + (r.rating || 0), 0) / tutorReviews.length;

        await db
            .update(tutors)
            .set({ averageRating: avgRating.toFixed(2) })
            .where(eq(tutors.id, booking[0].tutorId));

        return NextResponse.json(newReview, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
        }
        console.error('Error creating review:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
