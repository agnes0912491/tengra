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
Next.js build speed tips (CI-ready)

- Use ISR for server fetches
  - Prefer `fetch(url, { next: { revalidate: 60 } })` over `cache: 'no-store'` in app routes that can be cached.
  - Already applied: `app/sitemap.ts` now uses ISR instead of dynamic no-store.

- Turn off heavy build artifacts
  - `productionBrowserSourceMaps: false` (set in `next.config.ts`).

- Dynamic import large UI bundles
  - Keep heavy libs (e.g., markdown editor, globe, charts) loaded via `dynamic(() => import('...'), { ssr: false })` only where needed.

- CI caching (GitHub Actions sketch)
  - Cache `~/.npm`, `node_modules`, and `.next/cache`.

  ```yaml
  - name: Use Node 20
    uses: actions/setup-node@v4
    with:
      node-version: 20
      cache: 'npm'

  - name: Cache Next.js build cache
    uses: actions/cache@v4
    with:
      path: |
        frontend/.next/cache
      key: next-${{ runner.os }}-${{ hashFiles('frontend/package-lock.json') }}

  - name: Install deps
    working-directory: frontend
    run: npm ci

  - name: Lint & typecheck
    working-directory: frontend
    run: |
      npm run lint
      # tsc --noEmit (if you keep separate TS step)

  - name: Build
    working-directory: frontend
    run: npm run build
  ```

- Trim global work
  - Avoid heavy async in root layouts or generateMetadata. Defer to page-level with ISR.
