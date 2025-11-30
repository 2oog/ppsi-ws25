import { db, users, students, tutors } from '@/lib/db';
import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    fullname: z.string().min(2),
    role: z.enum(['student', 'tutor', 'admin']),
    phone: z.string().min(1, 'Phone number is required'),
    specialization: z.string().optional(),
    cvFilePath: z.string().optional(),
    certificateFilePaths: z.array(z.string()).optional()
});

function formatPhoneNumber(phone: string): string {
    // Remove any whitespace
    let formatted = phone.trim();

    // If leading +, remove it (international format)
    if (formatted.startsWith('+')) {
        formatted = formatted.substring(1);
    }

    // If leading 0, assume it's from Indonesia and convert to 62xxx
    else if (formatted.startsWith('0')) {
        formatted = '62' + formatted.substring(1);
    }

    return formatted;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, fullname, role, phone, specialization, cvFilePath, certificateFilePaths } = registerSchema.parse(body);

        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (existingUser.length > 0) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 400 }
            );
        }

        const passwordHash = await hash(password, 10);

        // Format the phone number according to the rules
        const formattedPhone = formatPhoneNumber(phone);

        const [newUser] = await db
            .insert(users)
            .values({
                email,
                passwordHash,
                fullname,
                role,
                phone: formattedPhone
            })
            .returning();

        if (role === 'student') {
            await db.insert(students).values({
                userId: newUser.id
            });
        } else if (role === 'tutor') {
            await db.insert(tutors).values({
                userId: newUser.id,
                specialization,
                cvFilePath,
                certificateFilePaths
            });
        }

        return NextResponse.json(
            { message: 'User created successfully' },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            const { fieldErrors } = error.flatten();
            return NextResponse.json(
                {
                    error: 'Invalid input',
                    fieldErrors,
                },
                { status: 400 }
            );
        }

        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}