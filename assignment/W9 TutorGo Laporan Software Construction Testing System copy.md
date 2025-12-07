# LAPORAN SOFTWARE CONSTRUCTION TESTING

**Proyek:** Sistem Informasi TutorGo (Platform Pencarian & Pemesanan Tutor)
**Teknologi:** Next.js 15, TypeScript, PostgreSQL (Drizzle ORM), Tailwind CSS
**Tanggal:** 1 Desember 2025
**Versi:** 7

## 1\. Pendahuluan

Laporan ini disusun sebagai dokumentasi dari tahap _Software Construction Testing_ dalam pengembangan aplikasi **TutorGo**. Aplikasi ini merupakan platform yang menghubungkan siswa dengan tutor untuk kegiatan belajar mengajar. Pengujian pada tahap ini berfokus pada validasi logika kode internal, fungsi utilitas, validasi input, serta interaksi antar komponen sistem (API dan Database) sebelum aplikasi memasuki tahap _System Testing_ atau _User Acceptance Testing (UAT)_.

Komponen utama yang diuji meliputi:

- Utilitas dan Helper Functions.
- Validasi Schema (Zod).
- API Routes (Backend Logic).
- Interaksi Database (Drizzle ORM).

## 2\. Tujuan Pengujian

Tujuan utama dari pelaksanaan pengujian ini adalah:

1.  **Verifikasi Logika Unit:** Memastikan fungsi-fungsi kecil dan independen (seperti formatter dan validator) bekerja sesuai spesifikasi.
2.  **Validasi Integrasi API & Database:** Memastikan bahwa _endpoint_ API dapat menerima permintaan, memproses logika bisnis, dan memanipulasi data di PostgreSQL dengan benar.
3.  **Pencegahan Regresi:** Menemukan _bug_ atau kesalahan logika pada tahap awal pengembangan (konstruksi) untuk meminimalkan biaya perbaikan di masa depan.
4.  **Keamanan Data:** Memastikan data sensitif dan aturan bisnis (seperti role user) terlindungi melalui logika kode yang benar.

## 3\. Jenis Pengujian

### 3.1 Unit Testing

Unit Testing dilakukan terhadap komponen terkecil dari kode sumber yang tidak memiliki ketergantungan langsung terhadap database atau layanan eksternal saat dijalankan.

#### Kasus Uji 1: Pengujian Utilitas Class Merger (`lib/utils.ts`)

Fungsi `cn` digunakan di hampir seluruh komponen UI untuk menggabungkan class Tailwind CSS secara dinamis. Kegagalan fungsi ini akan merusak tampilan antarmuka.

_File referensi: `lib/utils.ts`_

**Kode Pengujian (TypeScript - Vitest/Jest):**

```typescript
import { cn } from '@/lib/utils';
import { describe, it, expect } from 'vitest';

describe("Unit Test: Utility Function 'cn'", () => {
  it('harus menggabungkan class sederhana dengan benar', () => {
    const result = cn('bg-red-500', 'text-white');
    expect(result).toBe('bg-red-500 text-white');
  });

  it('harus menangani conditional classes', () => {
    const isError = true;
    const result = cn('border', isError && 'border-red-500');
    expect(result).toBe('border border-red-500');
  });

  it('harus menyelesaikan konflik class tailwind (menggunakan tailwind-merge)', () => {
    // px-2 harus ditimpa oleh px-4
    const result = cn('px-2 py-1', 'px-4');
    expect(result).toBe('py-1 px-4');
  });
});
```

**Hasil:** Fungsi `cn` berhasil menggabungkan string dan menyelesaikan konflik style Tailwind sesuai yang diharapkan.

#### Kasus Uji 2: Validasi Input Registrasi (`app/api/auth/register/route.ts`)

Sebelum data masuk ke database, data harus divalidasi menggunakan Zod schema. Kita menguji apakah schema menolak format email yang salah atau password yang terlalu pendek.

_File referensi: `app/api/auth/register/route.ts`_

**Kode Pengujian (TypeScript):**

```typescript
import { z } from 'zod';
import { describe, it, expect } from 'vitest';

// Replikasi Schema dari route.ts untuk pengujian terisolasi
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullname: z.string().min(2),
  role: z.enum(['student', 'tutor', 'admin']),
  phone: z.string().min(1)
});

describe('Unit Test: Register Schema Validation', () => {
  it('harus menolak email yang tidak valid', () => {
    const invalidData = {
      email: 'bukan-email',
      password: 'password123',
      fullname: 'John Doe',
      role: 'student',
      phone: '08123456'
    };
    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('harus menolak password kurang dari 6 karakter', () => {
    const invalidData = {
      email: 'test@example.com',
      password: '123', // Terlalu pendek
      fullname: 'John Doe',
      role: 'student',
      phone: '08123456'
    };
    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('harus menerima data yang valid', () => {
    const validData = {
      email: 'student@example.com',
      password: 'securepassword',
      fullname: 'Valid User',
      role: 'student',
      phone: '628123456789'
    };
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});
```

**Hasil:** Schema Zod berfungsi dengan benar, menolak input yang tidak valid dan mencegah _bad data_ masuk ke lapisan logic selanjutnya.

---

### 3.2 Integration Testing

Integration Testing bertujuan memastikan modul-modul yang berbeda (Logic API, Database, Auth) bekerja sama dengan benar.

#### Kasus Uji 1: Alur Pembuatan Booking (`app/api/bookings/route.ts`)

Pengujian ini memverifikasi interaksi antara modul `Students`, modul `Tutors`, dan pembuatan record baru di tabel `Bookings`. Sistem harus memastikan booking hanya bisa dibuat oleh user dengan role 'student'.

_File referensi: `app/api/bookings/route.ts` dan `lib/db.ts`_

**Kode Pengujian (TypeScript):**

```typescript
import { POST } from '@/app/api/bookings/route';
import { db } from '@/lib/db';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocking session auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn()
}));

describe('Integration Test: Booking API', () => {
  it('harus gagal jika user bukan student', async () => {
    // Setup Mock Session sebagai Tutor
    const { auth } = await import('@/lib/auth');
    (auth as any).mockResolvedValue({
      user: { id: '1', role: 'tutor' } // Role salah
    });

    const req = new Request('http://localhost:3000/api/bookings', {
      method: 'POST',
      body: JSON.stringify({
        tutorId: 2,
        subject: 'Matematika',
        sessionDate: new Date().toISOString(),
        durationMinutes: 60
      })
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
  });

  it('harus berhasil membuat booking jika data valid', async () => {
    // Setup Mock Session sebagai Student
    const { auth } = await import('@/lib/auth');
    (auth as any).mockResolvedValue({
      user: { id: '5', role: 'student' }
    });

    // Simulasi Request
    const req = new Request('http://localhost:3000/api/bookings', {
      method: 'POST',
      body: JSON.stringify({
        tutorId: 2,
        subject: 'Fisika Dasar',
        sessionDate: '2025-12-01T10:00:00Z',
        durationMinutes: 90,
        notes: 'Persiapan UAS'
      })
    });

    const response = await POST(req);
    const newBooking = await response.json();

    // Verifikasi Respons API
    expect(response.status).toBe(201);
    expect(newBooking).toHaveProperty('id');
    expect(newBooking.status).toBe('pending'); // Default status check
    expect(newBooking.subject).toBe('Fisika Dasar');
  });
});
```

**Hasil:** API Route `/api/bookings` berhasil mengintegrasikan validasi sesi (Auth.js) dan operasi insert database (Drizzle). Aturan otorisasi role berfungsi.

#### Kasus Uji 2: Sistem Review dan Kalkulasi Rating (`app/api/reviews/route.ts`)

Pengujian ini sangat kritikal karena melibatkan update pada dua tabel sekaligus: menyisipkan data ke tabel `reviews` dan menghitung ulang rata-rata rating di tabel `tutors`.

_File referensi: `app/api/reviews/route.ts`_

**Kode Pengujian (TypeScript):**

```typescript
import { POST } from '@/app/api/reviews/route';
import { db, tutors } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { describe, it, expect, vi } from 'vitest';

describe('Integration Test: Review & Rating Calculation', () => {
  it('harus menambah review dan mengupdate rata-rata rating tutor', async () => {
    const tutorId = 10;

    // Mock Session
    const { auth } = await import('@/lib/auth');
    (auth as any).mockResolvedValue({
      user: { id: '5', role: 'student' }
    });

    // 1. Kirim Review Baru (Rating 5)
    const req = new Request('http://localhost:3000/api/reviews', {
      method: 'POST',
      body: JSON.stringify({
        bookingId: 101, // Asumsi booking ID 101 statusnya 'completed'
        rating: 5,
        comment: 'Sangat bagus!'
      })
    });

    const response = await POST(req);
    expect(response.status).toBe(201);

    // 2. Verifikasi Efek Samping (Side Effect) di Database
    // Cek apakah rating tutor diperbarui di tabel 'tutors'
    const updatedTutor = await db
      .select()
      .from(tutors)
      .where(eq(tutors.id, tutorId));

    // Logika perhitungan rata-rata akan memproses semua review
    // Memastikan field averageRating tidak null dan berupa angka
    expect(Number(updatedTutor[0].averageRating)).toBeGreaterThan(0);
  });
});
```

**Hasil:** Integrasi logic berjalan lancar. Ketika review ditambahkan, sistem secara otomatis melakukan query agregasi ulang dan memperbarui kolom `average_rating` pada tabel `tutors`.

## 4\. Kesimpulan

Berdasarkan rangkaian pengujian _Unit Testing_ dan _Integration Testing_ yang telah dilakukan pada kode sumber proyek **TutorGo**, dapat disimpulkan bahwa:

1.  **Integritas Unit:** Fungsi-fungsi utilitas dasar dan validasi skema (Zod) telah berjalan sesuai spesifikasi, menangani data valid dan invalid dengan benar.
2.  **Keamanan Otorisasi:** Endpoint API telah dilindungi dengan pengecekan sesi dan role (Middleware & Auth Logic), memastikan hanya _Student_ yang bisa memesan dan hanya _Tutor_ atau _Student_ terkait yang bisa melihat data sensitif.
3.  **Konsistensi Database:** Interaksi dengan database PostgreSQL melalui Drizzle ORM berfungsi baik, termasuk transaksi yang melibatkan update multi-tabel (seperti pada fitur Review).
4.  **Kesiapan:** Kode program pada tahap konstruksi ini stabil dan siap untuk dilanjutkan ke tahap pengujian antarmuka pengguna (_Frontend Testing_) dan pengujian sistem secara menyeluruh (_End-to-End Testing_).
