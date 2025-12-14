# Laporan Implementasi Teori Konstruksi Perangkat Lunak

**Proyek:** Sistem Informasi TutorGo (Platform Pencarian & Pemesanan Tutor)

**Teknologi:** Next.js 15, TypeScript, PostgreSQL (Drizzle ORM), Tailwind CSS

**Tanggal:** 8 Desember 2025

**Repository:** [https://github.com/2oog/ppsi-ws25](https://github.com/2oog/ppsi-ws25)

**Live Demo:** [https://tutorgo.ghi.im/](https://tutorgo.ghi.im/)

**Versi:** 7

## BAB I: Pendahuluan

### 1.1 Deskripsi Singkat Proyek

TutorGo adalah platform manajemen tutor berbasis web yang memfasilitasi interaksi antara `student`, `tutor`, dan `admin`. Aplikasi ini dibangun menggunakan Next.js 15 dengan fitur utama meliputi sistem _booking_, autentikasi berbasis _role_, manajemen profil tutor, sistem _review_, dan notifikasi _real-time_. Platform ini menggunakan teknologi modern seperti TypeScript, Tailwind CSS, PostgreSQL database dengan Drizzle ORM, dan Auth.js untuk autentikasi.

### 1.2 Model Siklus Hidup (Life Cycle Model) - Pertemuan 8

Model pengembangan yang digunakan adalah **_Waterfall Model_**. Model ini dipilih karena cocok untuk proyek mata kuliah dengan _scope_ dan _requirements_ yang sudah jelas sejak awal. Dengan _Waterfall_, tim dapat fokus menyelesaikan setiap fase secara berurutan: _requirement analysis_, _design_, _implementation_, _testing_, dan _deployment_ tanpa perlu iterasi.

## BAB II: Standar dan Perencanaan Konstruksi - Ref: Pertemuan 8 & 9

### 2.1 Standar Pengkodean (Coding Standards)

Tim menyepakati standar pengkodean berikut:

- **Bahasa:** Semua kode _backend_ dan _frontend_ menggunakan bahasa Inggris untuk konsistensi
- **_Naming Convention_:** Menggunakan `camelCase` untuk variabel dan fungsi, `PascalCase` untuk komponen React
- **_Type Safety_:** _Strict_ TypeScript untuk seluruh aplikasi (_fullstack_) tanpa penggunaan `any` type
- **_Documentation_:** JSDoc untuk fungsi-fungsi kompleks (akan diimplementasikan)

**Snapshot Kode:** Contoh konsistensi penamaan variabel di [`app/api/bookings/route.ts`](https://github.com/2oog/ppsi-ws25/blob/main/app/api/bookings/route.ts)

```typescript
const createBookingSchema = z.object({
  tutorId: z.number(),
  subject: z.string().min(1),
  sessionDate: z.string().datetime(),
  durationMinutes: z.number().min(30).default(60),
  notes: z.string().optional()
});
```

Terlihat penggunaan `camelCase` yang konsisten: `tutorId`, `sessionDate`, `durationMinutes`.

### 2.2 Bahasa Pemrograman & Tools - Pertemuan 10

**Bahasa Pemrograman:**

- **TypeScript** - Dipilih untuk _type safety_ dan mencegah _runtime errors_ sejak _development_
- **SQL** - Untuk _database schema_ dan _query optimization_

**Framework & Libraries:**

- **Next.js 15** - _Framework_ React dengan _App Router_ untuk _server-side rendering_ dan _API routes_
- **React 18** - Library UI untuk komponen interaktif
- **Tailwind CSS** - _Utility-first CSS framework_ untuk _styling_ cepat dan konsisten
- **Drizzle ORM** - _Type-safe ORM_ untuk _database operations_
- **Auth.js** - Autentikasi dan _session management_
- **Zod** - _Schema validation_ untuk _input validation_

**Tools:**

- **pnpm** - _Package manager_ yang lebih cepat dan hemat _disk space_
- **Git & GitHub** - _Version control_ dan _code hosting_
- **Vercel** - _Deployment platform_
- **TypeScript ESLint** - _Linter_ untuk menjaga kualitas kode, lebih lengkap dari vanilla JavaScript

Pemilihan teknologi ini memastikan kualitas kode, produktivitas tinggi, dan _maintainability_ jangka panjang.

## BAB III: Desain Konstruksi Detail (Detailed Design) - Pertemuan 9

### 3.1 Struktur Modul dan Kelas

Sistem dipecah menjadi modul-modul kecil untuk meminimalkan kompleksitas:

**Struktur Folder:**

```
app/
├───api                             # Backend API routes
│   ├───admin                       # Admin operations
│   │   └───tutors                  # Tutor management
│   │       └───[id]                # Tutor details
│   │           └───verify          # Verify tutor
│   ├───auth                        # Authentication
│   │   ├───register                # User registration
│   │   └───[...nextauth]           # Authentication routes
│   ├───bookings                    # Booking management
│   │   └───[id]                    # Booking details
│   ├───files                       # File upload/download
│   │   └───[key]                   # File key
│   ├───notifications               # Notification management
│   │   ├───read-all                # Read all notifications
│   │   └───[id]
│   │       └───read                # Mark notification as read
│   ├───reviews                     # Review management
│   ├───students                    # Student management
│   │   └───[id]                    # Student details
│   ├───tutors                      # Tutor management
│   │   ├───documents               # Tutor documents
│   │   ├───schedule                # Tutor schedule
│   │   └───[id]                    # Tutor details
│   ├───upload                      # File upload
│   └───users                       # User management
│       └───[id]                    # User details
│           └───profile-picture     # Profile picture upload
├───dashboard                       # Frontend pages
│   ├───admin                       # Admin dashboard
│   │   └───verification            # Tutor verification queue
│   ├───student                     # Student dashboard
│   │   ├───bookings                # Student bookings
│   │   ├───profile                 # Student profile
│   │   └───search                  # Student search
│   └───tutor                       # Tutor dashboard
│       ├───profile                 # Tutor profile
│       └───schedule                # Tutor schedule
├───login                           # Login page
├───register                        # Registration page
│   └───form                        # Registration form
└───tutors                          # Tutor listing
    └───[id]                        # Tutor details

lib/
├── db.ts                           # Database schema & connection
├── auth.ts                         # Authentication config
└── utils.ts                        # Utility functions

components/                         # Reusable UI components
```

**Snapshot Kode:** Database schema diagram dari [`lib/db.ts`](https://github.com/2oog/ppsi-ws25/blob/main/lib/db.ts)

```typescript
// Contoh modularisasi tabel database
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  role: rolesEnum('role').notNull(),
  fullname: varchar('fullname', { length: 255 }).notNull()
  // ... fields lainnya
});

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id),
  tutorId: integer('tutor_id').references(() => tutors.id),
  status: bookingStatusEnum('status').default('pending')
  // ... fields lainnya
});
```

Setiap tabel memiliki _responsibility_ yang jelas dan relasi yang terdefinisi dengan baik.

### 3.2 Desain Algoritma & Logika

**Fitur Kompleks: Sistem _Booking_ dengan _Role-Based Access_**

Algoritma _booking_ memeriksa _role user_, validasi _input_, membuat _booking_, dan mengirim notifikasi ke tutor secara otomatis:

1. Verifikasi _user_ adalah _student_
2. Validasi _input booking_ dengan Zod _schema_
3. Cari _student record_ berdasarkan `userId`
4. _Insert booking_ ke database dengan status `pending`
5. Cari _tutor record_ untuk mendapatkan `userId` tutor
6. Buat notifikasi untuk tutor tentang _booking_ baru
7. _Return booking data_ dengan status `201`

Logika ini memastikan hanya _student_ yang bisa membuat _booking_ dan tutor mendapat notifikasi _instant_.

## BAB IV: Praktik Pengkodean & Teknik Konstruksi - Pertemuan 9 & 10

### 4.1 Penerapan Konsep Object-Oriented (OO Runtime) - Pertemuan 10

**Polymorphism dalam API Routes:**

Next.js menggunakan konsep _polymorphism_ melalui _HTTP methods_ yang berbeda pada satu _endpoint_. File `route.ts` dapat meng-_export_ _functions_ (GET, POST, PUT, DELETE) yang dipanggil sesuai _HTTP method_ yang digunakan.

**Snapshot Kode:** Polymorphism di [`app/api/bookings/route.ts`](https://github.com/2oog/ppsi-ws25/blob/main/app/api/bookings/route.ts)

```typescript
// Satu endpoint dengan behavior berbeda berdasarkan HTTP method
export async function POST(request: Request) {
  // Logic untuk create booking
  const session = await auth();
  if (!session?.user || session.user.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... create booking logic
}

export async function GET(request: Request) {
  // Logic untuk fetch bookings
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Behavior berbeda berdasarkan role
  if (session.user.role === 'student') {
    // Return bookings sebagai student
  } else if (session.user.role === 'tutor') {
    // Return bookings sebagai tutor
  }
}
```

Endpoint `/api/bookings` memberikan response berbeda tergantung method (POST vs GET) dan role user, menunjukkan penerapan polymorphism.

### 4.2 Penanganan Kesalahan (Error Handling & Defensive Programming) - Pertemuan 10

Aplikasi mengimplementasikan _defensive programming_ dengan validasi _input_ dan _try-catch blocks_ untuk menangani berbagai _error scenarios_.

**Snapshot Kode:** Error handling di [`app/api/bookings/route.ts`](https://github.com/2oog/ppsi-ws25/blob/main/app/api/bookings/route.ts)

```typescript
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    // Validasi input dengan Zod
    const { tutorId, subject, sessionDate, durationMinutes, notes } =
      createBookingSchema.parse(body);

    const studentRecord = await db
      .select()
      .from(students)
      .where(eq(students.userId, parseInt(session.user.id!)))
      .limit(1);

    // Defensive check: student profile harus ada
    if (studentRecord.length === 0) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      );
    }

    // ... booking creation logic
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    // Handle unexpected errors
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

Kode di atas menunjukkan:

- **_Input validation_** dengan Zod _schema_ sebelum _processing_
- **_Authorization check_** di awal _function_
- **_Null checking_** untuk _database results_
- **_Specific error handling_** dengan _discriminated catch blocks_
- **_Graceful error responses_** dengan _HTTP status codes_ yang sesuai

### 4.3 Penerapan API (Design & Use) - Pertemuan 10

**Design API Internal:**

TutorGo mengimplementasikan _RESTful API_ dengan struktur _endpoint_ yang konsisten:

- `POST /api/auth/register` - Register user baru
- `GET/POST /api/bookings` - List dan create bookings
- `PUT /api/bookings/[id]` - Update booking status
- `GET /api/tutors` - Search tutors dengan query params
- `POST /api/reviews` - Create review
- `GET /api/notifications` - Fetch notifications

**Snapshot Kode:** API endpoint structure di [`app/api/bookings/route.ts`](https://github.com/2oog/ppsi-ws25/blob/main/app/api/bookings/route.ts)

```typescript
// RESTful API Design
export async function POST(request: Request) {
  // CREATE operation - creates new booking
  const [newBooking] = await db
    .insert(bookings)
    .values({
      studentId: studentRecord[0].id,
      tutorId,
      subject,
      sessionDate: new Date(sessionDate),
      durationMinutes,
      notes,
      status: 'pending'
    })
    .returning();

  return NextResponse.json(newBooking, { status: 201 });
}

export async function GET(request: Request) {
  // READ operation - fetches bookings based on user role
  results = await db
    .select({
      id: bookings.id,
      subject: bookings.subject,
      sessionDate: bookings.sessionDate,
      status: bookings.status
      // ... other fields
    })
    .from(bookings)
    .innerJoin(tutors, eq(bookings.tutorId, tutors.id))
    .where(eq(bookings.studentId, studentRecord[0].id))
    .orderBy(desc(bookings.sessionDate));

  return NextResponse.json(results);
}
```

_API design_ mengikuti prinsip _REST_ dengan _HTTP methods_ yang _semantic_ (POST untuk _create_, GET untuk _read_) dan _status codes_ yang _appropriate_ (201 untuk _created_, 200 untuk _success_).

## BAB V: Konstruksi untuk Penggunaan Kembali (Reuse) - Pertemuan 9

### 5.1 Penggunaan Library/Komponen Eksternal

TutorGo menggunakan berbagai library eksternal untuk menghindari "reinventing the wheel":

- **Next.js** - _Framework fullstack_ dengan _routing_ dan _server-side rendering_
- **Auth.js** - Autentikasi dan _session management_ (tidak perlu _build_ dari nol)
- **Drizzle ORM** - _Database ORM_ untuk _type-safe queries_
- **Zod** - _Schema validation library_
- **Shadcn UI** - _Reusable UI components_ (Button, Form, Card, dll)
- **Tailwind CSS** - _Utility classes_ untuk _styling_
- **date-fns / dayjs** - _Date manipulation utilities_

Library-library ini menghemat development time dan sudah teruji oleh komunitas.

### 5.2 Penerapan Design Patterns

**Repository Pattern:**

Aplikasi menggunakan _Repository Pattern_ melalui Drizzle ORM. _Database schema_ dan _queries_ dipisah dalam modul `lib/db.ts`, bukan tersebar di setiap _API route_.

**Snapshot Kode:** Repository pattern di [`lib/db.ts`](https://github.com/2oog/ppsi-ws25/blob/main/lib/db.ts)

```typescript
// lib/db.ts - Central database repository
import { drizzle } from 'drizzle-orm/postgres-js';

const client = postgres(process.env.POSTGRES_URL!);
export const db = drizzle(client);

// Schema definitions
export const users = pgTable('users', {
  /* ... */
});
export const bookings = pgTable('bookings', {
  /* ... */
});
export const tutors = pgTable('tutors', {
  /* ... */
});

// Relations definitions
export const usersRelations = relations(users, ({ one }) => ({
  tutorProfile: one(tutors, {
    fields: [users.id],
    references: [tutors.userId]
  })
}));
```

Dengan pattern ini, API routes hanya perlu import `db` dan schema:

```typescript
// app/api/bookings/route.ts
import { db, bookings, tutors, students } from '@/lib/db';

// Database operations menggunakan repository
const results = await db.select().from(bookings).where(/* ... */);
```

**MVC Pattern (Modified):**

Next.js menggunakan modified MVC pattern:

- **Model**: _Database schema_ di `lib/db.ts`
- **View**: _React components_ di `app/dashboard/*` dan `components/*`
- **Controller**: _API routes_ di `app/api/*`

### 5.3 Konfigurasi & Variabilitas

Aplikasi menggunakan _environment variables_ untuk konfigurasi tanpa _hardcode values_.

**Snapshot Kode:** Configuration file [`.env.example`](https://github.com/2oog/ppsi-ws25/blob/main/.env.example)

```bash
# Database
# https://vercel.com/docs/storage/vercel-postgres
NEXT_PUBLIC_SUPABASE_ANON_KEY="xxx"
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
POSTGRES_DATABASE="postgres"
POSTGRES_HOST="db.xxx.supabase.co"
POSTGRES_PASSWORD="xxx"
POSTGRES_PRISMA_URL="postgres://postgres.xxx:xxx@xxx:6543/postgres?sslmode=require&pgbouncer=true"
POSTGRES_URL="postgres://postgres.xxx:xxx@xxx:6543/postgres?sslmode=require&supa=base-pooler.x"
POSTGRES_URL_NON_POOLING="postgres://postgres.xxx:xxx@xxx:5432/postgres?sslmode=require"
POSTGRES_USER="postgres"
SUPABASE_ANON_KEY="xxx"
SUPABASE_JWT_SECRET="xxx"
SUPABASE_SERVICE_ROLE_KEY="xxx"
SUPABASE_URL="https://xxx.supabase.co"

# Authentication
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET= "xxx"

# Created by Vercel CLI
VERCEL_OIDC_TOKEN="xxx"

# Cloudflare R2 / S3 Bucket
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=xxx
R2_PUBLIC_URL=https://xxx.r2.cloudflarestorage.com/xxx
```

Kode yang menggunakan config ([lib/db.ts](https://github.com/2oog/ppsi-ws25/blob/main/lib/db.ts) dan [lib/auth.ts](https://github.com/2oog/ppsi-ws25/blob/main/lib/auth.ts)):

```typescript
// lib/db.ts
const client = postgres(process.env.POSTGRES_URL!);

// lib/auth.ts
export const authConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: process.env.AUTH_TRUST_HOST === 'true'
};
```

Dengan pendekatan ini, _deployment_ ke berbagai _environment_ (_development_, _staging_, _production_) dapat dilakukan tanpa mengubah _source code_.

## BAB VI: Pengujian Konstruksi (Construction Testing) - Pertemuan 9

### 6.1 Unit Testing

Aplikasi menggunakan _test file_ [`test-db.ts`](https://github.com/2oog/ppsi-ws25/blob/main/test-db.ts) untuk memverifikasi _koneksi database_ dan _schema correctness_.

**Snapshot Kode:** Unit test untuk database connection di [`test-db.ts`](https://github.com/2oog/ppsi-ws25/blob/main/test-db.ts)

```typescript
import { db, users } from '@/lib/db';

async function testConnection() {
  try {
    console.log('Testing database connection...');

    // Test query: select semua users
    const result = await db.select().from(users).limit(1);

    console.log('✓ Database connection successful');
    console.log('Sample data:', result);

    process.exit(0);
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();
```

Test ini memverifikasi:

- _Database connection_ berhasil
- _Schema users_ dapat diakses
- _Query execution_ berjalan tanpa _error_

### 6.2 Integration Testing

_Integration testing_ dilakukan secara manual melalui _testing scenarios_:

**Skenario: Student membuat booking → Tutor menerima notifikasi**

1. _Student_ login di `/login`
2. _Student search tutor_ di `/dashboard/student/search`
3. _Student_ membuat _booking_ via `POST /api/bookings`
4. _Backend create booking record_ di database
5. _Backend create notification record_ untuk tutor
6. _Tutor_ login dan mengecek `/api/notifications`
7. _Tutor_ melihat notifikasi _booking_ baru

**[Snapshot/Log]:** _Testing flow_ di _development console_

```bash
# Terminal log saat testing
POST /api/bookings 201 Created
{
  "id": 1,
  "studentId": 1,
  "tutorId": 2,
  "subject": "Mathematics",
  "status": "pending"
}

# Notification created
INSERT INTO notifications (userId, type, message)
VALUES (2, 'new_booking', 'New booking request: Mathematics from John Doe')

GET /api/notifications 200 OK
[
  {
    "id": 1,
    "type": "new_booking",
    "message": "New booking request: Mathematics from John Doe",
    "isRead": false
  }
]
```

_Testing_ ini memverifikasi integrasi antara _booking API_, _database operations_, dan _notification system_ bekerja _end-to-end_.

## BAB VII: Integrasi & Kualitas - Pertemuan 9 & 10

### 7.1 Strategi Integrasi

Proyek menggunakan **Incremental Integration** dengan pendekatan bottom-up:

1. **Database Layer** - _Schema_ dan _migrations_ dibuat terlebih dahulu
2. **API Routes** - _Backend endpoints_ dibangun dan _tested_ secara individual
3. **Frontend Components** - _UI components_ dibuat dengan _mock data_
4. **Integration** - _Frontend_ terhubung dengan _backend APIs_
5. **End-to-End Testing** - _Full user flow testing_

Setiap modul di-_test_ secara _isolated_ sebelum diintegrasikan dengan modul lain, mengurangi _bug_ yang sulit dilacak.

### 7.2 Analisis Kualitas Kode (Static Analysis)

**TypeScript Compiler sebagai Static Analyzer:**

Tim menggunakan TypeScript dengan _strict mode_ sebagai _static analysis tool_ utama. _TypeScript compiler_ mendeteksi _type errors_, _null references_, dan _unused variables_ sebelum _runtime_.

**Snapshot Kode:** TypeScript configuration di [`tsconfig.json`](https://github.com/2oog/ppsi-ws25/blob/main/tsconfig.json)

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitAny": true,
    "strictNullChecks": true
    // ... other strict flags
  }
}
```

Dengan konfigurasi ini, kode harus memenuhi _type safety standards_ sebelum bisa di-_compile_. Contoh _error_ yang _caught_:

```typescript
// ❌ Error: Type 'string | undefined' is not assignable to type 'string'
const userId: string = session.user.id;

// ✅ Correct: Handle undefined case
const userId = session.user.id ?? 'default';
```

**Code Review Process:**

Meskipun tidak menggunakan _formal GitHub review_, tim melakukan _peer review_ secara manual sebelum _merge_ ke _main branch_. _Developer_ lain memeriksa:

- _Naming consistency_
- _Error handling completeness_
- _Type safety_
- _Code duplication_

## BAB VIII: Kesimpulan & Refleksi

### 8.1 Ringkasan Keberhasilan

Proyek TutorGo berhasil menerapkan berbagai teori konstruksi perangkat lunak yang dipelajari:

1. **Standar Pengkodean** - Konsistensi _naming_ dengan `camelCase` dan _strict_ TypeScript
2. **Modularisasi** - Pemisahan _concerns_ melalui _folder structure_ (`api/`, `components/`, `lib/`)
3. **Error Handling** - _Defensive programming_ dengan _validation_ dan _try-catch blocks_
4. **API Design** - _RESTful API_ dengan _semantic HTTP methods_
5. **Design Patterns** - _Repository pattern_ untuk _database abstraction_, _MVC pattern_ untuk _separation of concerns_
6. **Reusability** - Penggunaan _external libraries_ dan _environment-based configuration_
7. **Testing** - _Unit tests_ untuk database dan _manual integration testing_
8. **Quality Assurance** - _TypeScript static analysis_ untuk _type safety_

### 8.2 Kendala Teknis & Solusi

**Kendala:**

1. **Type Safety Complexity** - _Initial learning curve_ untuk _strict_ TypeScript

   - **Solusi:** _Gradual adoption_, _starting_ dengan `any` _types_ kemudian _refactor_ ke _proper types_

2. **Database Schema Changes** - Perubahan _schema_ memerlukan _migrations_ manual

   - **Solusi:** Menggunakan Drizzle _migrations_ untuk _version control database schema_

3. **Error Handling Boilerplate** - _Repetitive try-catch blocks_ di setiap _API route_

   - **Solusi:** Membuat _wrapper function_ atau _middleware_ untuk _centralized error handling_ (_future improvement_)

4. **Testing Coverage** - Belum ada _automated unit tests_ untuk semua _functions_
   - **Solusi:** Prioritas _manual testing_ untuk _critical paths_, _automated testing_ dapat ditambahkan di _future iterations_

### 8.3 Pembelajaran

Penerapan teori konstruksi dalam proyek nyata memberikan pemahaman mendalam tentang:

- Pentingnya _type safety_ untuk mengurangi _runtime errors_
- Modularisasi _code_ untuk _maintainability_
- _Defensive programming_ untuk _robust applications_
- _Balance_ antara _over-engineering_ dan _practical solutions_ untuk _academic projects_

**Link Repository:** [https://github.com/2oog/ppsi-ws25](https://github.com/2oog/ppsi-ws25)  
**Live Demo:** [https://tutorgo.ghi.im/](https://tutorgo.ghi.im/)

**Testing accounts**

Student:

- Email: <student@example.com>
- Password: f8ZdYc6fsNPYOBnS

Tutor:

- Email: <tutor@example.com>
- Password: f8ZdYc6fsNPYOBnS

Admin:

- Email: <admin@example.com>
- Password: f8ZdYc6fsNPYOBnS

## Lampiran: File-File dalam Laporan Ini

### A. Database Schema

- [`lib/db.ts`](https://github.com/2oog/ppsi-ws25/blob/main/lib/db.ts) - _Complete database schema_ dengan _relations_

### B. API Routes

- [`app/api/bookings/route.ts`](https://github.com/2oog/ppsi-ws25/blob/main/app/api/bookings/route.ts) - _Booking management API_
- [`app/api/auth/`](https://github.com/2oog/ppsi-ws25/tree/main/app/api/auth) - _Authentication endpoints_
- [`app/api/tutors/route.ts`](https://github.com/2oog/ppsi-ws25/tree/main/app/api/tutors) - _Tutor search & management_

### C. Configuration

- [`.env.example`](https://github.com/2oog/ppsi-ws25/blob/main/.env.example) - _Environment variables template_
- [`tsconfig.json`](https://github.com/2oog/ppsi-ws25/blob/main/tsconfig.json) - _TypeScript configuration_
- [`package.json`](https://github.com/2oog/ppsi-ws25/blob/main/package.json) - _Dependencies list_

### D. Documentation

- [`README.md`](https://github.com/2oog/ppsi-ws25/blob/main/README.md) - _Project overview_ dan _setup guide_
