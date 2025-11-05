Tengra Frontend TODO

Kapsam: Admin paneli ve genel site arayüzü (Next.js + TailwindCSS)

- Sidebar
  - [x] Konteyneri `relative` konuma al ve iç overlay taşmasını engelle.
  - [x] Navigasyon alanını `overflow-y-auto` yaparak küçük ekranlarda kaydırılabilir hale getir.
  - [x] Aktif link için daha belirgin durum: ince yan çizgi + arka plan/kenarlık parlaklığı.
  - [x] İkon seti ekle (lucide-react); her madde için anlamlı ikon tanımla.
  - [x] Genişlik varyantları: `w-72` (default) ve `xl:w-80`.
  - [x] `SidebarItem` bileşenine ayrıldı.

- Tipografi ve hissiyat
  - Başlıklarda `font-display` ve tracking ayarlarını uyumlu kullan.
  - Cam efekti/kenarlık opasitelerini %5–10 aralığında tut, çok parlaklıkten kaçın.
  - Koyu temada kontrastı “okunabilir ama sert değil” seviyesinde ayarla.

- Hareket/etkileşim
  - [x] Hover/aktif geçişleri 150–220ms aralığında.
  - [x] Kartlarda micro-shadow (mevcut sınıflar ile).

- Metrics sayfası
  - [x] Kart ızgarasında hizalama ve başlıklar standardize edildi (`StatCard`/`ChartCard`).
  - [x] Skeleton/boş durum: `EmptyState` ve `Skeleton` eklendi.
  - [x] Grafikleri `ChartCard` bileşenine çıkarıldı.
  - [x] Ülke dağılımı ve globe eklendi.

- Erişilebilirlik
  - [x] `aria-current="page"`, `role="navigation"` uygulandı.
  - [ ] Klavye gezinme sırası ve `:focus-visible` özel stilleri (gerekirse düzenlenir).

- Temiz kod
  - [x] `SidebarItem` bileşeni eklendi.
  - [ ] Renkleri değişkenleştir (gerekirse ayrı bir tema geçişinde).

- Test/kalite
  - [ ] Basit görsel regresyon (lokalde çalıştırılabilir).
  - [ ] Lint ve type check: `npm run lint` / `tsc --noEmit`.

Ek: Proje Ekleme
- [x] Yeni proje modaline drag&drop image upload (Dropzone) ve `logoUrl` alanı eklendi.

Ek: Lokasyon Analitiği
- [x] Backend: `/analytics/countries/top` uç noktası eklendi.
- [x] Backend: `page/increment` çağrısında ülke sayımı (body.country veya CF/Vercel başlığından enjekte).
- [x] Frontend: AnalyticsTracker ülke tahmini (navigator.language) + isteğe eklenmesi.
