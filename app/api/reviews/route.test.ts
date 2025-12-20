import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

vi.mock('@/lib/auth', () => ({
    auth: vi.fn()
}));

vi.mock('@/lib/db', () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        from: vi.fn(),
        where: vi.fn(),
        limit: vi.fn()
    },
    reviews: {},
    bookings: {},
    tutors: {}
}));

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

describe('Reviews API', () => {
    it('should return 401 if user is not a student', async () => {
        (auth as any).mockResolvedValue({ user: { role: 'tutor' } });
        const req = new Request('http://localhost:3000/api/reviews', { method: 'POST' });
        const res = await POST(req);
        expect(res.status).toBe(401);
    });

    it('should validate inputs', async () => {
        (auth as any).mockResolvedValue({ user: { role: 'student', id: '1' } });
        const req = new Request('http://localhost:3000/api/reviews', {
            method: 'POST',
            body: JSON.stringify({ rating: 6 }) // Invalid rating
        });
        const res = await POST(req);
        expect(res.status).toBe(400);
    });

    // We can add logic to mock DB responses for deeper white box testing
    // e.g. "Session must be completed" logic check
});
