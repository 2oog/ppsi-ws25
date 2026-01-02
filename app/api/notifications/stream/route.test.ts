import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
    auth: vi.fn()
}));

vi.mock('@/lib/db', () => ({
    db: {
        select: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(() => ({
                    orderBy: vi.fn(() => ({
                        limit: vi.fn().mockResolvedValue([])
                    }))
                }))
            }))
        }))
    },
    notifications: {
        userId: 'userId', // dummy field for eq
        createdAt: 'createdAt' // dummy field for desc
    }
}));

// Mock AbortController/Signal for the request
const createMockRequest = (userId: string | null = null) => {
    const signal = new AbortController().signal;
    return new Request('http://localhost:3000/api/notifications/stream', {
        signal
    });
};

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

describe('SSE Notifications API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if not authorized', async () => {
        (auth as any).mockResolvedValue(null);

        const req = createMockRequest(null);
        const response = await GET(req);

        expect(response.status).toBe(401);
        // NextResponse return type check if needed, but status is sufficient
    });

    it('should return 200 and set up event stream if authorized', async () => {
        (auth as any).mockResolvedValue({ user: { id: '1' } });

        // Mock DB returning some data
        const mockNotifications = [
            { id: 1, message: 'Test', isRead: false, createdAt: new Date().toISOString() }
        ];

        // Need to reconstruct the chain for the mock to return data
        const mockLimit = vi.fn().mockResolvedValue(mockNotifications);
        const mockOrderBy = vi.fn(() => ({ limit: mockLimit }));
        const mockWhere = vi.fn(() => ({ orderBy: mockOrderBy }));
        const mockFrom = vi.fn(() => ({ where: mockWhere }));
        (db.select as any).mockImplementation(() => ({ from: mockFrom }));

        const req = createMockRequest('1');

        // We mock functionality that closes the stream quickly to avoid infinite loop in test
        // However, the route loop checks `request.signal.aborted`. 
        // In a real integration test we'd abort the controller.
        // For unit test, we just want to verify headers and stream existence.

        const response = await GET(req);

        expect(response.status).toBe(200);
        expect(response.headers.get('Content-Type')).toBe('text/event-stream');
        expect(response.headers.get('Cache-Control')).toBe('no-cache, no-transform');
        expect(response.headers.get('Connection')).toBe('keep-alive');
        expect(response.body).toBeDefined();

        // We can't easily await the stream processing here without aborting the signal 
        // because the loop inside GET waits for 5 seconds.
        // But verifying headers and status is usually enough for route config.
    });
});
