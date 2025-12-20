import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from './route';

vi.mock('@/lib/auth', () => ({
    auth: vi.fn()
}));

vi.mock('@/lib/db', () => ({
    db: {
        select: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(() => ({
                    limit: vi.fn()
                }))
            }))
        })),
        update: vi.fn(() => ({
            set: vi.fn(() => ({
                where: vi.fn(() => ({
                    returning: vi.fn()
                }))
            }))
        }))
    },
    bookings: {},
    tutors: {},
    students: {}
}));

import { auth } from '@/lib/auth';

describe('Booking Update API', () => {
    it('should unauthorized if not logged in', async () => {
        (auth as any).mockResolvedValue(null);
        const req = new Request('http://localhost/api/bookings/1', { method: 'PUT' });
        const res = await PUT(req, { params: Promise.resolve({ id: '1' }) });
        expect(res.status).toBe(401);
    });

    // Add more granular tests here
});
