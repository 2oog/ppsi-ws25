import { db, students } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 * Updates a student's profile information.
 *
 * @remarks
 * Allows updating education level and interests for a specific student.
 *
 * @param request - The incoming HTTP request.
 * @param params - The route parameters containing the student ID.
 * @param params.id - The unique identifier of the student.
 *
 * @returns A JSON response with the updated student profile.
 * @throws 400 - Invalid student ID.
 * @throws 404 - Student not found.
 * @throws 500 - Internal server error.
 */
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
