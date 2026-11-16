# PPB Modul 6 — LiveTemp

Aplikasi monitoring suhu real-time berbasis React Native + Expo untuk Praktikum Pemrograman Perangkat Bergerak Modul 6. Data sensor dikirim lewat MQTT, alarm yang terpicu disimpan ke PostgreSQL (Neon) melalui REST API.

## Fitur

- **Monitoring** — suhu live dari MQTT, indikator koneksi, batas suhu aktif, history alarm yang terpicu.
- **Pagination** — riwayat alarm ditampilkan 5 baris per halaman dengan tombol **Sebelumnya** dan **Berikutnya**.
- **Control** — atur batas suhu (threshold) beserta catatan, lengkap dengan validasi dan riwayat threshold.
- **Profil** — informasi kelompok, anggota beserta NIM, topik MQTT, dan versi aplikasi.
- **Splash screen kustom** — tampil saat aplikasi dibuka, dengan animasi pulse dan progress bar.
- **Animasi orb** — sphere temperature dibuat dari band lintang yang berputar, beriak, dan punya aura mengikuti status suhu.
- Panduan singkat (guide overlay), pull-to-refresh, dan animasi transisi antar kartu.

## Struktur

```
PPB-Modul6/
├── app/                 # Aplikasi Expo (React Native)
│   ├── App.js           # Navigasi tab + splash screen
│   ├── app.json         # Konfigurasi Expo (backendUrl, MQTT)
│   └── src/
│       ├── components/  # DataTable, Pagination, TempOrb, SplashScreen, GuideOverlay
│       ├── hooks/       # useMqttSensor, useGuide
│       ├── screens/     # MonitoringScreen, ControlScreen, ProfileScreen
│       └── services/    # api, config, storage
├── backend/             # REST API Express + PostgreSQL
├── sensor-simulator/    # Publisher MQTT + pengirim data terpicu
└── database/schema.sql  # Skema tabel
```

## Menjalankan

1. **Database** — buat tabel di Neon dengan menjalankan `database/schema.sql`, lalu isi `backend/.env`:

   ```env
   DATABASE_URL=postgresql://USER:PASSWORD@YOUR_NEON_HOST/neondb?sslmode=require
   PORT=5002
   ```

2. **Backend**

   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Sensor simulator**

   ```bash
   cd sensor-simulator
   npm install
   npm start
   ```

   Samakan `TOPIC` di `sensor-simulator/index.js` dengan topik di `app/app.json`.

4. **Aplikasi**

   ```bash
   cd app
   npm install
   npx expo start
   ```

   Sesuaikan IP LAN komputer pada `app/app.json` (`extra.backendUrl`) dan topik MQTT (`extra.mqtt.topic`), lalu buka lewat Expo Go.

## Implementasi tambahan (7.6)

| No | Fitur | Lokasi |
| --- | --- | --- |
| 7.6.1 | Splash screen kustom | `app/src/components/SplashScreen.js` |
| 7.6.2 | Pagination halaman Monitoring | `app/src/components/Pagination.js`, `app/src/screens/MonitoringScreen.js` |
| 7.6.3 | Halaman Profil kelompok | `app/src/screens/ProfileScreen.js`, tab `Profil` di `App.js` |
| 7.6.4 | Animasi sphere baru | `app/src/components/TempOrb.js` |

Splash dibuat sebagai overlay JavaScript (bukan native splash) supaya tetap berjalan di Expo Go tanpa development build.

## Kelompok 21

| Nama | NIM |
| --- | --- |
| Aisha Alida Putri | 21120124130082 |
| Oktavia Damayanti | 21120124120025 |
| Rizkia Rahman | 21120124130086 |
| Shata' Hibrizi Al Fa'iq | 21120123130066 |

Praktikum Pemrograman Perangkat Bergerak · Modul 6 · 2026
