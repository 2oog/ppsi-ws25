import { auth } from '@/lib/auth';
import { db, tutors, users } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { AdminVerificationTable } from '@/components/admin-verification-table';

async function getPendingTutors() {
    const results = await db
        .select({
            id: tutors.id,
            fullname: users.fullname,
            email: users.email,
            specialization: tutors.specialization,
            verificationStatus: tutors.verificationStatus,
            cvFilePath: tutors.cvFilePath,
            certificateFilePaths: tutors.certificateFilePaths,
            createdAt: tutors.createdAt
        })
        .from(tutors)
        .innerJoin(users, eq(tutors.userId, users.id))
        .orderBy(desc(tutors.createdAt));

    return results.map(t => ({
        ...t,
        createdAt: t.createdAt ? t.createdAt.toISOString() : new Date().toISOString()
    }));
}

export default async function AdminVerificationPage() {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
        redirect('/login');
    }

    const pendingTutors = await getPendingTutors();

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Verification Queue</h1>
            <AdminVerificationTable tutors={pendingTutors} />
        </div>
    );
}
