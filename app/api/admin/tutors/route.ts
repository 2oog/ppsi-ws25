import { auth } from '@/lib/auth';
import { db, tutors, users } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

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
                certificateFilePath: tutors.certificateFilePath,
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
