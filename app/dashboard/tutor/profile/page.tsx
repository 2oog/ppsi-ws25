import { auth } from '@/lib/auth';
import { db, tutors } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { VerificationForm } from '@/components/verification-form';
import { ProfileForm } from '@/components/tutor/profile-form';

async function getTutorProfile(userId: number) {
    const tutorRecord = await db
        .select()
        .from(tutors)
        .where(eq(tutors.userId, userId))
        .limit(1);
    return tutorRecord[0];
}

export default async function TutorProfileDashboard() {
    const session = await auth();
    if (!session?.user || session.user.role !== 'tutor') {
        redirect('/login');
    }

    const userId = parseInt(session.user.id!);
    if (isNaN(userId)) {
        redirect('/login');
    }

    const profile = await getTutorProfile(userId);

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

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    <ProfileForm
                        tutorId={profile.id}
                        initialData={{
                            bio: profile.bio,
                            specialization: profile.specialization,
                            experienceYears: profile.experienceYears,
                            hourlyRate: profile.hourlyRate,
                        }}
                    />
                </div>

                <div className="space-y-6">
                    <VerificationForm currentStatus={profile.verificationStatus || 'pending'} />
                </div>
            </div>
        </div>
    );
}
