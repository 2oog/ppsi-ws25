import { describe, it, expect, vi } from 'vitest';
import { GET } from './route';

vi.mock('@/lib/db', () => {
    // Create the chain object locally inside the factory
    const chain: any = {
        from: vi.fn(),
        innerJoin: vi.fn(),
        where: vi.fn(),
        then: vi.fn((resolve) => resolve([])),
    };
    // Implement chaining
    chain.from.mockReturnValue(chain);
    chain.innerJoin.mockReturnValue(chain);
    chain.where.mockReturnValue(chain);

    return {
        db: {
            select: vi.fn(() => chain)
        },
        tutors: {
            id: 'tutors.id',
            userId: 'tutors.userId',
            verificationStatus: 'tutors.verificationStatus',
            specialization: 'tutors.specialization',
            averageRating: 'tutors.averageRating',
            createdAt: 'tutors.createdAt',
            cvFilePath: 'tutors.cvFilePath',
            certificateFilePaths: 'tutors.certificateFilePaths',
            bio: 'tutors.bio',
            hourlyRate: 'tutors.hourlyRate',
            experienceYears: 'tutors.experienceYears',
            totalSessions: 'tutors.totalSessions'
        },
        users: {
            id: 'users.id',
            fullname: 'users.fullname',
            email: 'users.email'
        }
    };
});

import { db } from '@/lib/db';

describe('Tutors Search API', () => {
    it('should parse query parameters correctly and execute query', async () => {
        const req = new Request('http://localhost:3000/api/tutors?subject=Math&minRating=4');

        await GET(req);

        // Access the mocked functions to verify they were called
        // Since db.select() returns the chain, we check db.select first
        expect(db.select).toHaveBeenCalled();

        // To check the chain methods, we get the result of the first call
        // Cast to any to avoid TypeScript errors since we know it's a mock object
        const chain: any = db.select();
        expect(chain.from).toHaveBeenCalled();
        expect(chain.innerJoin).toHaveBeenCalled();
        expect(chain.where).toHaveBeenCalled();
    });
});
