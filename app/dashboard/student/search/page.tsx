import { TutorSearch } from '@/components/tutor-search';
import { TutorCard } from '@/components/tutor-card';
import { Suspense } from 'react';

async function getTutors(subject?: string) {
    const { db, tutors, users } = await import('@/lib/db');
    const { eq, and, like } = await import('drizzle-orm');

    const conditions = [eq(tutors.verificationStatus, 'approved')];

    if (subject) {
        conditions.push(like(tutors.specialization, `%${subject}%`));
    }

    const results = await db
        .select({
            id: tutors.id,
            userId: tutors.userId,
            fullname: users.fullname,
            bio: tutors.bio,
            specialization: tutors.specialization,
            experienceYears: tutors.experienceYears,
            hourlyRate: tutors.hourlyRate,
            averageRating: tutors.averageRating,
            totalSessions: tutors.totalSessions,
            verificationStatus: tutors.verificationStatus
        })
        .from(tutors)
        .innerJoin(users, eq(tutors.userId, users.id))
        .where(and(...conditions));

    return results;
}

export default async function SearchPage(
    props: {
        searchParams: Promise<{ subject?: string }>;
    }
) {
    const searchParams = await props.searchParams;
    const subject = searchParams.subject;
    const tutors = await getTutors(subject);

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold">Find a Tutor</h1>
                <Suspense>
                    <TutorSearch />
                </Suspense>
            </div>

            {tutors.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                    No tutors found. Try a different subject.
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {tutors.map((tutor) => (
                        <TutorCard key={tutor.id} tutor={{
                            ...tutor,
                            specialization: tutor.specialization || 'General',
                            hourlyRate: tutor.hourlyRate || '0',
                            averageRating: tutor.averageRating || '0.00',
                            experienceYears: tutor.experienceYears || 0,
                            totalSessions: tutor.totalSessions || 0
                        }} />
                    ))}
                </div>
            )}
        </div>
    );
}
