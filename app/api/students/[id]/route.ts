import { db, students } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const studentId = parseInt(id);

    if (isNaN(studentId)) {
        return NextResponse.json({ error: 'Invalid student ID' }, { status: 400 });
    }

    try {
        const body = await request.json();
        const { educationLevel, interests } = body;

        const updatedStudent = await db
            .update(students)
            .set({
                educationLevel,
                interests,
                // updatedAt: new Date() // students table doesn't have updatedAt in schema provided earlier, checking schema...
            })
            .where(eq(students.id, studentId))
            .returning();

        if (updatedStudent.length === 0) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        return NextResponse.json(updatedStudent[0]);
    } catch (error) {
        console.error('Error updating student profile:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
