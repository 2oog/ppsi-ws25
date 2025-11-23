import { auth } from '@/lib/auth';
import { db, notifications } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

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
