import { S3Client } from '@aws-sdk/client-s3';

export const r2 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    // Cloudflare R2 requires path-style requests (bucket in path), so force that here
    forcePathStyle: true,
    // Ensure signing uses the same region placeholder Cloudflare expects
    signingRegion: 'auto',
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'ppsi-ws25';
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || ''; // Optional: for public access if configured
