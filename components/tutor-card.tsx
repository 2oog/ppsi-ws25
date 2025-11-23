import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, BookOpen, Clock } from 'lucide-react';

interface Tutor {
    id: number;
    fullname: string;
    specialization: string;
    experienceYears: number;
    hourlyRate: string;
    averageRating: string;
    totalSessions: number;
}

export function TutorCard({ tutor }: { tutor: Tutor }) {
    return (
        <Card className="flex flex-col h-full">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl">{tutor.fullname}</CardTitle>
                        <p className="text-sm text-muted-foreground">{tutor.specialization}</p>
                    </div>
                    <div className="flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                        <Star className="w-3 h-3 mr-1 fill-yellow-500 text-yellow-500" />
                        {tutor.averageRating}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2" />
                    {tutor.experienceYears} years experience
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                    <BookOpen className="w-4 h-4 mr-2" />
                    {tutor.totalSessions} sessions completed
                </div>
                <div className="mt-4 font-semibold">
                    Rp {parseFloat(tutor.hourlyRate).toLocaleString('id-ID')} / hour
                </div>
            </CardContent>
            <CardFooter>
                <Link href={`/tutors/${tutor.id}`} className="w-full">
                    <Button className="w-full">View Profile</Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
