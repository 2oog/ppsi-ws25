import { describe, it, expect, vi } from 'vitest';
import { PUT } from './route';

vi.mock('@/lib/auth', () => ({
    auth: vi.fn()
}));

vi.mock('@/lib/db', () => ({
    db: {
        update: vi.fn(() => ({
            set: vi.fn(() => ({
                where: vi.fn(() => ({
                    returning: vi.fn().mockResolvedValue([{ userId: 1 }])
                }))
            }))
        })),
        insert: vi.fn(() => ({
            values: vi.fn()
        }))
    },
    tutors: {},
    notifications: {}
}));

import { auth } from '@/lib/auth';

describe('Admin Tutor Verification API', () => {
    it('should reject non-admin users', async () => {
        (auth as any).mockResolvedValue({ user: { role: 'student' } });
        const req = new Request('http://localhost:3000/api/admin/tutors/1/verify', {
            method: 'PUT'
        });
        const res = await PUT(req, { params: Promise.resolve({ id: '1' }) });
        expect(res.status).toBe(401);
    });

    it('should validate status input', async () => {
        (auth as any).mockResolvedValue({ user: { role: 'admin' } });
        const req = new Request('http://localhost:3000/api/admin/tutors/1/verify', {
            method: 'PUT',
            body: JSON.stringify({ status: 'invalid_status' })
        });
        const res = await PUT(req, { params: Promise.resolve({ id: '1' }) });
        expect(res.status).toBe(400);
    });

    it('should update status if valid', async () => {
        (auth as any).mockResolvedValue({ user: { role: 'admin' } });
        const req = new Request('http://localhost:3000/api/admin/tutors/1/verify', {
            method: 'PUT',
            body: JSON.stringify({ status: 'approved' })
        });
        const res = await PUT(req, { params: Promise.resolve({ id: '1' }) });
        expect(res.status).toBe(200);
    });
});
