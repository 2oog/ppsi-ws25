'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';

interface BookingModalProps {
    tutorId: number;
    tutorName: string;
    hourlyRate: string;
}

export function BookingModal({ tutorId, tutorName, hourlyRate }: BookingModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);

        const formData = new FormData(event.currentTarget);
        const data = {
            tutorId,
            subject: formData.get('subject'),
            sessionDate: new Date(formData.get('date') as string).toISOString(),
            durationMinutes: 60, // Fixed for now
            notes: formData.get('notes')
        };

        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            });

            if (!res.ok) throw new Error('Failed to book');

            setOpen(false);
            router.push('/dashboard/student/bookings');
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Failed to create booking');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full mt-4">Book Session</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Book Session with {tutorName}</DialogTitle>
                    <DialogDescription>
                        Rate: Rp {parseFloat(hourlyRate).toLocaleString('id-ID')} / hour
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input id="subject" name="subject" required placeholder="e.g. Calculus 1" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="date">Date & Time</Label>
                            <Input id="date" name="date" type="datetime-local" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea id="notes" name="notes" placeholder="Topics to cover..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Booking...' : 'Confirm Booking'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
