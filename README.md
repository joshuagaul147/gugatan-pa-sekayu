# Aplikasi Gugatan PA Sekayu

Aplikasi formulir offline untuk membantu petugas menyiapkan data cerai gugat dan cerai talak. Versi awal ini berjalan langsung di browser tanpa server, koneksi internet, atau dependensi eksternal.

## Menjalankan

Buka `index.html` dengan Microsoft Edge, Google Chrome, atau Firefox. Data konsep tersimpan di `localStorage` browser pada komputer petugas.

## Pengisian otomatis

- NIK memvalidasi 16 digit dan membaca tanggal lahir serta jenis kelamin berdasarkan struktur NIK Indonesia.
- Tanggal lahir menghitung umur secara dinamis.
- Tanggal perkawinan menghitung lama perkawinan.
- Tanggal kejadian menghitung lama waktu sejak kejadian.
- Data anak memiliki umur otomatis.
- Data konsep dapat disimpan, dimuat, dan dihapus secara lokal.

## Catatan penting

NIK hanya dapat mengisi data yang memang terkandung di dalam NIK: tanggal lahir dan jenis kelamin. Nama, alamat, agama, pekerjaan, dan data administratif lainnya tidak dapat ditebak dari NIK sehingga tetap harus diisi petugas. NIK yang diawali tanggal lahir 29 Februari atau data di masa depan ditandai sebagai tidak valid.

Template DOCX/PDF dan shell desktop Tauri akan ditambahkan pada tahap berikutnya setelah format resmi disediakan.
