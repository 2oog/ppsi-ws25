import Link from 'next/link';
import {
  Home,
  LineChart,
  Package,
  Package2,
  PanelLeft,
  Settings,
  ShoppingCart,
  Users2,
  BookOpen,
  Calendar,
  FileText,
  UserCheck,
  Search
} from 'lucide-react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Analytics } from '@vercel/analytics/react';
import { User } from './user';
import { VercelLogo } from '@/components/icons';
import Providers from './providers';
import { NavItem } from './nav-item';
import { SearchInput } from './search';
import { auth } from '@/lib/auth';
import { NotificationBell } from '@/components/notification-bell';

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user?.role;

  return (
    <Providers>
      <main className="flex min-h-screen w-full flex-col bg-muted/40">
        <DesktopNav role={role} />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <MobileNav role={role} />
            <DashboardBreadcrumb />
            <div className="ml-auto flex items-center gap-2">
              <NotificationBell />
              <User />
            </div>
          </header>
          <main className="grid flex-1 items-start gap-2 p-4 sm:px-6 sm:py-0 md:gap-4 bg-muted/40">
            {children}
          </main>
        </div>
        <Analytics />
      </main>
    </Providers>
  );
}

function DesktopNav({ role }: { role?: string }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="/dashboard"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <VercelLogo className="h-3 w-3 transition-all group-hover:scale-110" />
          <span className="sr-only">TutorGo</span>
        </Link>

        <NavItem href="/dashboard" label="Dashboard">
          <Home className="h-5 w-5" />
        </NavItem>

        {role === 'student' && (
          <>
            <NavItem href="/dashboard/student/search" label="Find Tutors">
              <Search className="h-5 w-5" />
            </NavItem>
            <NavItem href="/dashboard/student/bookings" label="My Bookings">
              <Calendar className="h-5 w-5" />
            </NavItem>
            <NavItem href="/dashboard/student/profile" label="Profile">
              <UserCheck className="h-5 w-5" />
            </NavItem>
          </>
        )}

        {role === 'tutor' && (
          <>
            <NavItem href="/dashboard/tutor/schedule" label="Schedule">
              <Calendar className="h-5 w-5" />
            </NavItem>
            <NavItem href="/dashboard/tutor/profile" label="Profile">
              <UserCheck className="h-5 w-5" />
            </NavItem>
          </>
        )}

        {role === 'admin' && (
          <>
            <NavItem href="/dashboard/admin/verification" label="Verification">
              <UserCheck className="h-5 w-5" />
            </NavItem>
            <NavItem href="/dashboard/admin/users" label="Users">
              <Users2 className="h-5 w-5" />
            </NavItem>
          </>
        )}

      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>
      </nav>
    </aside>
  );
}

function MobileNav({ role }: { role?: string }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs">
        <nav className="grid gap-6 text-lg font-medium">
          <Link
            href="#"
            className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
          >
            <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">TutorGo</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <Home className="h-5 w-5" />
            Dashboard
          </Link>

          {role === 'student' && (
            <>
              <Link href="/dashboard/student/search" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                <BookOpen className="h-5 w-5" />
                Find Tutors
              </Link>
              <Link href="/dashboard/student/bookings" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                <Calendar className="h-5 w-5" />
                My Bookings
              </Link>
              <Link href="/dashboard/student/profile" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                <UserCheck className="h-5 w-5" />
                Profile
              </Link>
            </>
          )}

          {role === 'tutor' && (
            <>
              <Link href="/dashboard/tutor/schedule" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                <Calendar className="h-5 w-5" />
                Schedule
              </Link>
              <Link href="/dashboard/tutor/profile" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                <UserCheck className="h-5 w-5" />
                Profile
              </Link>
            </>
          )}

          {role === 'admin' && (
            <>
              <Link href="/dashboard/admin/verification" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                <UserCheck className="h-5 w-5" />
                Verification
              </Link>
              <Link href="/dashboard/admin/users" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                <Users2 className="h-5 w-5" />
                Users
              </Link>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function DashboardBreadcrumb() {
  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard">Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
