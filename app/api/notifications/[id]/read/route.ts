import { auth } from '@/lib/auth';
import { db, notifications } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 * Marks a specific notification as read.
 *
 * @remarks
 * Updates the 'isRead' status of a notification to true.
 * Requires the user to be the owner of the notification.
 *
 * @param request - The incoming HTTP request.
 * @param params - The route parameters containing the notification ID.
 * @param params.id - The unique identifier of the notification.
 *
 * @returns A JSON response with the updated notification.
 * @throws 401 - Unauthorized.
 * @throws 404 - Notification not found or not owned by the user.
 * @throws 500 - Internal server error.
 */
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const notificationId = parseInt(id);
    const userId = parseInt(session.user.id!);

    try {
        // Verify ownership
        const notification = await db
            .select()
            .from(notifications)
            .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
            .limit(1);

        if (notification.length === 0) {
            return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
        }

        const [updated] = await db
            .update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.id, notificationId))
            .returning();

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating notification:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
