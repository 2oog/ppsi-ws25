'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

export function VerificationForm({ currentStatus }: { currentStatus: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);

        const formData = new FormData(event.currentTarget);

        try {
            const res = await fetch('/api/tutors/documents', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Upload failed');

            alert('Documents uploaded successfully!');
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Failed to upload documents');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Verification Documents</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <span className="font-medium">Current Status: </span>
                    <span className={`capitalize ${currentStatus === 'approved' ? 'text-green-600' :
                            currentStatus === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                        {currentStatus}
                    </span>
                </div>

                {currentStatus !== 'approved' && (
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="cv">Curriculum Vitae (PDF)</Label>
                            <Input id="cv" name="cv" type="file" accept=".pdf" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="certificate">Certificate / Diploma (PDF/Image)</Label>
                            <Input id="certificate" name="certificate" type="file" accept=".pdf,image/*" required />
                        </div>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Uploading...' : 'Upload Documents'}
                        </Button>
                    </form>
                )}
            </CardContent>
        </Card>
    );
}
