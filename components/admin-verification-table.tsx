'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText } from 'lucide-react';

interface Tutor {
    id: number;
    fullname: string;
    email: string;
    specialization: string | null;
    verificationStatus: string | null;
    cvFilePath: string | null;
    certificateFilePath: string | null;
    createdAt: string;
}

export function AdminVerificationTable({ tutors }: { tutors: Tutor[] }) {
    const router = useRouter();

    async function updateStatus(id: number, status: string) {
        try {
            await fetch(`/api/admin/tutors/${id}/verify`, {
                method: 'PUT',
                body: JSON.stringify({ status }),
                headers: { 'Content-Type': 'application/json' }
            });
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Failed to update status');
        }
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Specialization</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Documents</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tutors.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center">
                                No tutors found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        tutors.map((tutor) => (
                            <TableRow key={tutor.id}>
                                <TableCell>
                                    <div className="font-medium">{tutor.fullname}</div>
                                    <div className="text-sm text-muted-foreground">{tutor.email}</div>
                                </TableCell>
                                <TableCell>{tutor.specialization || '-'}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        tutor.verificationStatus === 'approved' ? 'default' :
                                            tutor.verificationStatus === 'rejected' ? 'destructive' : 'secondary'
                                    }>
                                        {tutor.verificationStatus}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        {tutor.cvFilePath ? (
                                            <Link href={tutor.cvFilePath} target="_blank" className="text-blue-600 hover:underline flex items-center">
                                                <FileText className="w-4 h-4 mr-1" /> CV
                                            </Link>
                                        ) : <span className="text-muted-foreground text-sm">No CV</span>}
                                        {tutor.certificateFilePath ? (
                                            <Link href={tutor.certificateFilePath} target="_blank" className="text-blue-600 hover:underline flex items-center">
                                                <FileText className="w-4 h-4 mr-1" /> Cert
                                            </Link>
                                        ) : <span className="text-muted-foreground text-sm">No Cert</span>}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    {tutor.verificationStatus === 'pending' && (
                                        <>
                                            <Button size="sm" variant="outline" onClick={() => updateStatus(tutor.id, 'rejected')}>
                                                Reject
                                            </Button>
                                            <Button size="sm" onClick={() => updateStatus(tutor.id, 'approved')}>
                                                Approve
                                            </Button>
                                        </>
                                    )}
                                    {tutor.verificationStatus !== 'pending' && (
                                        <Button size="sm" variant="ghost" onClick={() => updateStatus(tutor.id, 'pending')}>
                                            Reset
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
