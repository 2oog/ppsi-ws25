import { auth } from '@/lib/auth';
import { db, notifications } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }
    const userId = parseInt(session.user.id!);

    const encoder = new TextEncoder();
    let isStreamClosed = false;
    let lastData = '';

    const stream = new ReadableStream({
        async start(controller) {

            const sendEvent = (data: any) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            };

            while (!isStreamClosed) {
                if (request.signal.aborted) {
                    isStreamClosed = true;
                    break;
                }

                try {
                    const results = await db
                        .select()
                        .from(notifications)
                        .where(eq(notifications.userId, userId))
                        .orderBy(desc(notifications.createdAt))
                        .limit(20);

                    const currentData = JSON.stringify(results);

                    if (currentData !== lastData) {
                        sendEvent(results);
                        lastData = currentData;
                    }
                } catch (error) {
                    console.error('Error in SSE stream:', error);
                    // Optionally send an error event or close
                }

                // Wait for 5 seconds before next poll
                await new Promise((resolve) => setTimeout(resolve, 5000));
            }

            try {
                controller.close();
            } catch (e) {
                // Controller might already be closed
            }
        },
        cancel() {
            isStreamClosed = true;
        }
    });

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
        },
    });
}
