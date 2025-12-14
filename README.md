<div align="center"><strong>Next.js 16 Admin Dashboard Template</strong></div>
<div align="center">Built with the Next.js App Router</div>
<br />
<div align="center">
<a href="https://next-admin-dash.vercel.app/">Demo</a>
<span> · </span>
<a href="https://vercel.com/templates/next.js/admin-dashboard-tailwind-postgres-react-nextjs">Clone & Deploy</a>
<span>
</div>

## Overview

This is a starter template using the following stack:

- Framework - [Next.js 16 (App Router)](https://nextjs.org)
- Language - [TypeScript](https://www.typescriptlang.org)
- Auth - [NextAuth.js v5](https://authjs.dev)
- Database - [Postgres](https://vercel.com/postgres)
- ORM - [Drizzle ORM](https://orm.drizzle.team)
- Deployment - [Vercel](https://vercel.com/docs/concepts/next.js/overview)
- Styling - [Tailwind CSS](https://tailwindcss.com)
- Components - [Shadcn UI](https://ui.shadcn.com/)
- Analytics - [Vercel Analytics](https://vercel.com/analytics)
- Formatting - [Prettier](https://prettier.io)

This template uses the new Next.js App Router. This includes support for enhanced layouts, colocation of components, tests, and styles, component-level data fetching, and more.

## API Routes

The project exposes several API endpoints under `/api/*`. Below is a short summary of the current routes and their primary capabilities.

### Authentication

- `GET/POST /api/auth/*` - NextAuth.js handlers (sign in, callback, session, etc.).
- `POST /api/auth/register` - Register a new user (roles: `student`, `tutor`).

### Bookings

- `GET/POST /api/bookings` - Create a booking (POST, students) and list bookings (GET).
- `PUT /api/bookings/[id]` - Update a booking status (confirm/complete/cancel).

### Tutors

- `GET /api/tutors` - Search/list approved tutors (supports query params).
- `GET /api/tutors/[id]` - Get tutor details and reviews.
- `POST /api/tutors/documents` - Upload CV/certificate files for tutor profiles.

### Reviews

- `POST /api/reviews` - Create a review for a completed booking (students only).

### Notifications

- `GET /api/notifications` - List recent notifications.
- `PUT /api/notifications/[id]/read` - Mark a notification as read.

### Admin

- `GET /api/admin/tutors` - List tutors and their verification status.
- `PUT /api/admin/tutors/[id]/verify` - Change a tutor's verification status (`approved`, `rejected`, `pending`).

Most endpoints require authentication and enforce role-based access. Zod schemas are used for validation.

## Getting Started

### Prerequisites

- Node.js
- pnpm

### Setup

1. Copy the `.env.example` file to `.env.local` and update the values.

```bash
cp .env.example .env.local
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up the database:

This project uses Drizzle ORM. You can generate migrations and push them to your database.

```bash
# Generate migrations
pnpm db:generate

# Push schema changes to the database
pnpm db:push
```

4. Start the development server:

```bash
pnpm dev
# or
pnpm dev --turbopack
```

You should now be able to access the application at <http://localhost:3000>.

## Testing accounts

Student:

- Email: <student@example.com>
- Password: f8ZdYc6fsNPYOBnS

Tutor:

- Email: <tutor@example.com>
- Password: f8ZdYc6fsNPYOBnS

Admin:

- Email: <admin@example.com>
- Password: f8ZdYc6fsNPYOBnS

## Features status

### Site-wide Features

- [ ] **app/layout.tsx**: Update metadata with proper SEO tags (title, description, OG tags)
- [x] **Authentication Flows**:
  - [x] Email-based login flow (`/login`)
  - [x] Registration flow (`/register`)
- [x] **Notifications**:
  - [x] Email notifications
  - [x] In-app notifications related to bookings and verification

### Role-Specific Uses

#### Student

- [x] Dashboard: `/dashboard/student`
- [x] Find a Tutor: `/dashboard/student/search`
- [x] Bookings management
- [ ] Advanced search filters

#### Tutor

- [x] Dashboard: `/dashboard/tutor`
- [x] Profile management: `/dashboard/tutor/profile`
- [x] Schedule management
- [x] Booking requests management
- [x] Document upload for verification

#### Admin

- [x] Dashboard: `/dashboard/admin`
- [x] Tutor verification queue: `/dashboard/admin/verification`
- [ ] User management interface
- [ ] Platform activity metrics

## Project Structure

- `app/` - Next.js App Router pages and API routes
- `components/` - Reusable UI components (shadcn/ui)
- `lib/` - Utility functions and database configuration (`db.ts`)
- `drizzle/` - Drizzle ORM migrations and schema artifacts
- `types/` - TypeScript type definitions

## Deployment

Deploy easily to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vercel/next.js/tree/canary/examples/admin-dashboard&project-name=admin-dashboard&repository-name=admin-dashboard)
