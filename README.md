<div align="center"><strong>Next.js 15 Admin Dashboard Template</strong></div>
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

- Framework - [Next.js (App Router)](https://nextjs.org)
- Language - [TypeScript](https://www.typescriptlang.org)
- Auth - [Auth.js](https://authjs.dev)
- Database - [Postgres](https://vercel.com/postgres)
- Deployment - [Vercel](https://vercel.com/docs/concepts/next.js/overview)
- Styling - [Tailwind CSS](https://tailwindcss.com)
- Components - [Shadcn UI](https://ui.shadcn.com/)
- Analytics - [Vercel Analytics](https://vercel.com/analytics)
- Formatting - [Prettier](https://prettier.io)

This template uses the new Next.js App Router. This includes support for enhanced layouts, colocation of components, tests, and styles, component-level data fetching, and more.

## API Routes

The project exposes several API endpoints under `/api/*`. Below is a short summary of the current routes and their primary capabilities.

- `GET/POST /api/auth` - Auth.js handlers (sign in, callback, session, etc.).
- `POST /api/auth/register` - Register a new user (roles: `student`, `tutor`, `admin`).
- `GET/POST /api/bookings` - Create a booking (POST, students) and list bookings for the current user (GET).
- `PUT /api/bookings/[id]` - Update a booking (tutors may confirm/complete; students may cancel).
- `GET /api/notifications` - List recent notifications for the authenticated user.
- `PUT /api/notifications/[id]/read` - Mark a notification as read (authenticated user ownership required).
- `POST /api/reviews` - Create a review for a completed booking (students only).
- `GET /api/tutors` - Search/list approved tutors (supports query params).
- `GET /api/tutors/[id]` - Get tutor details and reviews.
- `POST /api/tutors/documents` - Upload CV/certificate files for tutor profiles (tutors only).
- `GET /api/admin/tutors` - Admin-only: list tutors and their verification status.
- `PUT /api/admin/tutors/[id]/verify` - Admin-only: change a tutor's verification status (`approved`, `rejected`, `pending`).
- `GET /api/seed` - Seed endpoint removed/neutralized; it currently returns a harmless JSON message and is not used for demo product seeding.

Most endpoints require authentication and enforce role-based access (student/tutor/admin) where appropriate. Check the corresponding route files under `app/api/` for exact request/response shapes and validation (Zod schemas are used in some routes).

## Getting Started

During the deployment, Vercel will prompt you to create a new Postgres database. This will add the necessary environment variables to your project.

Inside the Vercel Postgres dashboard, create a table based on the schema defined in this repository.
Inside the Vercel Postgres dashboard, create any tables your application requires and add the necessary environment variables to your project.

Next, copy the `.env.example` file to `.env` and update the values. Follow the instructions in the `.env.example` file to set up your GitHub OAuth application.

```bash
npm i -g vercel
vercel link
vercel env pull
```

Finally, run the following commands to start the development server:

```
pnpm install
pnpm dev
```

You should now be able to access the application at http://localhost:3000.

## Testing accounts

Student: 
- Email: student@example.com
- Password: f8ZdYc6fsNPYOBnS

Tutor: 
- Email: tutor@example.com
- Password: f8ZdYc6fsNPYOBnS

Admin: 
- Email: admin@example.com
- Password: f8ZdYc6fsNPYOBnS