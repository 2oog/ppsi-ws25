
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db, users, students, reports } from '@/lib/db';
import { eq, desc, count } from 'drizzle-orm';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserActions } from '@/components/admin/user-actions';

export default async function UserManagementPage() {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
        redirect('/dashboard');
    }

    // Fetch Admins
    const adminUsers = await db
        .select()
        .from(users)
        .where(eq(users.role, 'admin'));

    // Fetch Students with Review Counts
    // Note: Drizzle's relational query might be cleaner here, but let's stick to simple select for now or use query builder
    const studentUsers = await db.query.users.findMany({
        where: eq(users.role, 'student'),
        with: {
            studentProfile: {
                with: {
                    reviews: true // Get all reviews to count them
                }
            }
        }
    });

    // Fetch Tutors with Review Counts
    const tutorUsers = await db.query.users.findMany({
        where: eq(users.role, 'tutor'),
        with: {
            tutorProfile: {
                with: {
                    reviews: true
                }
            }
        }
    });

    // Fetch Reports
    const allReports = await db.query.reports.findMany({
        with: {
            reporter: true,
            reported: true
        },
        orderBy: [desc(reports.createdAt)]
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                <p className="text-muted-foreground">
                    Manage system administrators, students, and handle reports.
                </p>
            </div>

            <Tabs defaultValue="admins" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="admins">Admins</TabsTrigger>
                    <TabsTrigger value="tutors">Tutors</TabsTrigger>
                    <TabsTrigger value="students">Students</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="admins">
                    <Card>
                        <CardHeader>
                            <CardTitle>Administrators</CardTitle>
                            <CardDescription>
                                List of all users with administrative privileges.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {adminUsers.map((admin) => (
                                        <TableRow key={admin.id}>
                                            <TableCell className="font-medium">
                                                {admin.fullname}
                                            </TableCell>
                                            <TableCell>{admin.email}</TableCell>
                                            <TableCell>
                                                {admin.createdAt?.toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                {admin.banned && <Badge variant="destructive">Banned</Badge>}
                                            </TableCell>
                                            <TableCell>
                                                <UserActions userId={admin.id} isBanned={admin.banned} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {adminUsers.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground">No admins found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tutors">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tutors</CardTitle>
                            <CardDescription>
                                List of all registered tutors and their activity.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Specialization</TableHead>
                                        <TableHead>Experience</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tutorUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">
                                                {user.fullname}
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                {user.tutorProfile?.specialization || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {user.tutorProfile?.experienceYears ? `${user.tutorProfile.experienceYears} years` : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {user.createdAt?.toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                {user.banned && <Badge variant="destructive">Banned</Badge>}
                                            </TableCell>
                                            <TableCell>
                                                <UserActions userId={user.id} isBanned={user.banned} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {tutorUsers.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center text-muted-foreground">No tutors found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="students">
                    <Card>
                        <CardHeader>
                            <CardTitle>Students</CardTitle>
                            <CardDescription>
                                List of all registered students and their activity.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Education Level</TableHead>
                                        <TableHead>Reviews Made</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {studentUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">
                                                {user.fullname}
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                {user.studentProfile?.educationLevel || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {user.studentProfile?.reviews?.length || 0}
                                            </TableCell>
                                            <TableCell>
                                                {user.createdAt?.toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                {user.banned && <Badge variant="destructive">Banned</Badge>}
                                            </TableCell>
                                            <TableCell>
                                                <UserActions userId={user.id} isBanned={user.banned} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {studentUsers.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground">No students found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="reports">
                    <Card>
                        <CardHeader>
                            <CardTitle>Reports</CardTitle>
                            <CardDescription>
                                User reports requiring attention.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Reporter</TableHead>
                                        <TableHead>Reported User</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allReports.map((report) => (
                                        <TableRow key={report.id}>
                                            <TableCell>
                                                <Badge variant={report.status === 'pending' ? 'destructive' : 'outline'}>
                                                    {report.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {report.reporter?.fullname}
                                            </TableCell>
                                            <TableCell>
                                                {report.reported?.fullname}
                                            </TableCell>
                                            <TableCell>{report.reason}</TableCell>
                                            <TableCell>
                                                {report.createdAt?.toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {allReports.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground">No reports found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
