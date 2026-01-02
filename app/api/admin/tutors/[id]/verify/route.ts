import { auth } from '@/lib/auth';
import { db, tutors, notifications } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const verifySchema = z.object({
    status: z.enum(['approved', 'rejected', 'pending'])
});

/**
 * Updates the verification status of a tutor.
 *
 * @remarks
 * This endpoint allows an admin to approve or reject a tutor's verification request.
 * Upon status change, a notification is sent to the tutor.
 *
 * @param request - The incoming HTTP request containing the status update.
 * @param params - The route parameters containing the tutor's ID.
 * @param params.id - The ID of the tutor to verify.
 *
 * @returns A JSON response containing the updated tutor record.
 * @throws 401 - Unauthorized if the user is not an admin.
 * @throws 400 - Invalid input if the status is not 'approved', 'rejected', or 'pending'.
 * @throws 500 - Internal server error.
 */
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

        if (updatedTutor) {
            await db.insert(notifications).values({
                userId: updatedTutor.userId,
                type: 'verification_status',
                message: status === 'approved'
                    ? 'Your tutor account has been approved!'
                    : 'Your tutor verification request has been rejected.',
                isRead: false
            });
        }

        return NextResponse.json(updatedTutor);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
        }
        console.error('Error verifying tutor:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
