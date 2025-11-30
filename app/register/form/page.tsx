'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'student';

    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        specialization: '',
    });
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [certFiles, setCertFiles] = useState<File[]>([]);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (fieldErrors[e.target.name]) {
            setFieldErrors({ ...fieldErrors, [e.target.name]: [] });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            if (e.target.name === 'cv') {
                const file = e.target.files[0];
                if (file.size > 2 * 1024 * 1024) {
                    setError('CV file size must be less than 2MB');
                    return;
                }
                setCvFile(file);
            } else if (e.target.name === 'certificates') {
                const files = Array.from(e.target.files);
                const validFiles = files.filter(f => f.size <= 2 * 1024 * 1024);
                if (validFiles.length !== files.length) {
                    setError('Some certificate files were skipped because they exceed 2MB');
                }
                setCertFiles(validFiles);
            }
        }
    };

    const uploadFiles = async () => {
        const uploadFormData = new FormData();
        if (cvFile) uploadFormData.append('files', cvFile);
        certFiles.forEach(file => uploadFormData.append('files', file));

        if (cvFile || certFiles.length > 0) {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadFormData,
            });
            if (!res.ok) throw new Error('File upload failed');
            return await res.json();
        }
        return { paths: [] };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            let cvFilePath = '';
            let certificateFilePaths: string[] = [];

            if (role === 'tutor') {
                if (!cvFile) {
                    setError('CV is required for tutors');
                    setLoading(false);
                    return;
                }

                const uploadResult = await uploadFiles();
                const paths = uploadResult.paths;

                // Assuming the order is preserved: CV first, then certificates
                if (cvFile) {
                    cvFilePath = paths[0];
                    certificateFilePaths = paths.slice(1);
                } else {
                    certificateFilePaths = paths;
                }
            }

            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullname: formData.fullname,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                    role: role,
                    specialization: formData.specialization,
                    cvFilePath,
                    certificateFilePaths
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.fieldErrors) {
                    setFieldErrors(data.fieldErrors);
                    if (data.error) setError(data.error);
                } else {
                    throw new Error(data.error || 'Registration failed');
                }
                return;
            }

            router.push('/login?registered=true');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md shadow-lg my-8">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                    Create {role === 'tutor' ? 'Tutor' : 'Student'} Account
                </CardTitle>
                <CardDescription className="text-center">
                    Enter your details to get started
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="grid gap-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="fullname">Full Name</Label>
                        <Input
                            id="fullname"
                            name="fullname"
                            placeholder="John Doe"
                            required
                            value={formData.fullname}
                            onChange={handleChange}
                            className={fieldErrors.fullname ? 'border-red-500' : ''}
                        />
                        {fieldErrors.fullname && (
                            <p className="text-sm text-red-500">{fieldErrors.fullname[0]}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="name@example.com"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className={fieldErrors.email ? 'border-red-500' : ''}
                        />
                        {fieldErrors.email && (
                            <p className="text-sm text-red-500">{fieldErrors.email[0]}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="08123456789"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            className={fieldErrors.phone ? 'border-red-500' : ''}
                        />
                        {fieldErrors.phone && (
                            <p className="text-sm text-red-500">{fieldErrors.phone[0]}</p>
                        )}
                    </div>

                    {role === 'tutor' && (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="specialization">Specialization</Label>
                                <Input
                                    id="specialization"
                                    name="specialization"
                                    placeholder="Mathematics, Physics, etc."
                                    required
                                    value={formData.specialization}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="cv">CV (PDF, max 2MB)</Label>
                                <Input
                                    id="cv"
                                    name="cv"
                                    type="file"
                                    accept=".pdf"
                                    required
                                    onChange={handleFileChange}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="certificates">Certificates (PDF, max 2MB each)</Label>
                                <Input
                                    id="certificates"
                                    name="certificates"
                                    type="file"
                                    accept=".pdf"
                                    multiple
                                    onChange={handleFileChange}
                                />
                            </div>
                        </>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className={fieldErrors.password ? 'border-red-500' : ''}
                        />
                        {fieldErrors.password && (
                            <p className="text-sm text-red-500">{fieldErrors.password[0]}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button className="w-full" type="submit" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Register'}
                    </Button>
                    <div className="text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:underline">
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}

export default function RegisterFormPage() {
    return (
        <div className="min-h-screen flex justify-center items-center p-4 bg-gray-50">
            <Suspense fallback={<div>Loading...</div>}>
                <RegisterForm />
            </Suspense>
        </div>
    );
}
