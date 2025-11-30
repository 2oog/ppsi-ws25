import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn } from '@/lib/auth';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex justify-center items-center p-8 bg-gray-50">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Login to access your TutorGo dashboard
          </CardDescription>
        </CardHeader>
        <form
          action={async (formData) => {
            'use server';
            await signIn('credentials', {
              redirectTo: '/dashboard',
              ...Object.fromEntries(formData)
            });
          }}
        >
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@domain.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button className="w-full">Sign in</Button>
            <Link href="/register" className="w-full">
              <Button variant="outline" className="w-full">
                Register
              </Button>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
