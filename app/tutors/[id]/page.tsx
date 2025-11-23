import { db, tutors, users, reviews, students } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Clock, BookOpen, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookingModal } from '@/components/booking-modal';

async function getTutor(id: number) {
    const tutorData = await db
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
            verificationStatus: tutors.verificationStatus,
            jadwalKetersediaan: tutors.jadwalKetersediaan
        })
        .from(tutors)
        .innerJoin(users, eq(tutors.userId, users.id))
        .where(eq(tutors.id, id))
        .limit(1);

    if (tutorData.length === 0) return null;

    const tutorReviews = await db
        .select({
            id: reviews.id,
            rating: reviews.rating,
            comment: reviews.comment,
            createdAt: reviews.createdAt,
            studentName: users.fullname
        })
        .from(reviews)
        .innerJoin(students, eq(reviews.studentId, students.id))
        .innerJoin(users, eq(students.userId, users.id))
        .where(eq(reviews.tutorId, id))
        .orderBy(reviews.createdAt);

    return { ...tutorData[0], reviews: tutorReviews };
}

export default async function TutorProfilePage(
    props: {
        params: Promise<{ id: string }>;
    }
) {
    const params = await props.params;
    const tutorId = parseInt(params.id);
    if (isNaN(tutorId)) notFound();

    const tutor = await getTutor(tutorId);
    if (!tutor) notFound();

    return (
        <div className="container mx-auto py-10 px-4 md:px-6">
            <div className="grid gap-6 md:grid-cols-[300px_1fr]">
                <div className="space-y-6">
                    <Card>
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <Avatar className="w-32 h-32 mb-4">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${tutor.fullname}`} />
                                <AvatarFallback>{tutor.fullname[0]}</AvatarFallback>
                            </Avatar>
                            <h1 className="text-2xl font-bold">{tutor.fullname}</h1>
                            <p className="text-muted-foreground">{tutor.specialization}</p>
                            <div className="flex items-center mt-2 text-yellow-600">
                                <Star className="w-4 h-4 fill-current mr-1" />
                                <span className="font-semibold">{tutor.averageRating}</span>
                                <span className="text-muted-foreground ml-1">({tutor.reviews.length} reviews)</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Availability</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Hourly Rate</span>
                                    <span className="font-semibold">Rp {parseFloat(tutor.hourlyRate || '0').toLocaleString('id-ID')}</span>
                                </div>
                                <BookingModal
                                    tutorId={tutor.id}
                                    tutorName={tutor.fullname}
                                    hourlyRate={tutor.hourlyRate || '0'}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>About Me</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground whitespace-pre-line">{tutor.bio || "No bio available."}</p>
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div className="flex items-center">
                                    <Clock className="w-5 h-5 mr-2 text-primary" />
                                    <div>
                                        <p className="font-medium">Experience</p>
                                        <p className="text-sm text-muted-foreground">{tutor.experienceYears} Years</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <BookOpen className="w-5 h-5 mr-2 text-primary" />
                                    <div>
                                        <p className="font-medium">Sessions</p>
                                        <p className="text-sm text-muted-foreground">{tutor.totalSessions} Completed</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Reviews</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {tutor.reviews.length === 0 ? (
                                <p className="text-muted-foreground">No reviews yet.</p>
                            ) : (
                                tutor.reviews.map((review) => (
                                    <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-semibold">{review.studentName}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                                            </span>
                                        </div>
                                        <div className="flex items-center mb-2">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-3 h-3 ${i < (review.rating || 0) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-sm text-gray-600">{review.comment}</p>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
