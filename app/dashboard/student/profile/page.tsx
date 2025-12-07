import { auth } from '@/lib/auth';
import { db, students, users } from '@/lib/db';
import { eq, getTableColumns } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { StudentProfileForm } from '@/components/student/profile-form';

async function getStudentProfile(userId: number) {
    const studentRecord = await db
        .select({
            ...getTableColumns(students),
            profilePicture: users.profilePicture
        })
        .from(students)
        .innerJoin(users, eq(students.userId, users.id))
        .where(eq(students.userId, userId))
        .limit(1);
    return studentRecord[0];
}

export default async function StudentProfileDashboard() {
    const session = await auth();
    if (!session?.user || session.user.role !== 'student') {
        redirect('/login');
    }

    const userId = parseInt(session.user.id!);
    if (isNaN(userId)) {
        redirect('/login');
    }

    const profile = await getStudentProfile(userId);

    if (!profile) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold text-red-500">Profile not found</h1>
                <p>Please contact support.</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">My Profile</h1>

            <div className="max-w-2xl">
                <StudentProfileForm
                    studentId={profile.id}
                    userId={userId}
                    initialData={{
                        educationLevel: profile.educationLevel,
                        interests: profile.interests,
                        profilePicture: profile.profilePicture,
                    }}
                />
            </div>
        </div>
    );
}
