# Etsy Dropshipping Automation

Bu proje, AliExpress, Amazon gibi platformlardan Etsy'ye ürün aktarımını otomatikleştiren kapsamlı bir e-ticaret çözümüdür. Sistem, gelişmiş product scraping, yapay zeka (AI) destekli SEO uyumlu içerik üretimi ve Etsy API entegrasyonu sunarak dropshipping süreçlerini kolaylaştırmayı amaçlamaktadır.

## ✨ Temel Özellikler

- **Gelişmiş Veri Çekimi (Scraping):** Chrome Eklentisi veya doğrudan URL üzerinden ürün bilgilerinin, varyantların ve görsellerin çekilmesi.
- **Yapay Zeka (AI) İçerik Üretimi:** OpenAI destekli SEO uyumlu ve optimize edilmiş ürün başlıkları, detaylı açıklamaları ve Etsy etiketleri (tags) üretimi.
- **Görsel İşleme:** Cloudinary destekli yüksek kaliteli görsel yönetimi, arka plan kaldırma (isteğe bağlı) ve otomatik yeniden boyutlandırma işlemleri.
- **Etsy Tam Entegrasyon:** Ürünlerin Etsy mağazasına tek tıkla taslak (draft) olarak yüklenmesi, varyant yönetimi ve envanter takibi.
- **Güçlü Altyapı:** Ölçeklenebilir, modern mikro-servis esintili monolit mimari.

## 📁 Proje Yapısı

Proje temel olarak 3 ana bileşenden oluşmaktadır:

1. **`etsy-dropshipping-frontend/`**: 
   - Next.js 14, React 18, Tailwind CSS, shadcn/ui ve Zustand kullanılarak geliştirilmiş kullanıcı paneli.
2. **`etsy-dropshipping-backend/`**: 
   - NestJS, PostgreSQL 16 (veya Airtable), Redis, BullMQ (Kuyruk yönetimi) kullanılarak geliştirilmiş güvenilir backend API ve arka plan yöneticisi.
3. **`EtsyAuto-Extension/`**: 
   - Desteklenen e-ticaret sitelerinde (AliExpress vb.) ürün incelerken tek tıklamayla işlemleri başlatan Chrome Eklentisi.

## 🚀 Kurulum ve Geliştirme

### Gereksinimler

- Node.js (v20 veya üzeri)
- PostgreSQL ve Redis (Docker Compose ile ayağa kaldırılabilir)
- Etsy Developer Hesabı ve API anahtarları
- OpenAI API Anahtarı
- (Opsiyonel) Cloudinary ve Airtable kimlik bilgileri

### Geliştirme (Development) Ortamında Başlatma

Sistemi development modunda çalıştırmak için:

**Backend'i Ayağa Kaldırmak:**
```bash
cd etsy-dropshipping-backend
npm install
# .env dosyasını gerekli anahtarlarla doldurun
npm run start:dev
```

**Frontend'i Ayağa Kaldırmak:**
```bash
cd etsy-dropshipping-frontend
npm install
# .env.local dosyasını .env.local.example referansıyla ayarlayın
npm run dev
```

Platform çalışmaya başladığında tarayıcı üzerinden yapılandırılmış porta (varsayılan: 3000) giderek kullanmaya başlayabilirsiniz.

## 📖 Detaylı Dokümantasyon

Tüm sistem, veri tabanı şemaları, endpoint detayları, iş kuyruğu (queue) yönetimi ve deployment süreçleri hakkında daha teknik ve ayrıntılı bilgi için [etsy-dropshipping-architecture.md](./etsy-dropshipping-architecture.md) dokümanını okuyabilirsiniz.
