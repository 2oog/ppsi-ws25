import { describe, it, expect, vi } from 'vitest';
import { POST } from './route';

// Mock AWS SDK
vi.mock('@aws-sdk/client-s3', () => ({
    PutObjectCommand: vi.fn(),
    S3Client: vi.fn(() => ({
        send: vi.fn().mockResolvedValue({})
    }))
}));

// Mock the r2 client import
vi.mock('@/lib/r2', () => ({
    r2: {
        send: vi.fn().mockResolvedValue({})
    },
    R2_BUCKET_NAME: 'test-bucket',
    R2_PUBLIC_URL: 'https://cdn.example.com'
}));

describe('Upload API', () => {
    it('should return 400 if no files uploaded', async () => {
        // Use a simpler mock for Request
        const req = {
            formData: async () => ({
                getAll: () => []
            })
        } as unknown as Request;

        const res = await POST(req);
        expect(res.status).toBe(400);
    });

    it('should upload files and return paths', async () => {
        // Create a mock file structure that works with the code
        // The code does: const buffer = Buffer.from(await file.arrayBuffer());
        // So we need an object with arrayBuffer method
        const mockFile = {
            name: 'test.png',
            type: 'image/png',
            arrayBuffer: async () => new ArrayBuffer(8)
        };

        const req = {
            formData: async () => ({
                getAll: () => [mockFile]
            })
        } as unknown as Request;

        const res = await POST(req);

        // Debug if strictly needed
        if (res.status !== 200) {
            console.error('Failed response:', await res.json());
        }

        const json = await res.json();

        expect(json).toHaveProperty('paths');
        expect(json.paths).toHaveLength(1);
        expect(json.paths[0]).toContain('cdn.example.com');
        expect(json.paths[0]).toContain('test.png');
    });
});
