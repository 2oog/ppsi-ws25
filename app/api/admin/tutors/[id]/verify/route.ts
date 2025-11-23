import { auth } from '@/lib/auth';
import { db, tutors } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const verifySchema = z.object({
    status: z.enum(['approved', 'rejected', 'pending'])
});

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const tutorId = parseInt(id);

    try {
        const body = await request.json();
        const { status } = verifySchema.parse(body);

        const [updatedTutor] = await db
            .update(tutors)
            .set({ verificationStatus: status })
            .where(eq(tutors.id, tutorId))
            .returning();

        return NextResponse.json(updatedTutor);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
        }
        console.error('Error verifying tutor:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
