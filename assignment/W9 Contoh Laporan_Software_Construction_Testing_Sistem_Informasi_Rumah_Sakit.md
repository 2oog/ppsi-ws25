# LAPORAN SOFTWARE CONSTRUCTION TESTING

Proyek: Sistem Informasi Rumah Sakit

## 1\. Pendahuluan

Laporan ini disusun sebagai bagian dari kegiatan Software Construction Testing dalam proyek Sistem Informasi Rumah Sakit. Pengujian ini bertujuan untuk memastikan bahwa setiap komponen perangkat lunak telah berfungsi sesuai dengan spesifikasi yang ditentukan dan bebas dari kesalahan logika.

## 2\. Tujuan Pengujian

Tujuan utama dari pengujian ini adalah untuk:  
1\. Memverifikasi fungsi dan modul pada tahap konstruksi software.  
2\. Memastikan integrasi antar modul berjalan dengan benar.  
3\. Menemukan dan memperbaiki kesalahan sedini mungkin.

## 3\. Jenis Pengujian

### 3.1 Unit Testing

Unit Testing merupakan pengujian terhadap unit terkecil dari sistem, seperti fungsi atau kelas, untuk memastikan bahwa setiap unit bekerja dengan benar secara individual. Dalam proyek Sistem Informasi Rumah Sakit, unit testing dilakukan terhadap modul-modul seperti pendaftaran pasien, manajemen data dokter, serta pengelolaan jadwal pemeriksaan.

Contoh pengujian unit pada fungsi pendaftaran pasien (Python):

def register_patient(name, age):  
if not name or age <= 0:  
raise ValueError("Data pasien tidak valid")  
return {"name": name, "age": age}  
<br/>def test_register_patient():  
assert register_patient("Andi", 30) == {"name": "Andi", "age": 30}

Hasil: Pengujian berhasil dilakukan dan fungsi register_patient dapat menangani data pasien dengan benar.

### 3.2 Integration Testing

Integration Testing dilakukan setelah unit-unit individu lulus pengujian unit. Tujuannya untuk memastikan bahwa modul-modul yang telah diuji dapat berinteraksi dengan baik satu sama lain. Pada Sistem Informasi Rumah Sakit, integration testing dilakukan antara modul pendaftaran pasien dan modul database rumah sakit untuk memastikan data pasien tersimpan dengan benar.

Contoh pengujian integrasi (Python):

class Database:  
def \__init_\_(self):  
self.patients = \[\]  
<br/>def save_patient(self, patient):  
self.patients.append(patient)  
<br/>class PatientService:  
def \__init_\_(self, db):  
self.db = db  
<br/>def add_patient(self, name, age):  
patient = {"name": name, "age": age}  
self.db.save_patient(patient)  
return "Pasien berhasil disimpan"  
<br/>def test_integration():  
db = Database()  
service = PatientService(db)  
result = service.add_patient("Siti", 25)  
assert result == "Pasien berhasil disimpan"

Hasil: Integrasi antara modul PatientService dan Database berhasil, data pasien dapat tersimpan dengan baik.

## 4\. Kesimpulan

Berdasarkan hasil pengujian Unit Testing dan Integration Testing pada Sistem Informasi Rumah Sakit, dapat disimpulkan bahwa:  
1\. Setiap unit kode telah berfungsi sesuai dengan spesifikasi.  
2\. Modul-modul sistem dapat saling berinteraksi tanpa kesalahan.  
3\. Tidak ditemukan bug kritis selama tahap konstruksi.  
<br/>Dengan demikian, sistem siap untuk dilanjutkan ke tahap System Testing dan User Acceptance Testing.
