import { auth } from '@/lib/auth';
import { db, notifications } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 * Marks all notifications for the current user as read.
 *
 * @remarks
 * This endpoint allows users to clear their unread notification count
 * by setting 'isRead' to true for all their notifications.
 *
 * @param request - The incoming HTTP request.
 *
 * @returns A JSON response indicating success.
 * @throws 401 - Unauthorized.
 * @throws 500 - Internal server error.
 */
export async function PUT(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userId = parseInt(session.user.id);

        await db
            .update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.userId, userId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
