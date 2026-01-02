import { auth } from '@/lib/auth';
import { db, tutors, users } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 * Retrieves a list of all tutors with their user details.
 *
 * @remarks
 * This endpoint is restricted to administrators. It fetches all tutors,
 * including their verification status and detailed user information,
 * ordered by creation date descending.
 *
 * @param request - The incoming HTTP request.
 *
 * @returns A JSON response containing an array of tutor objects.
 * @throws 401 - Unauthorized if the user is not an admin.
 * @throws 500 - Internal server error.
 */
export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const results = await db
            .select({
                id: tutors.id,
                fullname: users.fullname,
                email: users.email,
                specialization: tutors.specialization,
                verificationStatus: tutors.verificationStatus,
                cvFilePath: tutors.cvFilePath,
                certificateFilePaths: tutors.certificateFilePaths,
                createdAt: tutors.createdAt
            })
            .from(tutors)
            .innerJoin(users, eq(tutors.userId, users.id))
            .orderBy(desc(tutors.createdAt));

        return NextResponse.json(results);
    } catch (error) {
        console.error('Error fetching tutors:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
