import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, BookOpen } from 'lucide-react';

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Join TutorGo</h1>
                <p className="text-gray-500">Choose how you want to use our platform</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl w-full">
                <Link href="/register/form?role=student" className="block group">
                    <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-primary/50 cursor-pointer">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                            <CardTitle className="text-xl">I want to learn</CardTitle>
                            <CardDescription>
                                Find expert tutors to help you master new skills and subjects
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="text-sm text-gray-500 space-y-2">
                                <li className="flex items-center">
                                    <span className="mr-2">✓</span> Browse qualified tutors
                                </li>
                                <li className="flex items-center">
                                    <span className="mr-2">✓</span> Schedule sessions easily
                                </li>
                                <li className="flex items-center">
                                    <span className="mr-2">✓</span> Track your progress
                                </li>
                            </ul>
                            <Button className="w-full mt-6" variant="outline">Join as Student</Button>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/register/form?role=tutor" className="block group">
                    <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-primary/50 cursor-pointer">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                                <GraduationCap className="w-6 h-6 text-green-600" />
                            </div>
                            <CardTitle className="text-xl">I want to teach</CardTitle>
                            <CardDescription>
                                Share your knowledge and earn money by tutoring students
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="text-sm text-gray-500 space-y-2">
                                <li className="flex items-center">
                                    <span className="mr-2">✓</span> Set your own rates
                                </li>
                                <li className="flex items-center">
                                    <span className="mr-2">✓</span> Manage your schedule
                                </li>
                                <li className="flex items-center">
                                    <span className="mr-2">✓</span> Build your reputation
                                </li>
                            </ul>
                            <Button className="w-full mt-6" variant="outline">Join as Tutor</Button>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline font-medium">
                    Sign in
                </Link>
            </div>
        </div>
    );
}
