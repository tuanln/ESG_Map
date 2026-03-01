# ESG_Map - Nhật Ký Phát Triển & Bài Học Rút Ra

## Mục đích
Tài liệu này ghi lại quá trình phát triển, các vấn đề gặp phải, giải pháp đã áp dụng, và bài học kinh nghiệm cho các dự án sau.

---

## Giai Đoạn 1: Nền tảng + Bản đồ + 2 Layers

### Ngày: 01/03/2026

### Kiến trúc đã chọn
- **Framework**: Next.js 14 (App Router) + TypeScript
- **Map**: MapLibre GL JS (không dùng deck.gl trực tiếp vì MapLibre đủ mạnh cho MVP)
- **Styling**: Tailwind CSS v3 + custom dark theme
- **Data**: API Routes làm proxy tới các nguồn dữ liệu bên ngoài
- **State**: React hooks đơn giản (useState/useEffect), chưa cần state manager

### Vấn đề gặp phải & giải pháp

#### 1. OpenAQ API v2 đã bị retired
- **Vấn đề**: OpenAQ v2 endpoint trả về `{"message": "Gone. Version 1 and Version 2 API endpoints are retired"}`. Toàn bộ service viết cho v2 bị vô dụng.
- **Giải pháp**: Chuyển sang WAQI/AQICN API (`api.waqi.info`). API này cung cấp AQI realtime cho các thành phố.
- **Bài học**: Luôn kiểm tra API availability trước khi code service. API open-source có thể bị deprecated bất cứ lúc nào. OpenAQ v3 yêu cầu API key (X-API-Key header).

#### 2. WAQI demo token bị rate-limit nghiêm ngặt
- **Vấn đề**: Token `demo` chỉ trả kết quả cho 1-2 thành phố, phần lớn request bị reject.
- **Giải pháp**: Thiết kế hệ thống fallback 2 lớp:
  - Lớp 1: Gọi API live cho 16 thành phố ưu tiên
  - Lớp 2: Fallback data tĩnh cho 42 thành phố lớn (với AQI tham khảo)
  - Merge kết quả: live data ưu tiên, fallback fill in phần còn lại
  - In-memory cache 10 phút tránh gọi API lặp
- **Bài học**:
  - Luôn thiết kế fallback cho dữ liệu real-time
  - Demo token thường bị giới hạn rất nặng, cần plan cho production key
  - Để có full data cần đăng ký AQICN token (miễn phí) tại https://aqicn.org/data-platform/token/

#### 3. Next.js config format
- **Vấn đề**: Next.js 14 không hỗ trợ `next.config.ts`, chỉ `.js` hoặc `.mjs`
- **Giải pháp**: Rename thành `next.config.mjs` với JSDoc types
- **Bài học**: Next.js 14 chưa hỗ trợ native TS config (chỉ từ Next.js 15+). Dùng `.mjs` + JSDoc cho type checking.

#### 4. Tailwind CSS v4 breaking changes
- **Vấn đề**: `npm install tailwindcss` cài v4.x mặc định, config format hoàn toàn khác v3
- **Giải pháp**: Pin `tailwindcss@3` để dùng format cũ (`tailwind.config.js` với `content[]`, `theme.extend`)
- **Bài học**: Tailwind v4 dùng CSS-first config, không cần JS config file. Nếu dùng v4, cần viết lại toàn bộ config approach. Stick with v3 cho tương thích tốt hơn.

#### 5. NPM naming restrictions
- **Vấn đề**: `create-next-app` từ chối tên "ESG_Map" vì npm không cho phép chữ hoa
- **Giải pháp**: Tạo project thủ công (`npm init -y`) rồi cài dependencies riêng
- **Bài học**: Package name phải lowercase. Thư mục có thể viết hoa nhưng package.json name phải lowercase.

#### 6. MapLibre SSR conflict
- **Vấn đề**: MapLibre GL JS truy cập `window`/`document` → crash khi SSR
- **Giải pháp**: Dùng `next/dynamic` với `{ ssr: false }` cho component Globe3D
- **Bài học**: Mọi thư viện map (MapLibre, Leaflet, Mapbox) đều cần disable SSR trong Next.js

#### 7. API routes bị static generation
- **Vấn đề**: Build time cố gắng gọi external API → fail vì chạy offline
- **Giải pháp**: Thêm `export const dynamic = 'force-dynamic'` vào route handlers
- **Bài học**: Mặc định Next.js sẽ cố static generate API routes. Phải explicit opt-out.

### Quyết định kiến trúc

| Quyết định | Lý do |
|-----------|-------|
| MapLibre thay vì Mapbox | Miễn phí, open-source, không cần API key |
| WAQI thay vì OpenAQ | OpenAQ v2 retired, WAQI có demo token dễ test |
| Fallback data pattern | Demo token bị giới hạn, cần đảm bảo UX tốt ngay lập tức |
| API Routes proxy | Tránh CORS issues, ẩn API keys, caching server-side |
| Dynamic import Globe3D | Tránh SSR crash với browser-only libraries |
| Tailwind v3 thay vì v4 | v4 config format khác hoàn toàn, ecosystem chưa mature |

### Metrics
- **Files tạo**: 16 source files + 4 config files
- **APIs tích hợp**: USGS Earthquake (106 events), WAQI AQI (42 stations)
- **Build size**: First Load JS ~92.7 kB cho trang chính
- **Build time**: ~10s

---

## Giai Đoạn 2: Mở rộng Layers + Dashboard
*(Đang phát triển...)*

### Kế hoạch
- Thêm layer: Thiên tai (GDACS/NASA EONET), Cháy rừng (NASA FIRMS), Xung đột (ACLED)
- Dashboard phân tích với biểu đồ Recharts
- Deploy lên Vercel

---

## Checklist Cho Dự Án Tương Tự

### Trước khi bắt đầu
- [ ] Kiểm tra tất cả API endpoints còn hoạt động
- [ ] Đăng ký API keys cần thiết (AQICN, NASA FIRMS, ACLED)
- [ ] Xác nhận version compatibility (Next.js + Tailwind + MapLibre)
- [ ] Thiết kế fallback data cho mọi data source

### Khi phát triển
- [ ] Dùng `force-dynamic` cho API routes cần external data
- [ ] Dynamic import cho browser-only libraries
- [ ] In-memory cache cho API calls tránh rate-limit
- [ ] Lowercase package name cho npm
- [ ] Test API trực tiếp bằng curl trước khi viết service

### Khi deploy
- [ ] Set environment variables trên Vercel
- [ ] Kiểm tra CORS headers cho API routes
- [ ] Verify build size < 100kB first load

---

*Cập nhật lần cuối: 01/03/2026*
