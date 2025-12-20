import { describe, it, expect, vi } from 'vitest';
import { GET } from './route';

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
    notifications: {}
}));

import { auth } from '@/lib/auth';

describe('Notifications API', () => {
    it('should unauthorized if not logged in', async () => {
        (auth as any).mockResolvedValue(null);
        const req = new Request('http://localhost:3000/api/notifications');
        const res = await GET(req);
        expect(res.status).toBe(401);
    });

    it('should return empty list if authorized', async () => {
        (auth as any).mockResolvedValue({ user: { id: '1' } });
        const req = new Request('http://localhost:3000/api/notifications');
        const res = await GET(req);
        const json = await res.json();
        expect(Array.isArray(json)).toBe(true);
    });
});
