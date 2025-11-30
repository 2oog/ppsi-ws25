import { GetObjectCommand } from '@aws-sdk/client-s3';
import { r2, R2_BUCKET_NAME } from '@/lib/r2';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ key: string }> }
) {
    const key = (await params).key;

    if (!key) {
        return NextResponse.json({ error: 'File key is required' }, { status: 400 });
    }

    try {
        const command = new GetObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
        });

        const response = await r2.send(command);

        if (!response.Body) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        // @ts-ignore
        const stream = response.Body as ReadableStream;

        const headers = new Headers();
        headers.set('Content-Type', response.ContentType || 'application/octet-stream');
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');

        return new NextResponse(stream as any, {
            status: 200,
            headers,
        });

    } catch (error: any) {
        console.error('Error fetching file from R2:', error);
        if (error.name === 'NoSuchKey') {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
