import { db, tutors, users, reviews, students } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

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
