# Tech Radar Elementor Integration

Plugin ini merupakan integrasi WordPress (Elementor Widget) dari [Tech Radar](https://github.com/zalando/tech-radar) yang dikembangkan oleh Zalando.  
Tujuan plugin ini adalah memudahkan pengguna WordPress dalam menampilkan *Technology Radar Visualization* secara dinamis melalui antarmuka Elementor, tanpa perlu menulis kode manual.

## Fitur Utama
- Menyediakan widget Elementor untuk menampilkan Tech Radar.  
- Mendukung customisasi penuh melalui panel Elementor, seperti:
  - `repo_url`  
  - `quadrants` dan `rings`  
  - `entries` (label, quadrant, ring, moved, dsb.)  
- Optimasi multi-widget: bisa dipakai lebih dari satu radar di satu halaman tanpa saling bertabrakan.  
- Dukungan link open in new tab (`links_in_new_tabs`).  
- Tampilan siap cetak (`print_layout`).  

## Cara Penggunaan
1. Install dan aktifkan plugin ini di WordPress Anda.  
2. Buka **Elementor Editor**.  
3. Cari widget bernama **Tech Radar** di panel kiri.  
4. Drag & drop ke halaman.  
5. Sesuaikan konfigurasi radar melalui opsi yang tersedia di sidebar Elementor.  

## Instalasi Manual
1. Clone repository ini ke folder `wp-content/plugins/tech-radar-elementor`.  
2. Aktifkan melalui menu **Plugins** di WordPress Admin.  
3. Pastikan Elementor sudah terpasang di website Anda.  

## Catatan
- Plugin ini hanya integrasi untuk WordPress + Elementor.  
- Seluruh logika visualisasi radar tetap menggunakan library original dari Zalando (`radar_visualization.js` berbasis D3.js v7).  
- Kami tidak mengubah algoritma dasar, hanya membungkusnya agar mudah digunakan di WordPress.  

## Kredit
Proyek ini didasarkan pada karya open source:  
- Tech Radar – [zalando/tech-radar](https://github.com/zalando/tech-radar)  
- Lisensi: MIT License  

Segala pujian dan kredit utama untuk tim pengembang Zalando Tech Radar.  
Plugin ini hanya bertujuan untuk mempermudah pengguna WordPress/Elementor dalam memanfaatkan visualisasi Tech Radar.  

## Lisensi
Plugin ini menggunakan lisensi MIT, mengikuti lisensi dari proyek asal.  
