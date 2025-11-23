import { auth } from '@/lib/auth';
import { db, tutors } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

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

        const uploadDir = path.join(process.cwd(), 'public/uploads');
        await mkdir(uploadDir, { recursive: true });

        const updates: any = {};

        if (cvFile) {
            const buffer = Buffer.from(await cvFile.arrayBuffer());
            const filename = `cv-${userId}-${Date.now()}-${cvFile.name}`;
            await writeFile(path.join(uploadDir, filename), buffer);
            updates.cvFilePath = `/uploads/${filename}`;
        }

        if (certFile) {
            const buffer = Buffer.from(await certFile.arrayBuffer());
            const filename = `cert-${userId}-${Date.now()}-${certFile.name}`;
            await writeFile(path.join(uploadDir, filename), buffer);
            updates.certificateFilePath = `/uploads/${filename}`;
        }

        // If both files are present (or at least one if re-uploading), we might want to set status to pending?
        // For now, just update paths.

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
