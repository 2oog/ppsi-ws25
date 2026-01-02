import { auth } from '@/lib/auth';
import { db, notifications } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 * Retrieves a list of recent notifications for the authenticated user.
 *
 * @remarks
 * Fetches the 20 most recent notifications for the user, ordered by creation date.
 *
 * @param request - The incoming HTTP request.
 *
 * @returns A JSON response containing an array of notifications.
 * @throws 401 - Unauthorized.
 * @throws 500 - Internal server error.
 */
export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userId = parseInt(session.user.id!);

        const results = await db
            .select()
            .from(notifications)
            .where(eq(notifications.userId, userId))
            .orderBy(desc(notifications.createdAt))
            .limit(20); // Limit to recent 20

        return NextResponse.json(results);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
