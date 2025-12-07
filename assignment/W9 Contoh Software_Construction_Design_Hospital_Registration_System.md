# Software Construction Design Document

System: Hospital Registration System

Version: 1.0

Date: 3 November 2025

## 1\. Pendahuluan

Dokumen ini menjelaskan rancangan teknis (Software Construction Design) untuk sistem Pendaftaran Pasien Rumah Sakit. Dokumen ini menjadi pedoman bagi tim pengembang dalam proses implementasi, pengujian, dan pemeliharaan sistem.

## 2\. Tujuan

Tujuan dari dokumen ini adalah untuk memberikan spesifikasi teknis yang rinci dari setiap modul, struktur data, algoritma, antarmuka, dan mekanisme penanganan kesalahan pada sistem Pendaftaran Pasien Rumah Sakit.

## 3\. Deskripsi Umum Sistem

Sistem Pendaftaran Pasien Rumah Sakit berfungsi untuk mengelola proses pendaftaran pasien baru dan lama secara digital. Sistem mencatat identitas pasien, jadwal pemeriksaan, serta menghasilkan nomor antrian untuk pemeriksaan.

## 4\. Arsitektur dan Modul

| Modul              | Deskripsi                                                 |
| ------------------ | --------------------------------------------------------- |
| PatientModule      | Mengelola data pasien (tambah, ubah, hapus, cari).        |
| RegistrationModule | Mengatur proses pendaftaran pasien baru dan lama.         |
| DoctorModule       | Mengatur data dokter dan jadwal praktik.                  |
| QueueModule        | Mengatur sistem antrian pasien di klinik atau poli.       |
| DatabaseModule     | Menyimpan dan mengambil data dari basis data rumah sakit. |

## 5\. Desain Kelas (Class Design)

Berikut adalah contoh desain kelas utama dalam sistem.

+------------------+  
| Patient |  
+------------------+  
| - patientID |  
| - name |  
| - birthDate |  
| - address |  
+------------------+  
| + register() |  
| + updateData() |  
| + getHistory() |  
+------------------+

## 6\. Desain Algoritma dan Flowchart

Flowchart Proses Registrasi Pasien:

Start
↓  
Input Data Pasien Baru
↓  
Validasi Data
→ (Data Tidak Lengkap) → Tampilkan Error → Kembali Input
↓  
Simpan ke Database
↓  
Tampilkan Nomor Antrian
↓  
End

## 7\. Desain API / Interface

| Endpoint                | Method | Deskripsi                             |
| ----------------------- | ------ | ------------------------------------- |
| /api/patient/register   | POST   | Menambahkan pasien baru ke sistem.    |
| /api/patient/{id}       | GET    | Mengambil data pasien berdasarkan ID. |
| /api/doctor/list        | GET    | Mengambil daftar dokter aktif.        |
| /api/registration/queue | GET    | Mengambil nomor antrian pasien.       |

## 8\. Pseudocode Proses Registrasi

function registerPatient(data):  
if validate(data) == False:  
return 'Error: Data tidak lengkap'  
saveToDatabase(data)  
queueNumber = generateQueue()  
return f'Pendaftaran berhasil. Nomor antrian: {queueNumber}'

## 9\. Struktur Data

Tabel utama yang digunakan dalam sistem:

| Tabel         | Deskripsi                               |
| ------------- | --------------------------------------- |
| patients      | Menyimpan data identitas pasien.        |
| doctors       | Menyimpan data dokter dan spesialisasi. |
| registrations | Menyimpan data pendaftaran pasien.      |
| queues        | Menyimpan data antrian pasien.          |

## 10\. Penanganan Kesalahan (Error Handling)

Sistem harus menangani kesalahan seperti input data tidak valid, koneksi database gagal, atau API tidak responsif. Setiap error akan dicatat di log sistem untuk keperluan debugging dan audit.

## 11\. Standar Kode dan Gaya Penulisan

1\. Gunakan penamaan variabel dengan format camelCase.  
2\. Gunakan komentar Javadoc untuk setiap fungsi.  
3\. Terapkan prinsip DRY (Don't Repeat Yourself).  
4\. Setiap modul harus memiliki minimal satu unit test.

## 12\. Rencana Pengujian Unit

Pengujian unit dilakukan untuk setiap fungsi utama pada modul. Contoh pengujian:  
\- registerPatient(): menguji validasi dan penyimpanan data pasien.  
\- generateQueue(): menguji logika penentuan nomor antrian.  
\- updateData(): memastikan data pasien dapat diubah dengan benar.

## 13\. Kesimpulan

Dokumen ini menjadi panduan teknis bagi tim pengembang dalam tahap konstruksi perangkat lunak. Dengan mengikuti desain ini, diharapkan implementasi sistem pendaftaran pasien dapat berjalan efisien, aman, dan terstruktur.
