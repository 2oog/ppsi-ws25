'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ReviewModal } from '@/components/review-modal';

interface Booking {
    id: number;
    subject: string;
    sessionDate: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    tutorName?: string;
    studentName?: string;
}

interface BookingListProps {
    bookings: Booking[];
    role: 'student' | 'tutor';
}

export function BookingList({ bookings, role }: BookingListProps) {
    const router = useRouter();

    async function updateStatus(id: number, status: string) {
        try {
            await fetch(`/api/bookings/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ status }),
                headers: { 'Content-Type': 'application/json' }
            });
            router.refresh();
        } catch (error) {
            console.error(error);
        }
    }

    if (bookings.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                No bookings found.
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {bookings.map((booking) => (
                <Card key={booking.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-medium">
                            {booking.subject}
                        </CardTitle>
                        <Badge variant={
                            booking.status === 'confirmed' ? 'default' :
                                booking.status === 'pending' ? 'secondary' :
                                    booking.status === 'cancelled' ? 'destructive' : 'outline'
                        }>
                            {booking.status}
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground mb-4">
                            <p>With: {role === 'student' ? booking.tutorName : booking.studentName}</p>
                            <p>Date: {new Date(booking.sessionDate).toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2 justify-end">
                            {role === 'tutor' && booking.status === 'pending' && (
                                <>
                                    <Button size="sm" variant="outline" onClick={() => updateStatus(booking.id, 'cancelled')}>
                                        Reject
                                    </Button>
                                    <Button size="sm" onClick={() => updateStatus(booking.id, 'confirmed')}>
                                        Accept
                                    </Button>
                                </>
                            )}
                            {role === 'tutor' && booking.status === 'confirmed' && (
                                <Button size="sm" onClick={() => updateStatus(booking.id, 'completed')}>
                                    Mark Completed
                                </Button>
                            )}
                            {role === 'student' && booking.status === 'pending' && (
                                <Button size="sm" variant="destructive" onClick={() => updateStatus(booking.id, 'cancelled')}>
                                    Cancel
                                </Button>
                            )}
                            {role === 'student' && booking.status === 'completed' && (
                                <ReviewModal bookingId={booking.id} tutorName={booking.tutorName || 'Tutor'} />
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
