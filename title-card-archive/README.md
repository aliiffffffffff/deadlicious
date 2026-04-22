# deadlicious' title card archive

---

## DAFTAR ISI
1. Buat repo baru di GitHub
2. Upload project ke GitHub
3. Edit REPO_NAME di GitHub
4. Aktifkan GitHub Pages
5. Setup Google Sheets
6. Menambah gambar baru (workflow rutin)
7. Troubleshooting

---

## STEP 1 — Buat repo baru di GitHub

1. Login ke https://github.com
2. Klik tombol **+** di pojok kanan atas → **New repository**
3. Isi:
   - **Repository name**: bebas, tapi tidak boleh ada spasi — gunakan `-`. Contoh: `title-card-archive`
   - **Description**: boleh dikosongkan
   - Pilih **Public** ✓ (harus Public supaya GitHub Pages bisa aktif gratis)
   - Jangan centang apapun di bagian "Initialize this repository"
4. Klik **Create repository**
5. Catat nama repo yang kamu buat — akan dipakai di Step 3

---

## STEP 2 — Upload project ke GitHub

1. Di halaman repo yang baru dibuat, klik **Add file** → **Upload files**
2. Extract file ZIP (`title-card-archive.zip`) di laptopmu
3. Drag & drop seluruh isi foldernya ke area upload:
   `index.html`, `css/`, `js/`, `images/`, `README.md`
4. Di bagian **Commit changes**, ketik pesan singkat, misal: `first upload`
5. Klik **Commit changes**
6. Tunggu proses upload selesai

> **Catatan:** GitHub web hanya bisa upload maksimal 100 file sekaligus.
> Kalau gambarmu sudah banyak, upload dulu file-file kode (`index.html`, `css/`, `js/`, `README.md`),
> lalu upload folder `images/` per dekade secara terpisah lewat **Add file → Upload files** lagi.

---

## STEP 3 — Edit REPO_NAME di GitHub

Setelah semua file terupload, sesuaikan nama repo di file `js/main.js` langsung dari GitHub:

1. Di halaman repo, klik folder **js** → klik file **main.js**
2. Klik ikon **pensil** (Edit this file) di pojok kanan atas file
3. Di baris paling atas, cari:
   ```js
   const REPO_NAME = 'title-card-archive';
   ```
4. Ganti `'title-card-archive'` dengan nama repo yang kamu buat di Step 1.
   Contoh, kalau nama repomu `film-archive`:
   ```js
   const REPO_NAME = 'film-archive';
   ```
5. Klik **Commit changes** → **Commit changes** lagi

---

## STEP 4 — Aktifkan GitHub Pages

1. Di halaman repo, klik tab **Settings**
2. Di sidebar kiri, klik **Pages**
3. Di bagian **Source**, pilih:
   - Branch: **main**
   - Folder: **/ (root)**
4. Klik **Save**
5. Tunggu 1–3 menit, lalu refresh halaman
6. Akan muncul URL websitemu:
   ```
   https://username.github.io/nama-repo
   ```

---

## STEP 5 — Setup Google Sheets

### Tambah kolom `filename`
Di setiap sheet dekade, tambah kolom ke-4 (setelah Director) dengan header `filename`.

Urutan kolom harus:
| A     | B    | C        | D        |
|-------|------|----------|----------|
| title | year | director | filename |

Isi kolom `filename` dengan nama file gambarnya saja, contoh: `mulholland-drive.jpg`

**Aturan penamaan file gambar:**
- Huruf kecil semua
- Spasi diganti `-`
- Hapus karakter special `( ) : , ' !`
- Contoh: `Eternal Sunshine of the Spotless Mind.jpg` → `eternal-sunshine-of-the-spotless-mind.jpg`

Nama file di kolom `filename` harus **sama persis** dengan nama file yang ada di folder `images/`.

### Publish Sheet ke web
1. **File** → **Share** → **Publish to web**
2. Pilih **Entire Document** → **Web Page**
3. Klik **Publish** → konfirmasi

Setelah ini, setiap kamu tambah atau edit data di Google Sheets, website otomatis update tanpa perlu upload ulang ke GitHub.

---

## STEP 6 — Menambah gambar baru (workflow rutin)

Setiap kali punya title card baru:

1. Rename file gambar sesuai aturan (huruf kecil, spasi jadi `-`)
2. Catat nama filenya di kolom `filename` Google Sheets → data di website otomatis update
3. Upload gambar ke GitHub:
   - Buka repo di GitHub
   - Masuk ke folder `images/` → pilih subfolder dekade yang sesuai (misal `2001-2010/`)
   - Klik **Add file** → **Upload files**
   - Upload file gambarnya
   - Klik **Commit changes**

Selesai — gambar langsung muncul di website.

---

## TROUBLESHOOTING

**Website tidak bisa dibuka**
→ Pastikan repo di-set Public, bukan Private
→ Tunggu beberapa menit setelah mengaktifkan Pages, lalu refresh

**Data film tidak muncul / loading terus**
→ Pastikan Google Sheet sudah di-publish (Step 5)
→ Cek nama tab sheet harus persis sama: `1921-1930`, `2001-2010`, dst

**Gambar tidak muncul**
→ Cek nama file di kolom `filename` harus sama persis dengan nama file di folder `images/`
→ Pastikan gambar sudah ter-upload ke GitHub

**Upload gagal karena lebih dari 100 file**
→ Upload per batch: file kode dulu, lalu folder `images/` per dekade satu per satu
