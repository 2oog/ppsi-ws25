import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// Mock auth
vi.mock('@/lib/auth', () => ({
    auth: vi.fn(),
}));

// Mock db
const mockSelectChain = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn(),
};

const mockUpdateChain = {
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue({}),
};

vi.mock('@/lib/db', () => ({
    db: {
        select: vi.fn(() => mockSelectChain),
        update: vi.fn(() => mockUpdateChain),
    },
    tutors: {
        userId: 'userId',
        id: 'id',
    },
}));

// Mock r2
vi.mock('@/lib/r2', () => ({
    r2: {
        send: vi.fn().mockResolvedValue({}),
    },
    R2_BUCKET_NAME: 'test-bucket',
    R2_PUBLIC_URL: 'https://test-r2.com',
}));

describe('Tutors Documents Upload API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if not authenticated', async () => {
        (auth as any).mockResolvedValue(null);
        // We can use a real Request for simple cases where body isn't read
        const req = new Request('http://localhost/api', { method: 'POST' });
        const res = await POST(req);
        expect(res.status).toBe(401);
        const json = await res.json();
        expect(json.error).toBe('Unauthorized');
    });

    it('should return 401 if role is not tutor', async () => {
        (auth as any).mockResolvedValue({ user: { role: 'student' } });
        const req = new Request('http://localhost/api', { method: 'POST' });
        const res = await POST(req);
        expect(res.status).toBe(401);
    });

    it('should return 400 if no files uploaded', async () => {
        (auth as any).mockResolvedValue({ user: { id: '1', role: 'tutor' } });

        const mockFormData = {
            get: vi.fn().mockReturnValue(null),
        };
        const req = {
            formData: vi.fn().mockResolvedValue(mockFormData),
        } as any;

        const res = await POST(req);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toBe('No files uploaded');
    });

    it('should return 404 if tutor profile not found', async () => {
        (auth as any).mockResolvedValue({ user: { id: '1', role: 'tutor' } });

        const mockFile = {
            name: 'cv.pdf',
            type: 'application/pdf',
            arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
        };
        const mockFormData = {
            get: vi.fn((key) => key === 'cv' ? mockFile : null),
        };
        const req = {
            formData: vi.fn().mockResolvedValue(mockFormData),
        } as any;

        // Mock db to return empty array
        mockSelectChain.limit.mockResolvedValue([]);

        const res = await POST(req);
        expect(res.status).toBe(404);
        const json = await res.json();
        expect(json.error).toBe('Tutor profile not found');
    });

    it('should upload CV and return success', async () => {
        (auth as any).mockResolvedValue({ user: { id: '1', role: 'tutor' } });

        const mockFile = {
            name: 'cv.pdf',
            type: 'application/pdf',
            arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
        };
        const mockFormData = {
            get: vi.fn((key) => key === 'cv' ? mockFile : null),
        };
        const req = {
            formData: vi.fn().mockResolvedValue(mockFormData),
        } as any;

        // Mock db to return found tutor
        mockSelectChain.limit.mockResolvedValue([{ id: 10 }]);

        const res = await POST(req);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.message).toBe('Upload successful');
        expect(json.paths.cvFilePath).toContain('https://test-r2.com/cv-1-');
    });

    it('should upload Certificate and return success', async () => {
        (auth as any).mockResolvedValue({ user: { id: '1', role: 'tutor' } });

        const mockFile = {
            name: 'cert.pdf',
            type: 'application/pdf',
            arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
        };
        const mockFormData = {
            get: vi.fn((key) => key === 'certificate' ? mockFile : null),
        };
        const req = {
            formData: vi.fn().mockResolvedValue(mockFormData),
        } as any;

        // Mock db to return found tutor
        mockSelectChain.limit.mockResolvedValue([{ id: 10 }]);

        const res = await POST(req);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.message).toBe('Upload successful');
        expect(json.paths.certificateFilePaths).toBeDefined();
        // Check if array has string
        expect(json.paths.certificateFilePaths[0]).toContain('https://test-r2.com/cert-1-');
    });

    it('should upload both files and return success', async () => {
        (auth as any).mockResolvedValue({ user: { id: '1', role: 'tutor' } });

        const mockCv = {
            name: 'cv.pdf', type: 'application/pdf', arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
        };
        const mockCert = {
            name: 'cert.pdf', type: 'application/pdf', arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
        };

        const mockFormData = {
            get: vi.fn((key) => {
                if (key === 'cv') return mockCv;
                if (key === 'certificate') return mockCert;
                return null;
            }),
        };
        const req = {
            formData: vi.fn().mockResolvedValue(mockFormData),
        } as any;

        mockSelectChain.limit.mockResolvedValue([{ id: 10 }]);

        const res = await POST(req);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.message).toBe('Upload successful');
        expect(json.paths.cvFilePath).toBeDefined();
        expect(json.paths.certificateFilePaths).toBeDefined();
    });

    it('should return 500 on internal error', async () => {
        (auth as any).mockResolvedValue({ user: { id: '1', role: 'tutor' } });

        const mockFile = {
            name: 'cv.pdf',
            type: 'application/pdf',
            arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
        };
        const mockFormData = {
            get: vi.fn((key) => key === 'cv' ? mockFile : null),
        };

        const req = {
            formData: vi.fn().mockResolvedValue(mockFormData),
        } as any;

        // Mock db to throw error
        mockSelectChain.limit.mockRejectedValue(new Error('DB Error'));

        const res = await POST(req);
        expect(res.status).toBe(500);
        const json = await res.json();
        expect(json.error).toBe('Internal server error');
    });
});
