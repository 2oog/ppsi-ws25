import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2, R2_BUCKET_NAME, R2_PUBLIC_URL } from '@/lib/r2';

/**
 * Generic file upload endpoint.
 *
 * @remarks
 * Uploads one or more files to the configured storage (R2).
 * Returns the public URLs and/or API proxy paths for the uploaded files.
 *
 * @param request - The incoming HTTP request containing FormData.
 * @param request.body - FormData with 'files' field.
 *
 * @returns A JSON response containing an array of uploaded file paths.
 * @throws 400 - No files uploaded.
 * @throws 500 - Internal server error.
 */
export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
        }

        const uploadedPaths: string[] = [];

        for (const file of files) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

            await r2.send(new PutObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: filename,
                Body: buffer,
                ContentType: file.type,
            }));

            // If R2_PUBLIC_URL is set and NOT the S3 endpoint, use it.
            // Otherwise, use the proxy route.
            const isS3Endpoint = R2_PUBLIC_URL && R2_PUBLIC_URL.includes('r2.cloudflarestorage.com');

            console.log('Debug Upload:', { R2_PUBLIC_URL, isS3Endpoint, filename });

            const publicUrl = (R2_PUBLIC_URL && !isS3Endpoint)
                ? `${R2_PUBLIC_URL}/${filename}`
                : `/api/files/${filename}`;

            console.log('Debug Public URL:', publicUrl);

            uploadedPaths.push(publicUrl);
        }

        return NextResponse.json({ paths: uploadedPaths });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
