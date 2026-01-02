'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface DashboardBookingActionsProps {
    bookingId: number;
}

export function DashboardBookingActions({ bookingId }: DashboardBookingActionsProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    async function handleAction(status: 'confirmed' | 'cancelled') {
        setLoading(true);
        try {
            const response = await fetch(`/api/bookings/${bookingId}`, {
                method: 'PUT',
                body: JSON.stringify({ status }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update booking');
            }

            toast({
                title: status === 'confirmed' ? 'Booking Accepted' : 'Booking Rejected',
                description: `The booking has been ${status}.`,
                variant: status === 'confirmed' ? 'default' : 'destructive',
            });

            router.refresh();
        } catch (error) {
            console.error(error);
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Something went wrong',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex gap-2 mt-2">
            <Button
                size="sm"
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => handleAction('confirmed')}
                disabled={loading}
            >
                Accept
            </Button>
            <Button
                size="sm"
                variant="outline"
                className="w-full text-red-600 hover:bg-red-50 border-red-200"
                onClick={() => handleAction('cancelled')}
                disabled={loading}
            >
                Reject
            </Button>
        </div>
    );
}
