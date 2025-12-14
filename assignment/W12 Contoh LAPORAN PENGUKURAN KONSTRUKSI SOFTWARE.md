# LAPORAN PENGUKURAN KONSTRUKSI SOFTWARE

(Standar IEEE 1061 & ISO 9126)

## 1\. Informasi Umum Proyek

**Proyek:** Sistem Informasi TutorGo (Platform Pencarian & Pemesanan Tutor)

**Teknologi:** Next.js 15, TypeScript, PostgreSQL (Drizzle ORM), Tailwind CSS

**Tim Pengembang**: Kelompok 2

**Tanggal Pelaporan:** 15 Desember 2025

**Repository:** [https://github.com/2oog/ppsi-ws25](https://github.com/2oog/ppsi-ws25)

**Live Demo:** [https://tutorgo.ghi.im/](https://tutorgo.ghi.im/)

**Versi:** 7

**Periode Pengukuran:** Sprint 1 / Fase Implementasi

**Durasi Rencana:** 8 minggu

Durasi Aktual: 6 minggu

Total Kode: ….. LOC

Bug Ditemukan: … | Bug Diperbaiki: …

## 2\. Tujuan Pengukuran

Laporan pengukuran ini disusun sesuai standar IEEE 1061 (Software Quality Metrics)

dan ISO 9126 (Quality Model), dengan tujuan:

- Mengukur kualitas internal dan eksternal perangkat lunak

- Menilai efektivitas aktivitas konstruksi software

- Mengidentifikasi area yang memerlukan perbaikan kualitas

- Memastikan kesesuaian dengan standar kualitas

## 3\. Ruang Lingkup

Ruang lingkup pengukuran mencakup:

- Unit kode (module/component)

- Aktivitas konstruksi pada periode tertentu

- Pengukuran kualitas: functionality, reliability, usability, efficiency, maintainability, portability (ISO 9126)

- Pengukuran metrik dasar (IEEE 1061): size, complexity, quality defect metrics

## 4\. Metode & Metrik Pengukuran

4.1 Metrik Berdasarkan IEEE 1061:

- Product Size: LOC, Function Points

- Complexity Metrics: Cyclomatic Complexity

- Quality Metrics: Defect Density, Faults per KLOC

  4.2 Model Kualitas ISO 9126:

- Functionality: correctness, security

- Reliability: maturity, fault tolerance

- Usability: understandability, operability

- Efficiency: time behavior, resource utilization

- Maintainability: analyzability, changeability, testability

- Portability: adaptability, installability

  4.3 Tools Pendukung:

- SonarQube untuk analisis kode

- Git & CI/CD pipeline

- JMeter untuk performa

- Visual Studio Code Metrics

## 5\. Hasil Pengukuran

5.1 Ukuran Produk (Product Size)

Module A - LOC: 2300 | FP: 12

Module B - LOC: 1100 | FP: 6

Module C - LOC: 1500 | FP: 8

| No  | Aktivitas yang Diukur                   | Tujuan Pengukuran                       | Metrik / Rumus                          | Nilai Hasil | Keterangan                   |
| --- | --------------------------------------- | --------------------------------------- | --------------------------------------- | ----------- | ---------------------------- |
| 1   | Kode yang dikembangkan                  | Mengetahui volume kode baru yang dibuat | Total Lines of Code (LOC)               | 12.000 LOC  | Modul login & dashboard baru |
| 2   | Kode yang dimodifikasi                  | Mengukur perubahan kode lama            | (LOC diubah / LOC total) × 100%         | 10%         | Penyesuaian fitur pembayaran |
| 3   | Kode digunakan kembali                  | Menilai efisiensi reuse                 | (LOC reuse / LOC total) × 100%          | 40%         | Reuse modul user management  |
| 4   | Kode dihancurkan                        | Menilai efisiensi refactoring           | LOC dihapus                             | 1.500 LOC   | Hapus kode duplikat lama     |
| 5   | Kompleksitas kode                       | Menilai tingkat kerumitan logika        | Cyclomatic Complexity (CC)              | 9           | Masih dalam batas aman       |
| 6   | Statistik pemeriksaan kode              | Menilai kualitas hasil review           | Bug ditemukan / 1000 LOC                | 17 bug/KLOC | Ditemukan dari code review   |
| 7   | Tingkat perbaikan & pencarian kesalahan | Menilai efektivitas QA                  | (Bug diperbaiki / Bug ditemukan) × 100% | 80%         | Perbaikan bug mingguan       |
| 8   | Upaya (effort)                          | Mengukur total jam kerja tim            | Total jam kerja (orang × jam)           | 1.120 jam   | 4 dev × 280 jam              |
| 9   | Penjadwalan (schedule)                  | Menilai ketepatan waktu                 | ((Aktual - Rencana) / Rencana) × 100%   | +16,7%      | Terlambat 1 minggu           |

## Narasi Penjelasan

Pada fase konstruksi, tim menghasilkan total 12.000 baris kode baru, dengan 40% reuse dari modul lama. Proses refactoring menghapus sekitar 1.500 LOC yang tidak efisien. Kompleksitas kode rata-rata (Cyclomatic Complexity) adalah 9, masih dalam kategori aman. Dari hasil code review, ditemukan 17 bug per 1000 LOC, dengan 80% bug berhasil diperbaiki dalam sprint yang sama. Upaya total konstruksi mencapai 1.120 jam kerja, dengan keterlambatan 1 minggu (16,7%) dibandingkan jadwal awal.

5.2 Kompleksitas Kode (Cyclomatic Complexity)

Module A - Avg: 4 | Max: 9 (Baik)

Module B - Avg: 8 | Max: 16 (Perlu Refactoring)

Module C - Avg: 5 | Max: 10 (Baik)

5.3 Defect & Quality Metrics

Code Smells: 15 (Target < 20) - OK

Bugs Teridentifikasi: 3 (Target < 5) - OK

Vulnerabilities: 1 - Perlu perbaikan

5.4 Produktivitas Tim

Sprint 1 - 20 Story Points

Sprint 2 - 24 Story Points

Sprint 3 - 23 Story Points

## 6\. Analisis & Interpretasi

- Kompleksitas tinggi pada Module B berpotensi meningkatkan defect rate.

- Standar kualitas ISO 9126 sebagian besar terpenuhi.

- Produktivitas tim konsisten dengan target sprint.

- Kualitas kode secara umum memenuhi standar, namun perlu mitigasi pada vulnerabilities.

## 7\. Rekomendasi

- Melakukan refactoring pada fungsi dengan kompleksitas > 15.

- Memperketat unit testing di modul B.

- Memperbaiki vulnerabilities sebelum tahap integrasi.

- Monitoring lebih intens pada reliability & maintainability.

## 8\. Kesimpulan

Pengukuran konstruktsi software menunjukkan bahwa produk berada pada kualitas yang dapat diterima berdasarkan standar IEEE 1061 dan ISO 9126. Beberapa area masih memerlukan perbaikan, namun tidak mempengaruhi jadwal dan kualitas secara signifikan.
