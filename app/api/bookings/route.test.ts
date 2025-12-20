import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from './route';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
    auth: vi.fn()
}));

vi.mock('@/lib/db', () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        from: vi.fn(),
        where: vi.fn(),
        limit: vi.fn(),
        innerJoin: vi.fn(),
        orderBy: vi.fn(),
    },
    bookings: { id: 'id', studentId: 'studentId' },
    students: { id: 'id', userId: 'userId' },
    tutors: { id: 'id', userId: 'userId' },
    users: { id: 'id', fullname: 'fullname' },
    notifications: {}
}));

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

describe('Bookings API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('POST (Create Booking)', () => {
        it('should return 401 if user is not authenticated or not a student', async () => {
            (auth as any).mockResolvedValue({ user: { role: 'tutor' } });

            const req = new Request('http://localhost:3000/api/bookings', {
                method: 'POST',
                body: JSON.stringify({})
            });

            const res = await POST(req);
            expect(res.status).toBe(401);
        });

        it('should return 400 for invalid input', async () => {
            (auth as any).mockResolvedValue({ user: { role: 'student', id: '1' } });

            const req = new Request('http://localhost:3000/api/bookings', {
                method: 'POST',
                body: JSON.stringify({
                    // Missing required fields
                    tutorId: 1
                })
            });

            const res = await POST(req);
            expect(res.status).toBe(400);
        });

        // More detailed mock setup for success case is complex due to chaining, 
        // effectively tested in 'Integration' style usually.
        // For white box, we check if validation logic holds.
    });
});
