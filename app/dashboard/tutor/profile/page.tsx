import { auth } from '@/lib/auth';
import { db, tutors } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { VerificationForm } from '@/components/verification-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

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

    const profile = await getTutorProfile(parseInt(session.user.id!));

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">My Profile</h1>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Specialization</Label>
                                <Input defaultValue={profile.specialization || ''} readOnly />
                            </div>
                            <div className="grid gap-2">
                                <Label>Hourly Rate</Label>
                                <Input defaultValue={profile.hourlyRate || ''} readOnly />
                            </div>
                            <div className="grid gap-2">
                                <Label>Experience (Years)</Label>
                                <Input defaultValue={profile.experienceYears?.toString() || ''} readOnly />
                            </div>
                            <div className="grid gap-2">
                                <Label>Bio</Label>
                                <Textarea defaultValue={profile.bio || ''} readOnly />
                            </div>
                            <Button variant="outline" className="w-full">Edit Profile (Coming Soon)</Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <VerificationForm currentStatus={profile.verificationStatus || 'pending'} />
                </div>
            </div>
        </div>
    );
}
