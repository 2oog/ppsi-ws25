import { db, tutors, users } from '@/lib/db';
import { eq, and, like, gte } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const specialization = searchParams.get('specialization');
    const minRating = searchParams.get('minRating');

    try {
        let query = db
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
                verificationStatus: tutors.verificationStatus
            })
            .from(tutors)
            .innerJoin(users, eq(tutors.userId, users.id))
            .where(eq(tutors.verificationStatus, 'approved'));

        if (subject) {
            // Simple search in specialization for now, can be expanded
            // query = query.where(like(tutors.specialization, `%${subject}%`));
            // Note: Chaining .where() in Drizzle might need dynamic construction or 'and()'
        }

        // Constructing dynamic where clause
        const conditions = [eq(tutors.verificationStatus, 'approved')];

        if (subject || specialization) {
            const term = subject || specialization;
            conditions.push(like(tutors.specialization, `%${term}%`));
        }

        if (minRating) {
            conditions.push(gte(tutors.averageRating, minRating));
        }

        const results = await db
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
                verificationStatus: tutors.verificationStatus
            })
            .from(tutors)
            .innerJoin(users, eq(tutors.userId, users.id))
            .where(and(...conditions));

        return NextResponse.json(results);
    } catch (error) {
        console.error('Error fetching tutors:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
