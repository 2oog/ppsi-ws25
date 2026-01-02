import { auth } from '@/lib/auth';
import { db, tutors } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2, R2_BUCKET_NAME, R2_PUBLIC_URL } from '@/lib/r2';

/**
 * Uploads tutor verification documents (CV and Certificates).
 *
 * @remarks
 * Allows tutors to upload files to R2 storage.
 * Updates the tutor's profile with the new file paths.
 *
 * @param request - The incoming HTTP request containing FormData.
 * @param request.body - FormData with 'cv' and/or 'certificate' files.
 *
 * @returns A JSON response with upload status and file paths.
 * @throws 401 - Unauthorized (must be a tutor).
 * @throws 400 - No files uploaded.
 * @throws 404 - Tutor profile not found.
 * @throws 500 - Internal server error.
 */
export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user || session.user.role !== 'tutor') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const cvFile = formData.get('cv') as File | null;
        const certFile = formData.get('certificate') as File | null;

        if (!cvFile && !certFile) {
            return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
        }

        const userId = parseInt(session.user.id!);
        const tutorRecord = await db
            .select()
            .from(tutors)
            .where(eq(tutors.userId, userId))
            .limit(1);

        if (tutorRecord.length === 0) {
            return NextResponse.json({ error: 'Tutor profile not found' }, { status: 404 });
        }

        const updates: any = {};

        if (cvFile) {
            const buffer = Buffer.from(await cvFile.arrayBuffer());
            const filename = `cv-${userId}-${Date.now()}-${cvFile.name.replace(/\s+/g, '-')}`;

            await r2.send(new PutObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: filename,
                Body: buffer,
                ContentType: cvFile.type,
            }));

            const isS3Endpoint = R2_PUBLIC_URL && R2_PUBLIC_URL.includes('r2.cloudflarestorage.com');

            updates.cvFilePath = (R2_PUBLIC_URL && !isS3Endpoint)
                ? `${R2_PUBLIC_URL}/${filename}`
                : `/api/files/${filename}`;
        }

        if (certFile) {
            const buffer = Buffer.from(await certFile.arrayBuffer());
            const filename = `cert-${userId}-${Date.now()}-${certFile.name.replace(/\s+/g, '-')}`;

            await r2.send(new PutObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: filename,
                Body: buffer,
                ContentType: certFile.type,
            }));

            const isS3Endpoint = R2_PUBLIC_URL && R2_PUBLIC_URL.includes('r2.cloudflarestorage.com');

            updates.certificateFilePaths = [
                (R2_PUBLIC_URL && !isS3Endpoint)
                    ? `${R2_PUBLIC_URL}/${filename}`
                    : `/api/files/${filename}`
            ];
        }

        await db
            .update(tutors)
            .set(updates)
            .where(eq(tutors.id, tutorRecord[0].id));

        return NextResponse.json({ message: 'Upload successful', paths: updates });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
