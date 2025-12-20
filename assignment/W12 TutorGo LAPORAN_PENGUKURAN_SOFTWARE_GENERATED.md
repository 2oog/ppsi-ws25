# LAPORAN PENGUKURAN KONSTRUKSI SOFTWARE

(Standar IEEE 1061 & ISO 9126)

## 1. Informasi Umum Proyek

**Proyek:** Sistem Informasi TutorGo (Platform Pencarian & Pemesanan Tutor)

**Teknologi:** Next.js 16.0.10, TypeScript, PostgreSQL (Drizzle ORM), Tailwind CSS, React 19

**Tim Pengembang**: Kelompok 2

**Tanggal Pelaporan:** 15 Desember 2025

**Repository:** [https://github.com/2oog/ppsi-ws25](https://github.com/2oog/ppsi-ws25)

**Live Demo:** [https://tutorgo.ghi.im/](https://tutorgo.ghi.im/)

**Versi:** 7

**Periode Pengukuran:** Fase Implementasi

**Durasi Rencana:** 7 minggu

**Durasi Aktual:** 4 minggu

**Total Kode:** 6,448 NCLOC (Non-Comment Lines of Code)

**Bug Ditemukan:** 2 (SonarQube)

**Bug Diperbaiki:** - (Tim tidak menghitung Runtime Bug pada saat pengembangan berlangsung, karena langsung terdeteksi berkat TSLint)

## 2. Tujuan Pengukuran

Laporan pengukuran ini disusun sesuai standar IEEE 1061 (Software Quality Metrics) dan ISO 9126 (Quality Model), dengan tujuan:

- Mengukur kualitas internal dan eksternal perangkat lunak
- Menilai efektivitas aktivitas konstruksi software
- Mengidentifikasi area yang memerlukan perbaikan kualitas
- Memastikan kesesuaian dengan standar kualitas

## 3. Ruang Lingkup

Ruang lingkup pengukuran mencakup:

- Unit kode (module/component) dalam direktori `app`, `components`, `lib`
- Aktivitas konstruksi pada periode tertentu
- Pengukuran kualitas: functionality, reliability, usability, efficiency, maintainability, portability (ISO 9126)
- Pengukuran metrik dasar (IEEE 1061): size, complexity, quality defect metrics

## 4. Metode & Metrik Pengukuran

### 4.1 Metrik Berdasarkan IEEE 1061:

- **Product Size:** LOC (Lines of Code)
- **Complexity Metrics:** Cyclomatic Complexity, Cognitive Complexity
- **Quality Metrics:** Defect Density, Code Smells, Duplications

### 4.2 Model Kualitas ISO 9126:

- **Functionality:** Correctness, Security
- **Reliability:** Maturity (Bug count)
- **Maintainability:** Analyzability (Code smells), Testability (Complexity)

### 4.3 Tools Pendukung:

- SonarQube untuk analisis kode (Measures & Issues export)
- Git & CI/CD pipeline
- Visual Studio Code Metrics

## 5. Hasil Pengukuran

### 5.1 Ukuran Produk (Product Size)

Total NCLOC: **6,448**

**Distribusi Modul (Estimasi dari Isu):**

- **Dashboard (`app/dashboard/*`):** Area utama antarmuka pengguna
- **API Routes (`app/api/*`):** Backend logic
- **Components (`components/*`):** Reusable UI parts

| No  | Aktivitas yang Diukur                   | Tujuan Pengukuran                       | Metrik / Rumus                          | Nilai Hasil    | Keterangan                                               |
| --- | --------------------------------------- | --------------------------------------- | --------------------------------------- | -------------- | -------------------------------------------------------- |
| 1   | Kode yang dikembangkan                  | Mengetahui volume kode baru yang dibuat | Total Lines of Code (LOC)               | 6,448 LOC      | Total NCLOC (SonarQube)                                  |
| 2   | Kode yang dimodifikasi                  | Mengukur perubahan kode lama            | (LOC diubah / LOC total) × 100%         | 163 (2.53%)    | Git log 4 minggu (added + deleted) [1]                   |
| 3   | Kode digunakan kembali                  | Menilai efisiensi reuse                 | (LOC reuse / LOC total) × 100%          | 3,410 (52.88%) | Estimasi dari 341 import statements [3]                  |
| 4   | Kode dihancurkan                        | Menilai efisiensi refactoring           | LOC dihapus                             | 2,334          | Git log 4 minggu (deleted lines) [2]                     |
| 5   | Kompleksitas kode                       | Menilai tingkat kerumitan logika        | Total Cyclomatic Complexity (CC)        | 620 (8.16 avg) | 76 TypeScript files, avg 8.16 CC/file [5]                |
| 6   | Statistik pemeriksaan kode              | Menilai kualitas hasil review           | Bug ditemukan / 1000 LOC                | 0.31 bug/KLOC  | 2 bugs dari SonarQube (parseInt issues)                  |
| 7   | Tingkat perbaikan & pencarian kesalahan | Menilai efektivitas QA                  | (Bug diperbaiki / Bug ditemukan) × 100% | 0 (0%)         | Bug SonarQube pending; runtime bugs fixed via TSLint [4] |
| 8   | Upaya (effort)                          | Mengukur total jam kerja tim            | Total jam kerja (orang × jam)           | ~12.13 Jam     | Technical debt repayment time (SonarQube estimate)       |
| 9   | Penjadwalan (schedule)                  | Menilai ketepatan waktu                 | ((Aktual - Rencana) / Rencana) × 100%   | -42.86%        | 4 minggu aktual vs 7 minggu rencana (ahead of schedule)  |

### 5.2 Kompleksitas Kode

**Total Complexity:** 620
**Cognitive Complexity Issues:**
Beberapa file memiliki kompleksitas kognitif yang tinggi (melebihi ambang batas 15), contohnya:

- `app/api/bookings/[id]/route.ts` (Score: 24) - **CRITICAL: Refactor required**

### 5.3 Defect & Quality Metrics

- **Code Smells:** 140 (Perlu perbaikan untuk maintainability)
- **Bugs Teridentifikasi:** 2 dari SonarQube (Rendah, namun perlu diperbaiki segera)
- **Vulnerabilities:** 0 (Sangat Baik)
- **Duplicated Lines Density:** 4.6% (Dapat diterima, < 5% target umum)
- **Coverage:** 0.0% (Perlu implementasi unit test)

### 5.4 Produktivitas Tim (Story Points)

Berdasarkan checklist di README.md, tim telah menyelesaikan **14 dari 18 feature tasks (77.8%)** dalam periode 4 minggu.

- **Sprint 1 (Minggu 1-2):** 8 tasks completed (Core authentication, notifications, dan tutor features)
- **Sprint 2 (Minggu 3-4):** 6 tasks completed (Student features, admin dashboard & verification)

**Average Velocity:** 7 tasks per sprint

**Feature Completion Rate:**

- Tutor features: 100%
- Site-wide: 80%
- Student: 75%
- Admin: 50%

## 6. Analisis & Interpretasi

- **Kualitas Kode (Maintainability):** Jumlah Code Smells (140) cukup signifikan untuk ukuran kode 6.4k LOC. Sebagian besar issue berkaitan dengan konvensi TypeScript (misal: `parseInt` vs `Number.parseInt`) dan unused imports.
- **Kompleksitas:** Secara umum terkendali (Total 620), namun terdapat hotspot kompleksitas tinggi di modul API (`bookings/[id]/route.ts`) yang berisiko bug logic.
- **Reliability:** Jumlah bug yang terdeteksi alat statis sangat rendah (2), menandakan kode cukup stabil secara sintaks, namun coverage 0% menandakan risiko logic runtime belum teruji otomatis.
- **Security:** Tidak ada vulnerability yang terdeteksi, aspek keamanan (static analysis) baik.

## 7. Rekomendasi

1.  **Refactoring Prioritas Tinggi:** Selesaikan Cognitive Complexity issue di `app/api/bookings/[id]/route.ts` untuk mempermudah maintenance.
2.  **Cleanup Code Smells:** Lakukan cleanup massal untuk fix minor issues seperti `unused imports` dan `parseInt` consistency. Ini akan mengurangi "Noise" dalam laporan kualitas.
3.  **Implementasi Automated Testing:** Coverage 0% adalah risiko terbesar saat ini. Mulai tambahkan unit test untuk `lib/` functions dan integration test untuk API routes.
4.  **Monitoring:** Lakukan scan rutin setiap merge request untuk menjaga Code Smells tetap rendah.

## 8. Kesimpulan

Pengukuran konstruksi software menunjukkan bahwa **Sistem Informasi TutorGo** memiliki dasar kode yang cukup bersih (0 vulnerabilities, low bug count) namun memiliki hutang teknis pada aspek maintainability (code smells) dan testing (0% coverage). Dengan melakukan refactoring pada modul kompleks dan mulai menerapkan testing otomatis, kualitas software dapat ditingkatkan secara signifikan memenuhi standar ISO 9126 sepenuhnya.

## Footnote

[1]

```ps1
# Hitung total lines yang diubah dalam periode tertentu
$stats = git log --since="4 weeks ago" --numstat --pretty="%H" | Select-String "^\d" | ForEach-Object { $_.Line -split "\s+" }
$totalAdded = ($stats | Select-Object -Index 0 -OutVariable added | Measure-Object -Sum).Sum
$totalDeleted = ($stats | Select-Object -Index 1 | Measure-Object -Sum).Sum
$totalModified = $totalAdded + $totalDeleted

# Hitung persentase
$percentage = [math]::Round(($totalModified / 6448) * 100, 2)
Write-Host "Total Lines Modified: $totalModified"
Write-Host "Percentage: $percentage%"
```

[2]

```ps1
# Total baris yang dihapus dalam periode tertentu
$deletedLines = git log --since="4 weeks ago" --numstat --pretty="%H" | Select-String "^\d" | ForEach-Object { ($_.Line -split "\s+")[1] } | Measure-Object -Sum | Select-Object -ExpandProperty Sum
Write-Host "Total Deleted Lines: $deletedLines"
```

[3]

```ps1
# Hitung import statements di seluruh kode TypeScript/JavaScript
$importCount = git grep -h "^import " -- "*.ts" "*.tsx" "*.js" "*.jsx" | Measure-Object | % Count
$estimatedReuseLOC = $importCount * 10 # Estimasi rata-rata 10 LOC per import
$reusePercentage = [math]::Round(($estimatedReuseLOC / 6448) * 100, 2)

"Estimated Reuse LOC: $estimatedReuseLOC"
"Reuse Percentage: $reusePercentage%"
```

[4]

```ps1
# Hitung commit yang memperbaiki bug (mencari kata "fix", "bug", "resolve")
$bugFixCommits = (git log --since="4 weeks ago" --grep="fix\|bug\|resolve" -i --oneline | Measure-Object).Count
$bugFixRate = [math]::Round(($bugFixCommits / 2) * 100, 2)  # 2 adalah total bug ditemukan
Write-Host "Bug Fix Commits: $bugFixCommits"
Write-Host "Bug Fix Rate: $bugFixRate%"
```

[5]

```ps1
$fileCount = (Get-ChildItem -Path .\app,.\components,.\lib -Include *.ts,*.tsx -Recurse | Measure-Object).Count
$avgComplexity = [math]::Round(620 / $fileCount, 2)
Write-Host "Average Complexity per File: $avgComplexity"
Write-Host "Total Files: $fileCount"
```
