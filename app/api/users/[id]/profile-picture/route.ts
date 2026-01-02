import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 * Updates a user's profile picture.
 *
 * @remarks
 * Updates the 'profilePicture' URL field in the user record.
 *
 * @param request - The incoming HTTP request.
 * @param params - The route parameters.
 * @param params.id - The unique identifier of the user.
 *
 * @returns A JSON response with the updated user record.
 * @throws 400 - Invalid user ID or missing profile picture URL.
 * @throws 404 - User not found.
 * @throws 500 - Internal server error.
 */
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    try {
        const body = await request.json();
        const { profilePicture } = body;

        if (!profilePicture) {
            return NextResponse.json({ error: 'Profile picture URL is required' }, { status: 400 });
        }

        const updatedUser = await db
            .update(users)
            .set({
                profilePicture,
                updatedAt: new Date()
            })
            .where(eq(users.id, userId))
            .returning();

        if (updatedUser.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(updatedUser[0]);
    } catch (error) {
        console.error('Error updating profile picture:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
