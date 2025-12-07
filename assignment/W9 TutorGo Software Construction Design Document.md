# LAPORAN SOFTWARE CONSTRUCTION TESTING

**Proyek:** Sistem Informasi TutorGo (Platform Pencarian & Pemesanan Tutor)

**Teknologi:** Next.js 15, TypeScript, PostgreSQL (Drizzle ORM), Tailwind CSS

**Tanggal:** 1 Desember 2025

**Versi:** 7

## Pendahuluan

Dokumen ini menjelaskan rancangan teknis (Software Construction Design) untuk sistem **TutorGo**, sebuah platform pembelajaran online yang menghubungkan siswa dengan tutor privat. Dokumen ini menjadi pedoman bagi tim pengembang dalam proses implementasi, pengujian, deployment, dan pemeliharaan sistem secara menyeluruh.

## Tujuan

Tujuan dari dokumen ini adalah untuk memberikan spesifikasi teknis yang rinci dari setiap modul, struktur data, algoritma, antarmuka API, mekanisme autentikasi, penanganan kesalahan, dan panduan testing pada sistem TutorGo. Dokumentasi ini memastikan bahwa seluruh tim memiliki pemahaman yang konsisten mengenai arsitektur dan implementasi sistem.

## Deskripsi Umum Sistem

**TutorGo** adalah platform pembelajaran berbasis web yang memfasilitasi:

- Pendaftaran dan autentikasi pengguna (Student, Tutor, Admin)
- Pencarian dan pemilihan tutor berdasarkan kriteria tertentu
- Proses booking session pembelajaran antara siswa dan tutor
- Manajemen jadwal dan ketersediaan tutor
- Review dan rating untuk tutor
- Verifikasi tutor oleh admin (dokumen CV dan sertifikat)
- Sistem notifikasi in-app untuk update booking dan aktivitas
- Dashboard role-based untuk setiap tipe pengguna

### Stack Teknologi

| Teknologi          | Deskripsi                    |
| ------------------ | ---------------------------- |
| **Framework**      | Next.js 15 (App Router)      |
| **Language**       | TypeScript                   |
| **Authentication** | Auth.js (NextAuth)           |
| **Database**       | PostgreSQL (Vercel Postgres) |
| **Styling**        | Tailwind CSS                 |
| **UI Components**  | Shadcn UI                    |
| **Deployment**     | Vercel                       |
| **Analytics**      | Vercel Analytics             |

## Arsitektur dan Modul

Sistem TutorGo menggunakan arsitektur **Next.js App Router** dengan pembagian modul berdasarkan fungsionalitas dan role pengguna.

| Modul                  | Deskripsi                                                                              |
| ---------------------- | -------------------------------------------------------------------------------------- |
| **AuthModule**         | Mengelola autentikasi, registrasi, dan session management menggunakan Auth.js          |
| **UserModule**         | Mengelola data pengguna (Student, Tutor, Admin) termasuk profil dan preferensi         |
| **BookingModule**      | Mengatur proses booking, konfirmasi, pembatalan, dan penyelesaian session pembelajaran |
| **TutorModule**        | Mengelola data tutor, specialization, experience, documents, dan rating                |
| **ReviewModule**       | Mengelola review dan rating dari siswa terhadap tutor                                  |
| **NotificationModule** | Mengirim dan mengelola notifikasi in-app untuk aktivitas sistem                        |
| **AdminModule**        | Modul khusus admin untuk verifikasi tutor, manajemen pengguna, dan monitoring platform |
| **SearchModule**       | Mengelola pencarian dan filtering tutor berdasarkan berbagai kriteria                  |
| **ScheduleModule**     | Mengelola jadwal dan availability tutor                                                |
| **DatabaseModule**     | Layer akses database PostgreSQL untuk semua operasi CRUD                               |

## Desain Kelas (Class Design)

Berikut adalah desain kelas utama dalam sistem TutorGo:

### User Class

```
+------------------+
|      User        |
+------------------+
| - id             |
| - email          |
| - password       |
| - name           |
| - role           |
| - createdAt      |
+------------------+
| + register()     |
| + login()        |
| + updateProfile()|
| + changePassword()|
+------------------+
```

### Student Class (extends User)

```
+----------------------+
|       Student        |
+----------------------+
| - userId             |
| - learningPreferences|
| - enrolledCourses    |
+----------------------+
| + searchTutors()     |
| + createBooking()    |
| + submitReview()     |
| + viewHistory()      |
+----------------------+
```

### Tutor Class (extends User)

```
+----------------------+
|        Tutor         |
+----------------------+
| - userId             |
| - bio                |
| - specialization     |
| - experience         |
| - hourlyRate         |
| - verificationStatus |
| - rating             |
| - cvUrl              |
| - certificateUrl     |
+----------------------+
| + updateProfile()    |
| + uploadDocuments()  |
| + manageSchedule()   |
| + acceptBooking()    |
| + rejectBooking()    |
| + completeSession()  |
+----------------------+
```

### Booking Class

```
+----------------------+
|       Booking        |
+----------------------+
| - id                 |
| - studentId          |
| - tutorId            |
| - subject            |
| - scheduledDate      |
| - duration           |
| - status             |
| - totalPrice         |
| - createdAt          |
+----------------------+
| + create()           |
| + confirm()          |
| + cancel()           |
| + complete()         |
| + getDetails()       |
+----------------------+
```

### Review Class

```
+----------------------+
|       Review         |
+----------------------+
| - id                 |
| - bookingId          |
| - studentId          |
| - tutorId            |
| - rating             |
| - comment            |
| - createdAt          |
+----------------------+
| + create()           |
| + update()           |
| + delete()           |
+----------------------+
```

### Notification Class

```
+----------------------+
|    Notification      |
+----------------------+
| - id                 |
| - userId             |
| - type               |
| - title              |
| - message            |
| - isRead             |
| - createdAt          |
+----------------------+
| + send()             |
| + markAsRead()       |
| + getUnreadCount()   |
+----------------------+
```

## Desain Algoritma dan Flowchart

### Flowchart Proses Booking Tutor

```
Start
↓
Student: Cari Tutor (subject, spesialisasi, rating)
↓
Sistem: Tampilkan List Tutor yang Tersedia
↓
Student: Pilih Tutor → Lihat Profil & Review
↓
Student: Isi Form Booking (tanggal, durasi, subject)
↓
Validasi Data Booking
→ (Data Tidak Valid) → Tampilkan Error → Kembali Input
↓
Simpan Booking ke Database (status: pending)
↓
Kirim Notifikasi ke Tutor
↓
Tutor: Review Booking Request
↓
Tutor: Terima/Tolak Booking?
→ (Tolak) → Update Status: rejected → Kirim Notifikasi ke Student → End
↓
(Terima) Update Status: confirmed
↓
Kirim Notifikasi Konfirmasi ke Student
↓
Session Berlangsung
↓
Tutor: Tandai Session Selesai (status: completed)
↓
Kirim Notifikasi ke Student untuk Review
↓
Student (Opsional): Submit Review & Rating
↓
End
```

### Flowchart Verifikasi Tutor oleh Admin

```
Start
↓
Tutor: Daftar sebagai Tutor → Upload CV & Sertifikat
↓
Simpan Data Tutor (verificationStatus: pending)
↓
Kirim Notifikasi ke Admin
↓
Admin: Buka Dashboard Verification
↓
Admin: Review Dokumen Tutor (CV, Sertifikat)
↓
Admin: Approve/Reject?
→ (Reject) → Update Status: rejected → Kirim Notifikasi ke Tutor (alasan reject) → End
↓
(Approve) Update Status: approved
↓
Kirim Notifikasi Approval ke Tutor
↓
Tutor dapat Menerima Booking
↓
End
```

## Desain API / Interface

Sistem TutorGo mengekspos API endpoints di bawah `/api/*` untuk komunikasi frontend-backend dan konsumsi oleh agentic LLM.

### Authentication & User Management

| Endpoint             | Method   | Deskripsi                                            | Auth Required | Role |
| -------------------- | -------- | ---------------------------------------------------- | ------------- | ---- |
| `/api/auth/*`        | GET/POST | Handler Auth.js (signin, callback, session, signout) | No            | All  |
| `/api/auth/register` | POST     | Register user baru (student/tutor/admin)             | No            | All  |

**Request Body `/api/auth/register`:**

```json
{
  "email": "student@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "role": "student"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": "uuid-123"
}
```

### Booking Management

| Endpoint             | Method | Deskripsi                                                                     | Auth Required | Role           |
| -------------------- | ------ | ----------------------------------------------------------------------------- | ------------- | -------------- |
| `/api/bookings`      | GET    | List bookings untuk user (student: bookings dibuat, tutor: bookings diterima) | Yes           | Student, Tutor |
| `/api/bookings`      | POST   | Create booking baru                                                           | Yes           | Student        |
| `/api/bookings/[id]` | PUT    | Update booking (confirm/complete/cancel)                                      | Yes           | Student, Tutor |

**Request Body `POST /api/bookings`:**

```json
{
  "tutorId": "uuid-tutor",
  "subject": "Matematika",
  "scheduledDate": "2025-12-10T14:00:00Z",
  "duration": 60,
  "notes": "Persiapan ujian kalkulus"
}
```

**Response:**

```json
{
  "success": true,
  "bookingId": "uuid-booking",
  "status": "pending",
  "totalPrice": 150000
}
```

**Request Body `PUT /api/bookings/[id]` (Tutor Confirm):**

```json
{
  "action": "confirm"
}
```

### Tutor Management

| Endpoint                | Method | Deskripsi                                                          | Auth Required | Role  |
| ----------------------- | ------ | ------------------------------------------------------------------ | ------------- | ----- |
| `/api/tutors`           | GET    | Search/list approved tutors (query params: subject, rating, price) | No            | All   |
| `/api/tutors/[id]`      | GET    | Get tutor details + reviews                                        | No            | All   |
| `/api/tutors/documents` | POST   | Upload CV/certificate files                                        | Yes           | Tutor |

**Query Params `GET /api/tutors`:**

- `subject`: Filter by subject (e.g., "Matematika")
- `minRating`: Minimum rating (e.g., 4.5)
- `maxPrice`: Maximum hourly rate
- `page`: Pagination page number

**Response `GET /api/tutors`:**

```json
{
  "tutors": [
    {
      "id": "uuid-tutor",
      "name": "Jane Smith",
      "specialization": "Matematika, Fisika",
      "rating": 4.8,
      "hourlyRate": 150000,
      "experience": 5,
      "totalReviews": 42
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalTutors": 28
  }
}
```

### Review Management

| Endpoint       | Method | Deskripsi                             | Auth Required | Role    |
| -------------- | ------ | ------------------------------------- | ------------- | ------- |
| `/api/reviews` | POST   | Create review untuk completed booking | Yes           | Student |

**Request Body `POST /api/reviews`:**

```json
{
  "bookingId": "uuid-booking",
  "rating": 5,
  "comment": "Tutor sangat membantu dan jelas dalam menjelaskan"
}
```

### Notification Management

| Endpoint                       | Method | Deskripsi                      | Auth Required | Role |
| ------------------------------ | ------ | ------------------------------ | ------------- | ---- |
| `/api/notifications`           | GET    | List notifications untuk user  | Yes           | All  |
| `/api/notifications/[id]/read` | PUT    | Mark notification sebagai read | Yes           | All  |

**Response `GET /api/notifications`:**

```json
{
  "notifications": [
    {
      "id": "uuid-notif",
      "type": "booking_confirmed",
      "title": "Booking Dikonfirmasi",
      "message": "Tutor Jane Smith telah menerima booking Anda",
      "isRead": false,
      "createdAt": "2025-12-01T10:30:00Z"
    }
  ],
  "unreadCount": 3
}
```

### Admin Management

| Endpoint                        | Method | Deskripsi                                           | Auth Required | Role  |
| ------------------------------- | ------ | --------------------------------------------------- | ------------- | ----- |
| `/api/admin/tutors`             | GET    | List semua tutors + verification status             | Yes           | Admin |
| `/api/admin/tutors/[id]/verify` | PUT    | Update verification status (approve/reject/pending) | Yes           | Admin |

**Request Body `PUT /api/admin/tutors/[id]/verify`:**

```json
{
  "status": "approved",
  "notes": "Dokumen valid dan lengkap"
}
```

## Pseudocode Proses Utama

### Pseudocode: Create Booking

```typescript
async function createBooking(studentId, bookingData) {
  // Validasi input
  if (!validateBookingData(bookingData)) {
    return { error: 'Data booking tidak valid atau tidak lengkap' };
  }

  // Check apakah tutor tersedia di tanggal yang diminta
  const isAvailable = await checkTutorAvailability(
    bookingData.tutorId,
    bookingData.scheduledDate,
    bookingData.duration
  );

  if (!isAvailable) {
    return { error: 'Tutor tidak tersedia pada waktu yang dipilih' };
  }

  // Hitung total price
  const tutor = await getTutorById(bookingData.tutorId);
  const totalPrice = tutor.hourlyRate * (bookingData.duration / 60);

  // Simpan booking
  const booking = await database.bookings.create({
    studentId: studentId,
    tutorId: bookingData.tutorId,
    subject: bookingData.subject,
    scheduledDate: bookingData.scheduledDate,
    duration: bookingData.duration,
    status: 'pending',
    totalPrice: totalPrice,
    notes: bookingData.notes
  });

  // Kirim notifikasi ke tutor
  await sendNotification({
    userId: bookingData.tutorId,
    type: 'new_booking',
    title: 'Booking Request Baru',
    message: `Student ${studentId} mengajukan booking untuk ${bookingData.subject}`
  });

  return {
    success: true,
    bookingId: booking.id,
    status: booking.status,
    totalPrice: totalPrice
  };
}
```

### Pseudocode: Verify Tutor (Admin)

```typescript
async function verifyTutor(adminId, tutorId, decision) {
  // Check admin authorization
  if (!isAdmin(adminId)) {
    return { error: 'Unauthorized: Admin access required' };
  }

  // Validasi decision
  if (!['approved', 'rejected', 'pending'].includes(decision.status)) {
    return { error: 'Invalid verification status' };
  }

  // Update status verifikasi tutor
  const updatedTutor = await database.tutors.update({
    where: { id: tutorId },
    data: {
      verificationStatus: decision.status,
      verificationNotes: decision.notes,
      verifiedAt: new Date(),
      verifiedBy: adminId
    }
  });

  // Kirim notifikasi ke tutor
  let notificationMessage = '';
  if (decision.status === 'approved') {
    notificationMessage =
      'Selamat! Dokumen Anda telah diverifikasi. Anda dapat mulai menerima booking.';
  } else if (decision.status === 'rejected') {
    notificationMessage = `Verifikasi ditolak. Alasan: ${decision.notes}`;
  }

  await sendNotification({
    userId: tutorId,
    type: 'verification_update',
    title: 'Update Status Verifikasi',
    message: notificationMessage
  });

  return {
    success: true,
    tutor: updatedTutor
  };
}
```

### Pseudocode: Submit Review

```typescript
async function submitReview(studentId, reviewData) {
  // Validasi review data
  if (!validateReviewData(reviewData)) {
    return { error: 'Data review tidak valid' };
  }

  // Check apakah booking sudah completed
  const booking = await database.bookings.findById(reviewData.bookingId);

  if (!booking) {
    return { error: 'Booking tidak ditemukan' };
  }

  if (booking.studentId !== studentId) {
    return { error: 'Unauthorized: Bukan booking Anda' };
  }

  if (booking.status !== 'completed') {
    return {
      error: 'Review hanya bisa diberikan untuk booking yang sudah selesai'
    };
  }

  // Check apakah review sudah ada
  const existingReview = await database.reviews.findByBookingId(
    reviewData.bookingId
  );
  if (existingReview) {
    return { error: 'Review sudah pernah diberikan untuk booking ini' };
  }

  // Simpan review
  const review = await database.reviews.create({
    bookingId: reviewData.bookingId,
    studentId: studentId,
    tutorId: booking.tutorId,
    rating: reviewData.rating,
    comment: reviewData.comment
  });

  // Update rating tutor (recalculate average)
  await updateTutorRating(booking.tutorId);

  // Kirim notifikasi ke tutor
  await sendNotification({
    userId: booking.tutorId,
    type: 'new_review',
    title: 'Review Baru',
    message: `Anda mendapat review ${reviewData.rating} bintang`
  });

  return {
    success: true,
    review: review
  };
}
```

## Struktur Data (Database Schema)

Sistem TutorGo menggunakan PostgreSQL dengan skema tabel berikut:

### Tabel: users

| Column     | Type         | Constraint       | Description           |
| ---------- | ------------ | ---------------- | --------------------- |
| id         | UUID         | PRIMARY KEY      | User ID               |
| email      | VARCHAR(255) | UNIQUE, NOT NULL | Email pengguna        |
| password   | VARCHAR(255) | NOT NULL         | Hashed password       |
| name       | VARCHAR(255) | NOT NULL         | Nama lengkap          |
| role       | ENUM         | NOT NULL         | student, tutor, admin |
| created_at | TIMESTAMP    | DEFAULT NOW()    | Waktu registrasi      |
| updated_at | TIMESTAMP    | DEFAULT NOW()    | Waktu update terakhir |

### Tabel: tutors

| Column              | Type          | Constraint          | Description                 |
| ------------------- | ------------- | ------------------- | --------------------------- |
| id                  | UUID          | PRIMARY KEY         | Tutor ID                    |
| user_id             | UUID          | FOREIGN KEY, UNIQUE | Reference ke users.id       |
| bio                 | TEXT          | NULLABLE            | Deskripsi tutor             |
| specialization      | VARCHAR(500)  | NULLABLE            | Mata pelajaran spesialisasi |
| experience          | INTEGER       | DEFAULT 0           | Pengalaman (tahun)          |
| hourly_rate         | DECIMAL(10,2) | NOT NULL            | Tarif per jam               |
| verification_status | ENUM          | DEFAULT 'pending'   | pending, approved, rejected |
| cv_url              | TEXT          | NULLABLE            | URL dokumen CV              |
| certificate_url     | TEXT          | NULLABLE            | URL sertifikat              |
| rating              | DECIMAL(3,2)  | DEFAULT 0           | Rating rata-rata            |
| total_reviews       | INTEGER       | DEFAULT 0           | Jumlah review               |
| verified_at         | TIMESTAMP     | NULLABLE            | Waktu verifikasi            |
| verified_by         | UUID          | NULLABLE            | Admin yang verifikasi       |
| created_at          | TIMESTAMP     | DEFAULT NOW()       | Waktu registrasi tutor      |

### Tabel: bookings

| Column         | Type          | Constraint            | Description                                        |
| -------------- | ------------- | --------------------- | -------------------------------------------------- |
| id             | UUID          | PRIMARY KEY           | Booking ID                                         |
| student_id     | UUID          | FOREIGN KEY, NOT NULL | Reference ke users.id                              |
| tutor_id       | UUID          | FOREIGN KEY, NOT NULL | Reference ke tutors.id                             |
| subject        | VARCHAR(255)  | NOT NULL              | Mata pelajaran                                     |
| scheduled_date | TIMESTAMP     | NOT NULL              | Jadwal session                                     |
| duration       | INTEGER       | NOT NULL              | Durasi (menit)                                     |
| status         | ENUM          | DEFAULT 'pending'     | pending, confirmed, completed, cancelled, rejected |
| total_price    | DECIMAL(10,2) | NOT NULL              | Total biaya                                        |
| notes          | TEXT          | NULLABLE              | Catatan tambahan                                   |
| created_at     | TIMESTAMP     | DEFAULT NOW()         | Waktu booking dibuat                               |
| updated_at     | TIMESTAMP     | DEFAULT NOW()         | Waktu update status                                |

### Tabel: reviews

| Column     | Type      | Constraint            | Description              |
| ---------- | --------- | --------------------- | ------------------------ |
| id         | UUID      | PRIMARY KEY           | Review ID                |
| booking_id | UUID      | FOREIGN KEY, UNIQUE   | Reference ke bookings.id |
| student_id | UUID      | FOREIGN KEY, NOT NULL | Reference ke users.id    |
| tutor_id   | UUID      | FOREIGN KEY, NOT NULL | Reference ke tutors.id   |
| rating     | INTEGER   | CHECK (1-5), NOT NULL | Rating 1-5 bintang       |
| comment    | TEXT      | NULLABLE              | Komentar review          |
| created_at | TIMESTAMP | DEFAULT NOW()         | Waktu review dibuat      |

### Tabel: notifications

| Column     | Type         | Constraint            | Description                         |
| ---------- | ------------ | --------------------- | ----------------------------------- |
| id         | UUID         | PRIMARY KEY           | Notification ID                     |
| user_id    | UUID         | FOREIGN KEY, NOT NULL | Reference ke users.id               |
| type       | VARCHAR(50)  | NOT NULL              | booking_confirmed, new_review, etc. |
| title      | VARCHAR(255) | NOT NULL              | Judul notifikasi                    |
| message    | TEXT         | NOT NULL              | Isi notifikasi                      |
| is_read    | BOOLEAN      | DEFAULT FALSE         | Status sudah dibaca                 |
| created_at | TIMESTAMP    | DEFAULT NOW()         | Waktu notifikasi dibuat             |

### Relationship Diagram

```
users (1) ─────< (1) tutors
  │
  ├─────< (M) bookings (as student)
  │
  └─────< (M) notifications

tutors (1) ─────< (M) bookings
  │
  └─────< (M) reviews

bookings (1) ─────< (1) reviews
```

## Penanganan Kesalahan (Error Handling)

Sistem TutorGo menerapkan error handling yang konsisten di seluruh API endpoints dan aplikasi.

### Error Response Format

```json
{
  "error": true,
  "message": "Deskripsi error yang jelas",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Kategori Error dan HTTP Status Codes

| Error Type               | HTTP Status | Example                                                  |
| ------------------------ | ----------- | -------------------------------------------------------- |
| **Validation Error**     | 400         | Input data tidak valid atau tidak lengkap                |
| **Authentication Error** | 401         | User belum login atau session expired                    |
| **Authorization Error**  | 403         | User tidak memiliki permission untuk akses resource      |
| **Not Found**            | 404         | Resource tidak ditemukan (booking, tutor, user)          |
| **Conflict**             | 409         | Duplikasi data (email sudah terdaftar, review sudah ada) |
| **Server Error**         | 500         | Database connection failed, unexpected error             |

### Error Handling Strategy

1. **Validasi Input**: Gunakan Zod schema untuk validasi request body di setiap API endpoint
2. **Try-Catch Blocks**: Wrap semua database operations dan external API calls
3. **Logging**: Log semua error ke sistem monitoring (Vercel Analytics) dengan context yang cukup
4. **User-Friendly Messages**: Jangan expose internal error details ke client
5. **Rollback Transactions**: Jika operasi multi-step gagal, rollback semua perubahan database

### Contoh Error Handling di API

```typescript
export async function POST(request: Request) {
  try {
    // Parse dan validasi input
    const body = await request.json();
    const validation = bookingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: true,
          message: 'Invalid booking data',
          details: validation.error.flatten()
        },
        { status: 400 }
      );
    }

    // Check authorization
    const session = await auth();
    if (!session || session.user.role !== 'student') {
      return NextResponse.json(
        { error: true, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Business logic
    const booking = await createBooking(session.user.id, validation.data);

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error) {
    console.error('[API Error] Create Booking:', error);

    return NextResponse.json(
      {
        error: true,
        message: 'Failed to create booking. Please try again.'
      },
      { status: 500 }
    );
  }
}
```

## Standar Kode dan Gaya Penulisan

Untuk menjaga kualitas dan konsistensi kode, TutorGo menerapkan coding standards berikut:

### Naming Conventions

1. **Variables & Functions**: camelCase

   ```typescript
   const tutorId = 'uuid-123';
   function createBooking() {}
   ```

2. **Components**: PascalCase

   ```typescript
   export function TutorCard() {}
   ```

3. **Constants**: UPPER_SNAKE_CASE

   ```typescript
   const MAX_BOOKING_DURATION = 180;
   ```

4. **Types & Interfaces**: PascalCase
   ```typescript
   interface BookingData {}
   type UserRole = 'student' | 'tutor' | 'admin';
   ```

### Code Organization

1. **File Structure**: Gunakan Next.js App Router conventions

   - Pages: `app/[route]/page.tsx`
   - API: `app/api/[endpoint]/route.ts`
   - Components: `components/[feature]/[ComponentName].tsx`
   - Utils: `lib/[utility].ts`

2. **Import Order**:

   ```typescript
   // 1. React & Next.js
   import { useState } from 'react';
   import { NextResponse } from 'next/server';

   // 2. External libraries
   import { z } from 'zod';

   // 3. Internal modules
   import { auth } from '@/lib/auth';
   import { db } from '@/lib/db';

   // 4. Types
   import type { Booking } from '@/types';
   ```

3. **Component Structure**:

   ```typescript
   // Props interface
   interface TutorCardProps {
     tutor: Tutor
     onBooking: (id: string) => void
   }

   // Component
   export function TutorCard({ tutor, onBooking }: TutorCardProps) {
     // Hooks
     const [isLoading, setIsLoading] = useState(false)

     // Event handlers
     const handleBooking = () => {
       onBooking(tutor.id)
     }

     // Render
     return (...)
   }
   ```

### TypeScript Best Practices

1. **Explicit Types**: Selalu define types untuk function parameters dan return values

   ```typescript
   async function getTutorById(id: string): Promise<Tutor | null> {
     return await db.tutor.findUnique({ where: { id } });
   }
   ```

2. **Avoid `any`**: Gunakan `unknown` jika type tidak diketahui, lalu narrow dengan type guards

   ```typescript
   function processData(data: unknown) {
     if (typeof data === 'string') {
       // data is string here
     }
   }
   ```

3. **Use Zod for Validation**: Define runtime validation schemas
   ```typescript
   const bookingSchema = z.object({
     tutorId: z.string().uuid(),
     subject: z.string().min(1),
     scheduledDate: z.string().datetime(),
     duration: z.number().min(30).max(180)
   });
   ```

### Code Quality Principles

1. **DRY (Don't Repeat Yourself)**: Extract reusable logic ke utility functions atau custom hooks
2. **Single Responsibility**: Setiap function/component harus punya satu tanggung jawab
3. **Clear Naming**: Gunakan nama yang descriptive dan self-explanatory
4. **Comments**: Tambahkan JSDoc comments untuk complex functions
   ```typescript
   /**
    * Calculate tutor rating berdasarkan semua reviews
    * @param tutorId - UUID tutor
    * @returns Promise<number> - Average rating (0-5)
    */
   async function calculateTutorRating(tutorId: string): Promise<number> {
     // Implementation
   }
   ```

### Formatting

- **Prettier**: Gunakan Prettier untuk auto-formatting (sudah configured di project)
- **Indentation**: 2 spaces
- **Line Length**: Maximum 100 characters
- **Semicolons**: Required
- **Quotes**: Single quotes untuk strings

## Rencana Pengujian Unit

Pengujian unit dilakukan untuk setiap fungsi kritis di sistem TutorGo menggunakan testing framework (Jest / Vitest).

### Test Coverage Target

- **API Routes**: 80% coverage minimum
- **Utility Functions**: 90% coverage minimum
- **Critical Business Logic**: 100% coverage

### Unit Test Cases

#### Authentication Module

```typescript
describe('registerUser', () => {
  test('should register new student successfully', async () => {
    const userData = {
      email: 'newstudent@example.com',
      password: 'securePass123',
      name: 'New Student',
      role: 'student'
    }

    const result = await registerUser(userData)

    expect(result.success).toBe(true)
    expect(result.userId).toBeDefined()
  })

  test('should reject duplicate email', async () => {
    const userData = {
      email: 'existing@example.com',
      password: 'pass123',
      name: 'Test',
      role: 'student'
    }

    await expect(registerUser(userData)).rejects.toThrow('Email already exists')
  })

  test('should hash password before storing', async () => {
    const userData = { ... }
    await registerUser(userData)

    const user = await db.user.findByEmail(userData.email)
    expect(user.password).not.toBe(userData.password)
    expect(user.password).toMatch(/^\$2[aby]\$.{56}$/) // bcrypt format
  })
})
```

#### Booking Module

```typescript
describe('createBooking', () => {
  test('should create booking with valid data', async () => {
    const bookingData = {
      tutorId: 'valid-tutor-id',
      subject: 'Matematika',
      scheduledDate: new Date('2025-12-10T14:00:00Z'),
      duration: 60
    }

    const result = await createBooking('student-id', bookingData)

    expect(result.success).toBe(true)
    expect(result.status).toBe('pending')
    expect(result.totalPrice).toBeGreaterThan(0)
  })

  test('should reject booking for unavailable tutor', async () => {
    const bookingData = { ... } // tutor already booked

    const result = await createBooking('student-id', bookingData)

    expect(result.error).toBe('Tutor tidak tersedia pada waktu yang dipilih')
  })

  test('should calculate price correctly', async () => {
    const bookingData = {
      tutorId: 'tutor-id', // hourlyRate: 150000
      duration: 90 // 1.5 hours
    }

    const result = await createBooking('student-id', bookingData)

    expect(result.totalPrice).toBe(225000) // 150000 * 1.5
  })
})
```

#### Review Module

```typescript
describe('submitReview', () => {
  test('should create review for completed booking', async () => {
    const reviewData = {
      bookingId: 'completed-booking-id',
      rating: 5,
      comment: 'Excellent tutor!'
    };

    const result = await submitReview('student-id', reviewData);

    expect(result.success).toBe(true);
    expect(result.review.rating).toBe(5);
  });

  test('should reject review for pending booking', async () => {
    const reviewData = {
      bookingId: 'pending-booking-id',
      rating: 5,
      comment: 'Test'
    };

    await expect(submitReview('student-id', reviewData)).rejects.toThrow(
      'Review hanya bisa diberikan untuk booking yang sudah selesai'
    );
  });

  test('should update tutor average rating', async () => {
    const tutorId = 'tutor-id';
    const initialRating = await getTutorRating(tutorId); // 4.5

    await submitReview('student-id', {
      bookingId: 'booking-id',
      rating: 5,
      comment: 'Great'
    });

    const updatedRating = await getTutorRating(tutorId);
    expect(updatedRating).toBeGreaterThan(initialRating);
  });
});
```

#### Admin Module

```typescript
describe('verifyTutor', () => {
  test('should approve tutor with valid documents', async () => {
    const decision = {
      status: 'approved',
      notes: 'All documents verified'
    };

    const result = await verifyTutor('admin-id', 'tutor-id', decision);

    expect(result.success).toBe(true);
    expect(result.tutor.verificationStatus).toBe('approved');
  });

  test('should reject non-admin user', async () => {
    const decision = { status: 'approved', notes: 'Test' };

    await expect(
      verifyTutor('student-id', 'tutor-id', decision)
    ).rejects.toThrow('Unauthorized: Admin access required');
  });

  test('should send notification to tutor after verification', async () => {
    const sendNotificationSpy = jest.spyOn(notificationService, 'send');

    await verifyTutor('admin-id', 'tutor-id', {
      status: 'approved',
      notes: ''
    });

    expect(sendNotificationSpy).toHaveBeenCalledWith({
      userId: 'tutor-id',
      type: 'verification_update',
      title: expect.any(String),
      message: expect.stringContaining('diverifikasi')
    });
  });
});
```

### Integration Tests

Selain unit tests, lakukan integration tests untuk flow lengkap:

1. **End-to-End Booking Flow**: Student search → select tutor → create booking → tutor confirm → session complete → student review
2. **Tutor Verification Flow**: Tutor register → upload documents → admin review → approval → tutor receives booking
3. **Notification System**: Trigger events → notifications created → mark as read

### Testing Tools

- **Jest / Vitest**: Unit testing framework
- **React Testing Library**: Component testing
- **Playwright**: E2E testing
- **MSW (Mock Service Worker)**: API mocking untuk tests

## Deployment dan DevOps

### Deployment Strategy

TutorGo di-deploy menggunakan **Vercel** dengan konfigurasi berikut:

1. **Environment Variables** (di Vercel Dashboard):

   ```
   DATABASE_URL=<PostgreSQL connection string>
   NEXTAUTH_SECRET=<random secret>
   NEXTAUTH_URL=https://tutorgo.vercel.app
   ```

2. **Build Configuration**:

   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "framework": "nextjs"
   }
   ```

3. **Automatic Deployments**:
   - Production: `main` branch → tutorgo.vercel.app
   - Preview: Setiap PR → temporary preview URL

### Database Migrations

Gunakan migration tool (Prisma Migrate / raw SQL) untuk schema changes:

```bash
# Create migration
npx prisma migrate dev --name add_tutor_verification

# Apply to production
npx prisma migrate deploy
```

### Monitoring dan Logging

1. **Vercel Analytics**: Track performance metrics dan user behavior
2. **Error Logging**: Log semua server errors ke external service (Sentry)
3. **Database Monitoring**: Monitor query performance dan connection pool

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test
      - run: npm run build
```

## Security Considerations

### Authentication & Authorization

1. **Password Hashing**: Gunakan bcrypt dengan minimum 10 salt rounds
2. **Session Management**: Auth.js dengan JWT tokens, expire 7 days
3. **Role-Based Access Control (RBAC)**: Middleware untuk protect routes berdasarkan role

### Input Validation

1. **Zod Schemas**: Validate semua user input di API routes
2. **SQL Injection Prevention**: Gunakan parameterized queries (Prisma ORM)
3. **XSS Prevention**: Sanitize output, escape special characters

### File Upload Security

1. **File Type Validation**: Hanya accept PDF untuk CV/certificate
2. **File Size Limit**: Maximum 5MB per file
3. **Virus Scanning**: Integrate antivirus scanning untuk uploaded files
4. **Secure Storage**: Upload ke cloud storage (AWS S3 / Vercel Blob) dengan signed URLs

### API Security

1. **Rate Limiting**: Limit request per IP (100 requests/15 minutes)
2. **CORS Configuration**: Whitelist specific origins
3. **HTTPS Only**: Enforce HTTPS untuk semua connections

## Kesimpulan

Dokumen **TutorGo Software Construction Design** ini menyediakan panduan teknis komprehensif untuk implementasi platform pembelajaran online. Dengan mengikuti arsitektur, desain API, database schema, coding standards, dan testing strategy yang telah didefinisikan, tim pengembang dapat membangun sistem yang scalable, maintainable, dan secure.

Seluruh desain telah disesuaikan dengan stack teknologi modern (Next.js 15, TypeScript, PostgreSQL, Vercel) dan mengikuti best practices industri untuk software construction. Dokumentasi ini akan terus di-update seiring dengan evolusi sistem dan penambahan fitur baru.

---

**Referensi Proyek:**

- Repository: [https://github.com/2oog/ppsi-ws25](https://github.com/2oog/ppsi-ws25)
- Live Demo: [https://next-admin-dash.vercel.app](https://next-admin-dash.vercel.app)
