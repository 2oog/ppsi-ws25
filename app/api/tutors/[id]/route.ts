import { db, tutors, users, reviews, students } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 * Retrieves detailed information about a specific tutor.
 *
 * @remarks
 * Fetches tutor profile, user details, and reviews.
 * This endpoint is public (or at least accessible to authenticated users).
 *
 * @param request - The incoming HTTP request.
 * @param params - The route parameters.
 * @param params.id - The unique identifier of the tutor.
 *
 * @returns A JSON response with tutor details and reviews.
 * @throws 400 - Invalid tutor ID.
 * @throws 404 - Tutor not found.
 * @throws 500 - Internal server error.
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const tutorId = parseInt(id);

    if (isNaN(tutorId)) {
        return NextResponse.json({ error: 'Invalid tutor ID' }, { status: 400 });
    }

    try {
        const tutorData = await db
            .select({
                id: tutors.id,
                userId: tutors.userId,
                fullname: users.fullname,
                bio: tutors.bio,
                specialization: tutors.specialization,
                experienceYears: tutors.experienceYears,
                hourlyRate: tutors.hourlyRate,
                averageRating: tutors.averageRating,
                totalSessions: tutors.totalSessions,
                verificationStatus: tutors.verificationStatus,
                jadwalKetersediaan: tutors.jadwalKetersediaan
            })
            .from(tutors)
            .innerJoin(users, eq(tutors.userId, users.id))
            .where(eq(tutors.id, tutorId))
            .limit(1);

        if (tutorData.length === 0) {
            return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
        }

        const tutorReviews = await db
            .select({
                id: reviews.id,
                rating: reviews.rating,
                comment: reviews.comment,
                createdAt: reviews.createdAt,
                studentName: users.fullname
            })
            .from(reviews)
            .innerJoin(students, eq(reviews.studentId, students.id))
            .innerJoin(users, eq(students.userId, users.id))
            .where(eq(reviews.tutorId, tutorId))
            .orderBy(reviews.createdAt);

        return NextResponse.json({
            ...tutorData[0],
            reviews: tutorReviews
        });
    } catch (error) {
        console.error('Error fetching tutor details:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * Updates a tutor's profile information.
 *
 * @remarks
 * Allows updating bio, specialization, experience years, hourly rate, and schedule.
 * Performs validation on numeric fields.
 *
 * @param request - The incoming HTTP request.
 * @param params - The route parameters.
 * @param params.id - The unique identifier of the tutor.
 *
 * @returns A JSON response with the updated tutor profile.
 * @throws 400 - Invalid input (e.g. invalid hourly rate).
 * @throws 404 - Tutor not found.
 * @throws 500 - Internal server error.
 */
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const tutorId = parseInt(id);

    if (isNaN(tutorId)) {
        return NextResponse.json({ error: 'Invalid tutor ID' }, { status: 400 });
    }

    try {
        const body = await request.json();
        const { bio, specialization, experienceYears, hourlyRate, jadwalKetersediaan } = body;

        // Basic validation
        if (hourlyRate && isNaN(parseFloat(hourlyRate))) {
            return NextResponse.json(
                { error: 'Invalid hourly rate' },
                { status: 400 }
            );
        }

        if (experienceYears && isNaN(parseInt(experienceYears))) {
            return NextResponse.json(
                { error: 'Invalid experience years' },
                { status: 400 }
            );
        }

        const updatedTutor = await db
            .update(tutors)
            .set({
                bio,
                specialization,
                experienceYears: experienceYears ? parseInt(experienceYears) : undefined,
                hourlyRate: hourlyRate ? parseFloat(hourlyRate).toFixed(2) : undefined,
                jadwalKetersediaan,
                updatedAt: new Date()
            })
            .where(eq(tutors.id, tutorId))
            .returning();

        if (updatedTutor.length === 0) {
            return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
        }

        return NextResponse.json(updatedTutor[0]);
    } catch (error) {
        console.error('Error updating tutor profile:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
