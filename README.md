# 🐉 DonghuaStream

DonghuaStream adalah platform *streaming* Web App modern, cepat, dan minimalis yang dirancang khusus untuk memberikan pengalaman menonton Donghua (Animasi Tiongkok) terbaik tanpa gangguan iklan *pop-up*. 

Proyek ini menggunakan arsitektur **Frontend Vanilla JavaScript** yang ringan dipadukan dengan **Backend Node.js (Proxy & Cache)** untuk menjamin keamanan *API Key* dan performa kelas produksi (*production-ready*).

---

## ✨ Fitur Utama

### 🖥️ Frontend (Browser)
- **SPA (Single Page Application) Navigation:** Berpindah menu (Beranda, Jadwal, About) tanpa *reload* halaman.
- **Skeleton Loading UI:** Animasi *shimmer* modern saat memuat data, meningkatkan persepsi kecepatan (UX).
- **Infinite Scroll:** Memuat daftar Donghua secara otomatis saat pengguna melakukan *scroll* ke bawah menggunakan *Intersection Observer API*.
- **Live Search (Debounce):** Fitur pencarian *real-time* yang dioptimalkan dengan fungsi penundaan (*debounce*) agar tidak membebani *server*.
- **Responsive Dark Theme:** Desain UI/UX berwarna hitam-merah dengan kontras tinggi yang sempurna untuk *streaming* di layar HP maupun Desktop.

### ⚙️ Backend (Server Proxy)
- **API Key Protection:** Menyembunyikan *API Key* sumber daya (*Orbitcloud*) dari inspeksi *browser* publik.
- **In-Memory Caching:** Menggunakan `node-cache` untuk menyimpan *response* data sementara, mengurangi beban *request* ke sumber API utama secara drastis.
- **Rate Limiting:** Mencegah serangan *DDoS* atau *Spam Bot* dengan membatasi jumlah *request* berlebih dari satu alamat IP menggunakan `express-rate-limit`.
- **Response Compression:** Mengecilkan ukuran *payload* JSON menggunakan `compression` agar web terbuka lebih cepat dan hemat kuota.
- **Security Headers:** Dilengkapi dengan `helmet` untuk mengamankan *header HTTP* dari celah kerentanan web standar.

---

## 🛠️ Tech Stack

**Frontend:**
- HTML5 (Semantic Web)
- CSS3 (Native Flexbox, Grid, & Variables)
- Vanilla JavaScript (ES6+, DOM Manipulation)

**Backend:**
- Node.js
- Express.js
- Axios (HTTP Client)

---

## 📂 Struktur Direktori

```text
/streaming-donghua
├── .env                 # Variabel lingkungan rahasia (API Key)
├── .gitignore           # File yang diabaikan oleh Git
├── package.json         # Konfigurasi dependensi Node.js
├── server.js            # Entry point Backend (Proxy, Cache, Limit)
└── public/              # Folder Frontend (Aset Publik)
    ├── index.html       # Kerangka utama website
    ├── style.css        # Desain visual & animasi
    └── app.js           # Logika interaksi & pemanggilan API
