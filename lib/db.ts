import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import {
  pgTable,
  text,
  numeric,
  integer,
  timestamp,
  pgEnum,
  serial,
  varchar,
  boolean,
  json,
  decimal,
  index
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

const client = postgres(process.env.POSTGRES_URL!);
export const db = drizzle(client);

// Enums
export const rolesEnum = pgEnum('roles', ['admin', 'tutor', 'student']);
export const verificationStatusEnum = pgEnum('verification_statuses', [
  'pending',
  'approved',
  'rejected'
]);
export const bookingStatusEnum = pgEnum('booking_statuses', [
  'pending',
  'confirmed',
  'completed',
  'cancelled'
]);

// Tables
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: rolesEnum('role').notNull(),
  fullname: varchar('fullname', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const tutors = pgTable(
  'tutors',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .unique()
      .references(() => users.id),
    bio: text('bio'),
    specialization: varchar('specialization', { length: 255 }),
    experienceYears: integer('experience_years'),
    verificationStatus: verificationStatusEnum('verification_status').default(
      'pending'
    ),
    cvFilePath: varchar('cv_file_path', { length: 500 }),
    certificateFilePaths: json('certificate_file_paths').$type<string[]>(),
    hourlyRate: decimal('hourly_rate', { precision: 10, scale: 2 }),
    averageRating: decimal('average_rating', { precision: 3, scale: 2 }).default(
      '0.00'
    ),
    totalSessions: integer('total_sessions').default(0),
    jadwalKetersediaan: json('jadwal_ketersediaan'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
  },
  (table) => ({
    idxSpecialization: index('idx_specialization').on(table.specialization),
    idxVerification: index('idx_verification').on(table.verificationStatus)
  })
);

export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .unique()
    .references(() => users.id),
  educationLevel: varchar('education_level', { length: 100 }),
  interests: text('interests'),
  createdAt: timestamp('created_at').defaultNow()
});

export const bookings = pgTable(
  'bookings',
  {
    id: serial('id').primaryKey(),
    studentId: integer('student_id')
      .notNull()
      .references(() => students.id),
    tutorId: integer('tutor_id')
      .notNull()
      .references(() => tutors.id),
    subject: varchar('subject', { length: 255 }).notNull(),
    sessionDate: timestamp('session_date').notNull(),
    durationMinutes: integer('duration_minutes').default(60),
    status: bookingStatusEnum('status').default('pending'),
    notes: text('notes'),
    version: integer('version').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
  },
  (table) => ({
    idxStudent: index('idx_student').on(table.studentId),
    idxTutor: index('idx_tutor').on(table.tutorId),
    idxDate: index('idx_date').on(table.sessionDate),
    idxStatus: index('idx_status').on(table.status)
  })
);

export const reviews = pgTable(
  'reviews',
  {
    id: serial('id').primaryKey(),
    bookingId: integer('booking_id')
      .notNull()
      .unique()
      .references(() => bookings.id),
    studentId: integer('student_id')
      .notNull()
      .references(() => students.id),
    tutorId: integer('tutor_id')
      .notNull()
      .references(() => tutors.id),
    rating: integer('rating'),
    comment: text('comment'),
    createdAt: timestamp('created_at').defaultNow()
  },
  (table) => ({
    idxTutorReview: index('idx_tutor_review').on(table.tutorId)
  })
);

export const notifications = pgTable(
  'notifications',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id),
    type: varchar('type', { length: 50 }),
    message: text('message'),
    isRead: boolean('is_read').default(false),
    createdAt: timestamp('created_at').defaultNow()
  },
  (table) => ({
    idxUser: index('idx_user').on(table.userId),
    idxType: index('idx_type').on(table.type)
  })
);

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  tutorProfile: one(tutors, {
    fields: [users.id],
    references: [tutors.userId]
  }),
  studentProfile: one(students, {
    fields: [users.id],
    references: [students.userId]
  })
}));

export const tutorsRelations = relations(tutors, ({ one, many }) => ({
  user: one(users, {
    fields: [tutors.userId],
    references: [users.id]
  }),
  bookings: many(bookings),
  reviews: many(reviews)
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id]
  }),
  bookings: many(bookings),
  reviews: many(reviews)
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  student: one(students, {
    fields: [bookings.studentId],
    references: [students.id]
  }),
  tutor: one(tutors, {
    fields: [bookings.tutorId],
    references: [tutors.id]
  }),
  review: one(reviews, {
    fields: [bookings.id],
    references: [reviews.bookingId]
  })
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id]
  }),
  student: one(students, {
    fields: [reviews.studentId],
    references: [students.id]
  }),
  tutor: one(tutors, {
    fields: [reviews.tutorId],
    references: [tutors.id]
  })
}));
