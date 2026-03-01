# ESG_Map - Bản Đồ Giám Sát ESG Toàn Cầu

> **Phiên bản tài liệu**: 1.0
> **Ngày tạo**: 01/03/2026
> **Cập nhật lần cuối**: 01/03/2026
> **Tác giả**: ESG_Map Team
> **Ngôn ngữ chính**: Tiếng Việt

---

## Mục Lục

1. [Tổng Quan Dự Án](#1-tổng-quan-dự-án)
2. [Kiến Trúc Hệ Thống](#2-kiến-trúc-hệ-thống)
3. [Bảng Nguồn Dữ Liệu (Data Sources)](#3-bảng-nguồn-dữ-liệu-data-sources)
4. [Tính Năng Chính](#4-tính-năng-chính)
5. [Cấu Trúc Thư Mục Dự Án](#5-cấu-trúc-thư-mục-dự-án)
6. [Các Giai Đoạn Triển Khai](#6-các-giai-đoạn-triển-khai)
7. [Ước Tính Chi Phí](#7-ước-tính-chi-phí)
8. [So Sánh Với WorldMonitor](#8-so-sánh-với-worldmonitor)
9. [Lộ Trình Sau MVP](#9-lộ-trình-sau-mvp)
10. [API Keys Cần Thiết](#10-api-keys-cần-thiết)

---

## 1. Tổng Quan Dự Án

### 1.1 Giới thiệu

**ESG_Map** (Bản Đồ ESG Toàn Cầu) la mot ung dung web giám sát thời gian thực các chỉ số **Môi trường (E - Environment)**, **Xã hội (S - Social)**, và **Quản trị (G - Governance)** trên quy mô toàn cầu. Dự án lấy cảm hứng từ [WorldMonitor](https://github.com/koala73/worldmonitor) - một bản đồ theo dõi sự kiện toàn cầu, nhưng mở rộng theo hướng ESG chuyên sâu phục vụ thị trường Việt Nam.

### 1.2 Ba trụ cột ESG được giám sát

| Trụ cột | Chỉ số giám sát | Nguồn dữ liệu |
|---------|-----------------|----------------|
| **E - Môi trường** | Ô nhiễm không khí (PM2.5, PM10, CO2, AQI), biến đổi khí hậu, cháy rừng, chất lượng nước | WAQI/AQICN, NASA FIRMS, NASA EONET |
| **S - Xã hội** | Động đất, thiên tai (bão, lũ, núi lửa), xung đột vũ trang, biểu tình, điểm nóng an ninh | USGS, GDACS, ACLED |
| **G - Quản trị** | Chính sách ESG quốc gia, giải pháp công nghệ xanh (green tech), chỉ số quản trị bền vững | Tổng hợp + AI phân tích |

### 1.3 Đối tượng người dùng mục tiêu

- **Chuyên gia công nghệ đô thị thông minh (Smart City)** tại Việt Nam
- **Nhà hoạch định chính sách** (policymakers) cần dữ liệu ESG thời gian thực
- **Nhà đầu tư ESG** cần đánh giá rủi ro môi trường - xã hội theo quốc gia
- **Nhà nghiên cứu** về biến đổi khí hậu, thiên tai, và phát triển bền vững
- **Sinh viên, giảng viên** trong lĩnh vực khoa học môi trường và phát triển bền vững

### 1.4 Ngôn ngữ

- **Ngôn ngữ chính**: Tiếng Việt (`vi`)
- **Ngôn ngữ phụ**: Tiếng Anh (`en`)
- Hệ thống đa ngôn ngữ qua `i18next`, cho phép mở rộng thêm ngôn ngữ trong tương lai

### 1.5 Tầm nhìn sản phẩm

> Xây dựng nền tảng giám sát ESG toàn cầu **"all-in-one"** bằng tiếng Việt đầu tiên, giúp người dùng Việt Nam có cái nhìn tổng thể và chi tiết về tình hình môi trường, xã hội, và quản trị trên toàn thế giới -- từ đó đưa ra quyết định chính sách và đầu tư thông minh hơn.

---

## 2. Kiến Trúc Hệ Thống

### 2.1 Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Client)                        │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌────────────┐ │
│  │ Next.js  │  │ MapLibre GL  │  │ Recharts │  │  i18next   │ │
│  │ 14 + TS  │  │  JS (Globe)  │  │ + D3.js  │  │  (vi/en)   │ │
│  └────┬─────┘  └──────┬───────┘  └────┬─────┘  └────────────┘ │
│       │               │               │                         │
│       └───────────────┴───────────────┘                         │
│                        │                                        │
│              Tailwind CSS v3 (Dark Theme)                       │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP (fetch)
                         ▼
┌────────────────────────────────────────────────────────────────┐
│                   BACKEND (Next.js API Routes)                  │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ /api/        │  │ In-Memory    │  │ RSS Parser           │  │
│  │ air-quality  │  │ Cache        │  │ (GDACS XML -> JSON)  │  │
│  │ earthquakes  │  │ (10-60 min)  │  │                      │  │
│  │ disasters    │  │              │  │                      │  │
│  │ fires        │  ├──────────────┤  ├──────────────────────┤  │
│  │ conflicts    │  │ Fallback     │  │ Claude API           │  │
│  │ news         │  │ Data Layer   │  │ (News Summary)       │  │
│  └──────┬───────┘  └──────────────┘  └──────────────────────┘  │
│         │                                                       │
└─────────┼───────────────────────────────────────────────────────┘
          │ HTTPS (proxy)
          ▼
┌────────────────────────────────────────────────────────────────┐
│                    EXTERNAL DATA SOURCES                        │
│                                                                 │
│  ┌────────┐ ┌──────┐ ┌───────┐ ┌──────┐ ┌───────┐ ┌────────┐ │
│  │ WAQI / │ │ USGS │ │ GDACS │ │ NASA │ │ NASA  │ │ ACLED  │ │
│  │ AQICN  │ │      │ │ (RSS) │ │EONET │ │ FIRMS │ │        │ │
│  └────────┘ └──────┘ └───────┘ └──────┘ └───────┘ └────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### 2.2 Tech Stack chi tiết

| Thành phần | Công nghệ | Phiên bản | Lý do chọn |
|-----------|-----------|-----------|------------|
| **Framework** | Next.js (App Router) | 14.x | SSR/SSG linh hoạt, API Routes tích hợp, routing dựa trên file |
| **Ngôn ngữ** | TypeScript | 5.x | Type safety, IDE support tốt, giảm lỗi runtime |
| **Styling** | Tailwind CSS | 3.x | Utility-first, dark theme dễ tuỳ biến, không cần CSS riêng |
| **Bản đồ** | MapLibre GL JS | 5.x | Open-source (không cần API key), hỗ trợ WebGL, dark theme, globe projection |
| **Biểu đồ** | Recharts + D3.js | 3.x / 7.x | Recharts cho dashboard nhanh, D3 cho visualizations tuỳ chỉnh sâu |
| **Đa ngôn ngữ** | i18next + react-i18next | 25.x / 16.x | Ecosystem lớn nhất cho i18n React, hỗ trợ namespace, lazy loading |
| **RSS Parsing** | rss-parser | 3.x | Parse GDACS RSS feed thành JSON |
| **Map Overlay** | deck.gl | 9.x | Heatmap layer, arc layer cho visualizations nâng cao |
| **Deployment** | Vercel | - | Tích hợp tốt nhất với Next.js, serverless functions, edge network |
| **AI** | Claude API (Anthropic) | - | Tóm tắt tin tức ESG, phân tích xu hướng bằng tiếng Việt |

### 2.3 Quyết định kiến trúc quan trọng

| Quyết định | Giải pháp | Lý do |
|-----------|----------|-------|
| Map library | MapLibre GL JS (thay vì Mapbox GL) | Miễn phí, open-source, không cần API key, cùng specification |
| API approach | Next.js API Routes làm proxy | Ẩn API keys phía server, tránh CORS, cache server-side |
| SSR handling | `dynamic()` với `ssr: false` cho Map | MapLibre truy cập `window`/`document` -- crash khi SSR |
| Air quality source | WAQI/AQICN (thay vì OpenAQ v2) | OpenAQ v2 đã bị retired (Gone), WAQI có demo token dễ test |
| Data reliability | Hệ thống fallback 2 lớp | Demo token bị rate-limit, cần đảm bảo UX luôn có dữ liệu |
| CSS framework | Tailwind v3 (thay vì v4) | v4 thay đổi config format hoàn toàn (CSS-first), ecosystem chưa ổn định |
| State management | React hooks thuần (useState/useEffect) | Đủ cho MVP, không cần Zustand/Redux tại thời điểm này |
| API Routes config | `export const dynamic = 'force-dynamic'` | Ngăn Next.js static generate API routes tại build time |

### 2.4 Luồng dữ liệu (Data Flow)

```
1. Client mount -> useAirQuality() hook gọi fetch('/api/air-quality')
2. API Route nhận request -> Kiểm tra in-memory cache (TTL 10 phút)
   2a. Cache hit -> Trả về cached data
   2b. Cache miss -> Gọi WAQI API cho 16-60 thành phố (tùy token)
       -> Merge với fallback data tĩnh (42 thành phố)
       -> Dedup theo tọa độ -> Cache kết quả -> Trả về
3. Client nhận data -> Update state -> MapLibre render GeoJSON circles
4. User click marker -> Popup hiển thị chi tiết (AQI, PM2.5, PM10...)
5. Auto-refresh sau interval (10 phút AQI, 5 phút earthquakes)
```

---

## 3. Bảng Nguồn Dữ Liệu (Data Sources)

### 3.1 Bảng tổng hợp API

| # | Nguồn dữ liệu | URL API | Dữ liệu cung cấp | Giá | Rate Limit | Ghi chú |
|---|---------------|---------|-------------------|-----|-----------|---------|
| 1 | **WAQI / AQICN** | `https://api.waqi.info/feed/{city}/?token={key}` | AQI, PM2.5, PM10, CO, SO2, NO2, O3 theo thành phố realtime | **Miễn phí** (đăng ký token) | Demo token: ~5-10 req/phút. Token đăng ký: cao hơn nhiều | Token `demo` bị giới hạn nặng. Đăng ký tại [aqicn.org/data-platform/token](https://aqicn.org/data-platform/token/) |
| 2 | **WAQI Map Bounds** | `https://api.waqi.info/v2/map/bounds/?latlng={bounds}&token={key}` | AQI heatmap theo vùng bản đồ | **Miễn phí** | Như trên | Trả về tất cả trạm trong vùng nhìn |
| 3 | **USGS Earthquake** | `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson` | Động đất M4.5+ toàn cầu (7 ngày gần nhất) - GeoJSON | **Miễn phí** | Không giới hạn | Cập nhật mỗi 5 phút. Không cần API key |
| 4 | **GDACS** | `https://www.gdacs.org/xml/rss.xml` | Thiên tai toàn cầu: bão, lũ lụt, núi lửa, hạn hán (RSS XML) | **Miễn phí** | Không giới hạn | Cần parse RSS XML -> JSON bằng `rss-parser` |
| 5 | **NASA EONET** | `https://eonet.gsfc.nasa.gov/api/v3/events` | Sự kiện thiên nhiên: cháy rừng, bão, núi lửa, băng trôi | **Miễn phí** | Không giới hạn | REST JSON API, không cần key |
| 6 | **NASA FIRMS** | `https://firms.modaps.eosdis.nasa.gov/api/area/csv/{MAP_KEY}/...` | Phát hiện cháy rừng realtime từ vệ tinh (MODIS, VIIRS) | **Miễn phí** (cần MAP_KEY) | 10 requests/phút | Đăng ký MAP_KEY tại [firms.modaps.eosdis.nasa.gov](https://firms.modaps.eosdis.nasa.gov/api/area/) |
| 7 | **ACLED** | `https://api.acleddata.com/acled/read` | Xung đột vũ trang, biểu tình, bạo loạn toàn cầu | **Miễn phí** (academic/media). Thương mại có phí | 500 records/request | Cần đăng ký tài khoản + API key tại [acleddata.com](https://acleddata.com/register/) |
| 8 | **Claude API** (Anthropic) | `https://api.anthropic.com/v1/messages` | Tóm tắt tin tức ESG, phân tích xu hướng bằng AI | **$3/1M input tokens, $15/1M output** (Claude 3.5 Sonnet) | Theo plan | Dùng cho tính năng AI News Summary |

### 3.2 Chi tiết định dạng dữ liệu

**USGS Earthquake GeoJSON Response:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "mag": 6.2,
        "place": "48 km SSE of Hualien City, Taiwan",
        "time": 1709312400000,
        "url": "https://earthquake.usgs.gov/earthquakes/eventpage/us7000...",
        "tsunami": 0,
        "type": "earthquake"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [121.6, 23.7, 15.0]
      }
    }
  ]
}
```

**WAQI Feed Response:**
```json
{
  "status": "ok",
  "data": {
    "aqi": 156,
    "idx": 5773,
    "city": {
      "geo": [21.0285, 105.8542],
      "name": "Hanoi US Embassy, Vietnam"
    },
    "iaqi": {
      "pm25": { "v": 78 },
      "pm10": { "v": 95 },
      "co": { "v": 0.8 },
      "no2": { "v": 22 }
    },
    "time": { "iso": "2026-03-01T12:00:00+07:00" }
  }
}
```

### 3.3 Chiến lược Fallback & Cache

| Nguồn | Cache TTL | Fallback | Lý do |
|-------|----------|----------|-------|
| WAQI/AQICN | 10 phút | 42 thành phố lớn (dữ liệu tĩnh tham khảo) | Demo token rate-limit nặng |
| USGS | 5 phút | Không cần (API ổn định, không giới hạn) | Dữ liệu cập nhật mỗi 5 phút |
| GDACS | 15 phút | Feed rỗng | RSS feed ổn định |
| NASA FIRMS | 30 phút | Không cần | Dữ liệu vệ tinh cập nhật mỗi vài giờ |
| ACLED | 1 giờ | Không cần | Dữ liệu cập nhật hàng tuần |

---

## 4. Tính Năng Chính

### 4.1 Bản đồ 3D Globe tương tác

- **MapLibre GL JS** với dark theme (CARTO Dark Matter basemap)
- Chế độ **globe 3D** xoay được, zoom từ toàn cầu xuống đường phố
- Pitch (góc nghiêng) mặc định 25 độ cho hiệu ứng 3D
- **20+ lớp dữ liệu** có thể bật/tắt (toggle) độc lập
- Navigation controls (zoom, compass) và scale bar

### 4.2 Các lớp dữ liệu (Layers)

| # | Layer ID | Tên tiếng Việt | Icon | Loại hiển thị | Nguồn |
|---|---------|----------------|------|--------------|-------|
| 1 | `air-quality` | Chất lượng không khí | Phat hien | Circle markers màu theo AQI (6 mức) | WAQI/AQICN |
| 2 | `earthquakes` | Động đất | Dia cau | Circle markers + labels M{magnitude} | USGS |
| 3 | `disasters` | Thiên tai | Bao | Marker icons theo loại (bão, lũ, núi lửa) | GDACS + NASA EONET |
| 4 | `fires` | Cháy rừng | Lua | Heatmap layer (cluster density) | NASA FIRMS |
| 5 | `conflicts` | Xung đột | Kiem | Marker clusters theo khu vực | ACLED |
| 6 | `water-quality` | Chất lượng nước | (planned) | Choropleth theo lưu vực | Planned |
| 7 | `climate` | Biến đổi khí hậu | (planned) | Gradient overlay nhiệt độ | Planned |
| 8 | `esg-score` | Điểm ESG quốc gia | (planned) | Choropleth theo quốc gia | Planned |

### 4.3 AQI Heatmap & Air Quality

- Hiển thị **42+ trạm quan trắc** toàn cầu (ưu tiên Việt Nam)
- Mã màu **6 mức AQI** theo chuẩn US EPA:

| Mức AQI | Nhãn | Màu | Ý nghĩa |
|---------|------|-----|---------|
| 0-50 | Tot | `#22c55e` (xanh lá) | Chất lượng không khí tốt |
| 51-100 | Trung binh | `#eab308` (vàng) | Chấp nhận được |
| 101-150 | Nhom nhay cam | `#f97316` (cam) | Nhóm nhạy cảm nên hạn chế ra ngoài |
| 151-200 | Khong lanh manh | `#ef4444` (đỏ) | Mọi người bắt đầu bị ảnh hưởng |
| 201-300 | Rat xau | `#a855f7` (tím) | Cảnh báo sức khỏe nghiêm trọng |
| 301-500 | Nguy hai | `#7f1d1d` (nâu đỏ) | Tình trạng khẩn cấp |

- Popup chi tiết khi click: AQI, PM2.5, PM10, thời gian cập nhật
- Auto-refresh mỗi 10 phút

### 4.4 Earthquake Monitoring

- Hiển thị tất cả động đất **M4.5+** trong 7 ngày gần nhất (trung bình ~100 sự kiện)
- Circle markers với **bán kính tỷ lệ theo magnitude**: `radius = max(4, 2^(mag-2))`
- Mã màu **6 mức** theo cường độ:

| Magnitude | Nhãn | Màu |
|----------|------|-----|
| < 4.0 | Nho | `#22c55e` |
| 4.0 - 4.9 | Nhe | `#eab308` |
| 5.0 - 5.9 | Trung binh | `#f97316` |
| 6.0 - 6.9 | Manh | `#ef4444` |
| 7.0 - 7.9 | Rat manh | `#dc2626` |
| 8.0+ | Cuc manh | `#7f1d1d` |

- Labels hiển thị `M{magnitude}` khi zoom >= 3
- Popup chi tiết: vị trí, magnitude, độ sâu, cảnh báo tsunami, link USGS
- Auto-refresh mỗi 5 phút

### 4.5 Disaster Tracking (Phase 2)

- Parse **GDACS RSS feed** thành JSON realtime
- Kết hợp **NASA EONET** events API
- Theo dõi: bão nhiệt đới, lũ lụt, núi lửa phun trào, hạn hán
- Alert level theo GDACS color code (Green/Orange/Red)

### 4.6 Wildfire Detection (Phase 2)

- Dữ liệu vệ tinh từ **NASA FIRMS** (MODIS + VIIRS)
- Heatmap layer hiển thị mật độ cháy
- Phân biệt fire type: cháy rừng, cháy nương, đốt rẫy
- Focus vùng Đông Nam Á và Amazon

### 4.7 Conflict Zones (Phase 2)

- Dữ liệu từ **ACLED** (Armed Conflict Location & Event Data)
- Loại sự kiện: xung đột vũ trang, biểu tình, bạo loạn, bạo lực chính trị
- Cluster markers theo mật độ
- Timeline view cho diễn biến theo thời gian

### 4.8 Dashboard phân tích (Phase 2)

- **Recharts** biểu đồ tổng hợp:
  - Bar chart: Top 10 thành phố ô nhiễm nhất
  - Line chart: Xu hướng AQI theo thời gian
  - Pie chart: Phân bố thiên tai theo loại
  - Scatter plot: Tương quan AQI vs GDP per capita
- Bộ lọc theo khu vực, thời gian, loại sự kiện

### 4.9 AI News Summary (Phase 3)

- Tích hợp **Claude API** (Anthropic) để:
  - Tóm tắt tin tức ESG toàn cầu hàng ngày bằng tiếng Việt
  - Phân tích xu hướng và rủi ro ESG theo quốc gia
  - Đề xuất hành động cho policymakers
- Caching kết quả AI để tiết kiệm token

### 4.10 Country ESG Profiles (Phase 3)

- Trang hồ sơ ESG cho mỗi quốc gia:
  - **E Score**: AQI trung bình, diện tích rừng, phát thải CO2
  - **S Score**: Số thiên tai, mức độ xung đột, chỉ số phát triển con người
  - **G Score**: Chính sách khí hậu, tỷ lệ năng lượng tái tạo, minh bạch
- ESG Total Score trên thang 100 điểm
- So sánh giữa các quốc gia

### 4.11 ESG Scoring System (Phase 3)

```typescript
interface CountryESGData {
  code: string                                  // ISO 3166-1 alpha-2
  name: string                                  // Tên quốc gia
  eScore: number                                // 0-100
  sScore: number                                // 0-100
  gScore: number                                // 0-100
  totalScore: number                            // Trung bình có trọng số
  airQualityAvg: number                         // AQI trung bình
  recentDisasters: number                       // Số thiên tai gần đây
  conflictLevel: 'low' | 'medium' | 'high' | 'critical'
}
```

---

## 5. Cấu Trúc Thư Mục Dự Án

### 5.1 Cấu trúc hiện tại (Phase 1 - hoàn thành)

```
ESG_Map/
├── docs/
│   ├── DESIGN_PLAN.md              # Tài liệu thiết kế (file này)
│   └── DEVLOG.md                   # Nhật ký phát triển & bài học
├── public/
│   └── (static assets)
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (HTML head, fonts, metadata)
│   │   ├── page.tsx                # Trang chính - kết hợp Globe + Sidebar
│   │   ├── globals.css             # Tailwind base + custom dark theme CSS
│   │   └── api/
│   │       ├── air-quality/
│   │       │   └── route.ts        # Proxy API: WAQI -> AirQualityStation[]
│   │       └── earthquakes/
│   │           └── route.ts        # Proxy API: USGS -> Earthquake[]
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx          # Top navigation bar (12px height)
│   │   │   └── Sidebar.tsx         # Left sidebar: layers toggle, stats, legends
│   │   └── map/
│   │       └── Globe3D.tsx         # MapLibre GL map component (SSR disabled)
│   ├── hooks/
│   │   ├── useAirQuality.ts       # Custom hook: fetch + state AQI data
│   │   └── useEarthquakes.ts      # Custom hook: fetch + state earthquake data
│   ├── i18n/
│   │   └── config.ts              # i18next configuration (vi/en)
│   ├── services/
│   │   ├── airQuality.ts          # WAQI API service + fallback + cache
│   │   └── earthquakes.ts         # USGS API service + transform
│   ├── types/
│   │   └── esg.ts                 # TypeScript interfaces & types
│   └── utils/
│       ├── constants.ts           # Config, colors, API URLs, layer definitions
│       └── formatters.ts          # Format helpers (magnitude, time, AQI...)
├── next.config.mjs                # Next.js configuration
├── tailwind.config.js             # Tailwind CSS v3 config (dark theme)
├── tsconfig.json                  # TypeScript configuration
├── postcss.config.mjs             # PostCSS config for Tailwind
├── package.json                   # Dependencies & scripts
└── package-lock.json
```

### 5.2 Cấu trúc mục tiêu (đầy đủ tất cả phases)

```
ESG_Map/
├── docs/
│   ├── DESIGN_PLAN.md
│   └── DEVLOG.md
├── public/
│   ├── icons/                      # Layer icons, favicon
│   ├── locales/
│   │   ├── vi/
│   │   │   └── translation.json    # Vietnamese translations
│   │   └── en/
│   │       └── translation.json    # English translations
│   └── data/
│       └── countries.geojson       # Country boundaries for choropleth
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Home - Globe Map
│   │   ├── globals.css
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Dashboard analytics page
│   │   ├── country/
│   │   │   └── [code]/
│   │   │       └── page.tsx        # Country ESG profile page
│   │   ├── news/
│   │   │   └── page.tsx            # AI News Summary page
│   │   ├── solutions/
│   │   │   └── page.tsx            # Green Tech Solutions page
│   │   └── api/
│   │       ├── air-quality/
│   │       │   └── route.ts
│   │       ├── earthquakes/
│   │       │   └── route.ts
│   │       ├── disasters/
│   │       │   └── route.ts        # GDACS + NASA EONET proxy
│   │       ├── fires/
│   │       │   └── route.ts        # NASA FIRMS proxy
│   │       ├── conflicts/
│   │       │   └── route.ts        # ACLED proxy
│   │       ├── news/
│   │       │   └── route.ts        # Claude API news summary
│   │       └── country/
│   │           └── [code]/
│   │               └── route.ts    # Country ESG data
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── LanguageSwitcher.tsx # i18n toggle vi/en
│   │   │   └── LoadingOverlay.tsx
│   │   ├── map/
│   │   │   ├── Globe3D.tsx
│   │   │   ├── AQILayer.tsx        # Air quality circle layer
│   │   │   ├── EarthquakeLayer.tsx  # Earthquake circle + label layer
│   │   │   ├── DisasterLayer.tsx    # Disaster markers layer
│   │   │   ├── FireLayer.tsx        # Fire heatmap layer
│   │   │   ├── ConflictLayer.tsx    # Conflict cluster layer
│   │   │   ├── CountryLayer.tsx     # Country choropleth layer
│   │   │   └── MapPopup.tsx         # Reusable popup component
│   │   ├── dashboard/
│   │   │   ├── AQIChart.tsx         # AQI bar/line charts
│   │   │   ├── EarthquakeChart.tsx  # Earthquake timeline
│   │   │   ├── DisasterPieChart.tsx # Disaster distribution
│   │   │   ├── ESGScoreCard.tsx     # Country ESG score display
│   │   │   └── StatsSummary.tsx     # Summary statistics cards
│   │   ├── country/
│   │   │   ├── CountryProfile.tsx   # Country ESG profile
│   │   │   ├── ESGRadarChart.tsx    # E/S/G radar chart
│   │   │   └── CountryCompare.tsx   # Compare countries
│   │   └── news/
│   │       ├── NewsFeed.tsx         # AI-summarized news list
│   │       └── NewsCard.tsx         # Individual news card
│   ├── hooks/
│   │   ├── useAirQuality.ts
│   │   ├── useEarthquakes.ts
│   │   ├── useDisasters.ts         # Fetch GDACS + EONET
│   │   ├── useFires.ts             # Fetch NASA FIRMS
│   │   ├── useConflicts.ts         # Fetch ACLED
│   │   ├── useCountryESG.ts        # Fetch country ESG data
│   │   └── useAutoRefresh.ts       # Generic auto-refresh hook
│   ├── i18n/
│   │   ├── config.ts
│   │   └── translations/
│   │       ├── vi.ts               # Vietnamese strings
│   │       └── en.ts               # English strings
│   ├── services/
│   │   ├── airQuality.ts
│   │   ├── earthquakes.ts
│   │   ├── disasters.ts            # GDACS RSS + NASA EONET service
│   │   ├── fires.ts                # NASA FIRMS service
│   │   ├── conflicts.ts            # ACLED service
│   │   ├── claude.ts               # Claude API service (news summary)
│   │   └── countryESG.ts           # Country ESG scoring service
│   ├── types/
│   │   ├── esg.ts                  # Core types
│   │   ├── disasters.ts            # Disaster types
│   │   ├── conflicts.ts            # Conflict types
│   │   └── country.ts              # Country types
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── formatters.ts
│   │   ├── colors.ts               # Color utility functions
│   │   ├── geo.ts                  # Geospatial utilities
│   │   └── cache.ts                # Generic caching utility
│   └── lib/
│       └── anthropic.ts            # Claude API client setup
├── next.config.mjs
├── tailwind.config.js
├── tsconfig.json
├── postcss.config.mjs
├── package.json
├── package-lock.json
├── .env.local                      # API keys (gitignored)
└── .env.example                    # Template for env vars
```

---

## 6. Các Giai Đoạn Triển Khai

### Phase 1: Nền tảng + Globe + Air Quality + Earthquakes -- HOAN THANH

**Thời gian**: 01/03/2026
**Trạng thái**: Da hoan thanh

**Nội dung đã hoàn thành:**

- [x] Khởi tạo dự án Next.js 14 + TypeScript + Tailwind CSS v3
- [x] Cấu hình MapLibre GL JS với dark theme (CARTO Dark Matter)
- [x] Component Globe3D với SSR disabled (`next/dynamic`)
- [x] API Route `/api/air-quality` proxy tới WAQI/AQICN
- [x] API Route `/api/earthquakes` proxy tới USGS
- [x] Service air quality với hệ thống fallback 2 lớp + cache 10 phút
- [x] Service earthquakes transform USGS GeoJSON
- [x] Custom hooks: `useAirQuality`, `useEarthquakes`
- [x] Sidebar với layer toggles, thống kê, legends AQI + magnitude
- [x] Header navigation
- [x] TypeScript types cho toàn bộ data models
- [x] Formatters (magnitude, time ago, depth, AQI)
- [x] Constants (colors, API URLs, refresh intervals)

**Kết quả đo lường:**
- Files tạo: 16 source files + 4 config files
- APIs tích hợp: USGS (trung bình ~106 events), WAQI (42 stations)
- Build size: First Load JS ~92.7 kB
- Build time: ~10s

---

### Phase 2: Mở rộng Layers + Dashboard -- DANG THUC HIEN

**Thời gian dự kiến**: 02/03/2026 - 05/03/2026
**Trạng thái**: Dang phat trien

**Nội dung cần làm:**

- [ ] **Layer Thiên tai (GDACS + NASA EONET)**
  - [ ] Service parse GDACS RSS XML bằng `rss-parser`
  - [ ] Service fetch NASA EONET v3 events API
  - [ ] Merge 2 nguồn, dedup theo tọa độ/thời gian
  - [ ] API Route `/api/disasters`
  - [ ] Hook `useDisasters`
  - [ ] Map layer: marker icons theo loại thiên tai
  - [ ] Popup chi tiết: loại, cường độ, vùng ảnh hưởng, alert level

- [ ] **Layer Cháy rừng (NASA FIRMS)**
  - [ ] Đăng ký NASA FIRMS MAP_KEY
  - [ ] Service fetch FIRMS CSV data -> parse thành JSON
  - [ ] API Route `/api/fires`
  - [ ] Hook `useFires`
  - [ ] Map layer: heatmap (deck.gl HeatmapLayer)
  - [ ] Popup: tọa độ, satellite, confidence, brightness

- [ ] **Layer Xung đột (ACLED)**
  - [ ] Đăng ký tài khoản ACLED
  - [ ] Service fetch ACLED API (filter: last 30 days)
  - [ ] API Route `/api/conflicts`
  - [ ] Hook `useConflicts`
  - [ ] Map layer: cluster markers theo khu vực
  - [ ] Popup: loại sự kiện, fatalities, actors, source

- [ ] **Dashboard Analytics Page**
  - [ ] Route `/dashboard`
  - [ ] Recharts: Top 10 thành phố AQI cao nhất (bar chart)
  - [ ] Recharts: Phân bố động đất theo magnitude (histogram)
  - [ ] Recharts: Thiên tai theo loại (pie chart)
  - [ ] Recharts: Timeline sự kiện 7 ngày (line chart)
  - [ ] Summary stat cards

- [ ] **Deploy lên Vercel**
  - [ ] Set environment variables
  - [ ] Verify build + API routes hoạt động
  - [ ] Custom domain (nếu có)

---

### Phase 3: News AI + Country Profiles + ESG Score

**Thời gian dự kiến**: 06/03/2026 - 10/03/2026
**Trạng thái**: Chua bat dau

**Nội dung:**

- [ ] **AI News Summary (Claude API)**
  - [ ] Service Claude API client (`src/lib/anthropic.ts`)
  - [ ] Service tóm tắt tin tức ESG từ RSS feeds
  - [ ] API Route `/api/news`
  - [ ] Trang `/news` với danh sách tin tóm tắt
  - [ ] Cache kết quả AI (TTL 1 giờ) để tiết kiệm token
  - [ ] Prompt engineering cho tóm tắt tiếng Việt chất lượng

- [ ] **Country ESG Profiles**
  - [ ] GeoJSON boundaries cho 195+ quốc gia
  - [ ] Service tính ESG score từ aggregated data
  - [ ] API Route `/api/country/[code]`
  - [ ] Trang `/country/[code]` với profile chi tiết
  - [ ] Radar chart E/S/G bằng Recharts
  - [ ] So sánh 2-3 quốc gia

- [ ] **ESG Scoring Algorithm**
  - [ ] Công thức: `Total = 0.4*E + 0.35*S + 0.25*G`
  - [ ] E score: AQI trung bình, phát thải CO2, diện tích rừng
  - [ ] S score: Số thiên tai, mức xung đột, HDI
  - [ ] G score: Chính sách khí hậu, năng lượng tái tạo

- [ ] **Choropleth Map Layer**
  - [ ] Country boundaries từ GeoJSON
  - [ ] Fill color theo ESG Total Score (gradient xanh->đỏ)
  - [ ] Click quốc gia -> navigate tới profile

---

### Phase 4: Solutions + Polish + Production Deploy

**Thời gian dự kiến**: 11/03/2026 - 15/03/2026
**Trạng thái**: Chua bat dau

**Nội dung:**

- [ ] **Solutions Page**
  - [ ] Trang `/solutions` - giải pháp công nghệ xanh
  - [ ] Categorize: Năng lượng tái tạo, Giao thông xanh, Nông nghiệp bền vững, Quản lý rác thải
  - [ ] Case studies từ Việt Nam và thế giới
  - [ ] Links tới dự án/sáng kiến thực tế

- [ ] **UI/UX Polish**
  - [ ] Responsive design (mobile, tablet, desktop)
  - [ ] Loading skeletons cho tất cả data components
  - [ ] Error boundaries và error states đẹp
  - [ ] Animations và transitions mượt mà
  - [ ] Accessibility (WCAG 2.1 AA)
  - [ ] Tối ưu performance (lazy loading, code splitting)

- [ ] **i18n Hoàn chỉnh**
  - [ ] Translation files đầy đủ vi/en
  - [ ] Language switcher trên Header
  - [ ] URL-based locale routing

- [ ] **Production Deploy**
  - [ ] Vercel production deployment
  - [ ] Custom domain + SSL
  - [ ] Analytics (Vercel Analytics hoặc Google Analytics)
  - [ ] Error tracking (Sentry)
  - [ ] Rate limiting cho API routes
  - [ ] SEO optimization (meta tags, sitemap, robots.txt)

---

## 7. Ước Tính Chi Phí

### 7.1 Chi phí dùng Claude Max $100/tháng

| Hạng mục | Chi tiết | Chi phí ước tính/tháng |
|---------|---------|----------------------|
| **Claude Max Plan** | Gói $100/tháng - unlimited* conversations với Claude trên claude.ai | **$100** |
| **Claude API** (cho tính năng News AI trong app) | Dùng Claude 3.5 Sonnet: ~50 tóm tắt/ngày x 30 ngày = 1,500 calls. Input: ~2K tokens/call = 3M tokens. Output: ~500 tokens/call = 750K tokens. | **~$20.25** ($9 input + $11.25 output) |
| **Vercel Hosting** | Hobby plan (miễn phí) hoặc Pro ($20/tháng) | **$0 - $20** |
| **Domain** | Tuỳ chọn (.com ~$12/năm) | **~$1** |
| **API Keys khác** | WAQI, NASA FIRMS, ACLED -- tất cả miễn phí | **$0** |
| | | |
| **TỔNG CỘNG** | | **$100 - $141/tháng** |

> **Ghi chú**: Claude Max $100 dùng cho việc phát triển (coding, debugging, thiết kế). Claude API riêng cho tính năng AI trong app (news summary). Nếu dùng API ít hơn (10 tóm tắt/ngày), chi phí API giảm xuống ~$4/tháng.

### 7.2 Tối ưu chi phí Claude API

| Chiến lược | Tiết kiệm ước tính |
|-----------|-------------------|
| Cache kết quả AI (TTL 1-6 giờ) | Giảm 70-90% API calls |
| Batch requests (tóm tắt nhiều tin 1 lần) | Giảm 50% overhead tokens |
| Dùng Claude 3.5 Haiku cho tasks đơn giản | Giảm 90% chi phí so với Sonnet |
| Giới hạn summary length (max 200 từ) | Giảm 60% output tokens |
| Chỉ tóm tắt tin mới (delta update) | Giảm 80% redundant calls |

### 7.3 Chi phí hosting ước tính theo quy mô

| Quy mô | Users/tháng | Vercel Plan | Bandwidth | Chi phí |
|--------|------------|-------------|-----------|---------|
| Dev/Test | < 100 | Hobby (free) | 100 GB | $0 |
| MVP Launch | 100 - 1,000 | Hobby (free) | 100 GB | $0 |
| Growth | 1,000 - 10,000 | Pro ($20) | 1 TB | $20 |
| Scale | 10,000+ | Enterprise | Custom | Liên hệ |

---

## 8. So Sánh Với WorldMonitor

### 8.1 Bảng so sánh tổng thể

| Tiêu chí | **WorldMonitor** (koala73) | **ESG_Map** (dự án này) |
|---------|---------------------------|------------------------|
| **Mục đích** | Giám sát sự kiện toàn cầu chung | Giám sát ESG chuyên sâu cho Việt Nam |
| **Ngôn ngữ giao diện** | Tiếng Anh | Tiếng Việt (+ tiếng Anh) |
| **Đối tượng** | Người dùng quốc tế | Chuyên gia smart city & policymakers VN |
| **Framework** | (Tùy bản) | Next.js 14 + TypeScript |
| **Map Library** | Mapbox GL / Leaflet | MapLibre GL JS (open-source, miễn phí) |
| **Dữ liệu Air Quality** | OpenAQ | WAQI/AQICN (OpenAQ v2 đã retired) |
| **Dữ liệu Earthquake** | USGS | USGS (giống nhau) |
| **Dữ liệu Disaster** | GDACS | GDACS + NASA EONET (mở rộng hơn) |
| **Dữ liệu Fire** | NASA FIRMS | NASA FIRMS (giống nhau) |
| **Dữ liệu Conflict** | Không có / limited | ACLED (đầy đủ) |
| **AI Integration** | Không có | Claude API (tóm tắt tin tức ESG) |
| **ESG Scoring** | Không có | Hệ thống chấm điểm ESG theo quốc gia |
| **Country Profiles** | Không có / basic | Hồ sơ ESG chi tiết + so sánh |
| **Dashboard** | Basic | Recharts + D3.js dashboard phân tích |
| **Dark Theme** | Có | Có (CARTO Dark Matter) |
| **Globe 3D** | Có | Có (MapLibre với pitch 25 độ) |
| **i18n** | Không | i18next (vi/en, mở rộng được) |
| **Fallback System** | Không rõ | 2-lớp fallback cho mọi data source |
| **Chi phí Map API** | Mapbox (có thể tốn phí) | MapLibre (hoàn toàn miễn phí) |

### 8.2 Giá trị khác biệt của ESG_Map

1. **Tiếng Việt đầu tiên**: Giao diện, dữ liệu, phân tích -- tất cả bằng tiếng Việt, phục vụ trực tiếp thị trường Việt Nam
2. **ESG Framework**: Không chỉ giám sát sự kiện mà còn đánh giá, chấm điểm theo khung ESG chuẩn quốc tế
3. **AI-powered**: Tích hợp Claude AI để tóm tắt và phân tích xu hướng ESG
4. **Miễn phí hoàn toàn phía map**: MapLibre thay Mapbox, không lo chi phí map tiles
5. **Resilient data**: Hệ thống fallback 2 lớp đảm bảo luôn có dữ liệu hiển thị

---

## 9. Lộ Trình Sau MVP

### 9.1 Ngắn hạn (Q2 2026)

| # | Tính năng | Mô tả | Độ ưu tiên |
|---|----------|-------|-----------|
| 1 | **Mobile App** | React Native hoặc PWA cho trải nghiệm mobile | Cao |
| 2 | **Push Notifications** | Cảnh báo thiên tai, AQI nguy hiểm, động đất lớn | Cao |
| 3 | **Historical Data** | Lưu trữ dữ liệu lịch sử, so sánh theo thời gian | Trung bình |
| 4 | **User Accounts** | Đăng nhập, lưu preferences, custom alerts | Trung bình |
| 5 | **Embed Widget** | Cho phép nhúng bản đồ vào website khác | Thấp |

### 9.2 Trung hạn (Q3-Q4 2026)

| # | Tính năng | Mô tả | Độ ưu tiên |
|---|----------|-------|-----------|
| 6 | **Vietnam Deep Dive** | Dữ liệu chi tiết 63 tỉnh thành Việt Nam | Cao |
| 7 | **API Public** | Cung cấp REST API cho developers và nghiên cứu | Trung bình |
| 8 | **Satellite Imagery** | Tích hợp ảnh vệ tinh (Sentinel, Landsat) | Trung bình |
| 9 | **Prediction Models** | ML models dự đoán AQI, rủi ro thiên tai | Thấp |
| 10 | **Report Export** | Xuất báo cáo ESG dạng PDF | Trung bình |

### 9.3 Dài hạn (2027)

| # | Tính năng | Mô tả |
|---|----------|-------|
| 11 | **Enterprise Dashboard** | Bản dành cho doanh nghiệp, với dữ liệu riêng và analytics nâng cao |
| 12 | **IoT Integration** | Kết nối cảm biến IoT đo AQI, nhiệt độ, độ ẩm tại Việt Nam |
| 13 | **Blockchain ESG** | Xác thực dữ liệu ESG bằng blockchain, chống giả mạo |
| 14 | **AR Visualization** | Xem dữ liệu ESG qua thực tế tăng cường (AR glasses) |
| 15 | **Global ESG Index** | Chỉ số ESG toàn cầu do ESG_Map phát hành, được trích dẫn bởi báo chí |

### 9.4 Metrics mục tiêu sau 6 tháng

| Metric | Mục tiêu |
|--------|---------|
| Monthly Active Users (MAU) | 1,000+ |
| Data Sources tích hợp | 10+ |
| Quốc gia có ESG profile | 50+ |
| Uptime | > 99.5% |
| Page Load Time | < 3 giây |
| Lighthouse Performance Score | > 85 |

---

## 10. API Keys Cần Thiết

### 10.1 Danh sách API Keys

| # | Service | Biến môi trường | Cách lấy | Bắt buộc? | Ghi chú |
|---|---------|-----------------|---------|-----------|---------|
| 1 | **WAQI / AQICN** | `AQICN_TOKEN` | Đăng ký tại [aqicn.org/data-platform/token](https://aqicn.org/data-platform/token/) | **Co** (dùng `demo` để test) | Token `demo` bị rate-limit nặng. Token đăng ký miễn phí, limit cao hơn nhiều |
| 2 | **USGS Earthquake** | Không cần | API công khai, không cần key | Khong | API hoàn toàn miễn phí và mở |
| 3 | **GDACS** | Không cần | RSS feed công khai | Khong | Parse bằng `rss-parser` |
| 4 | **NASA EONET** | Không cần | API công khai, không cần key | Khong | REST API v3 |
| 5 | **NASA FIRMS** | `NASA_FIRMS_MAP_KEY` | Đăng ký tại [firms.modaps.eosdis.nasa.gov](https://firms.modaps.eosdis.nasa.gov/api/area/) | **Co** (cho Phase 2) | Miễn phí, cần tài khoản NASA Earthdata |
| 6 | **ACLED** | `ACLED_API_KEY` + `ACLED_EMAIL` | Đăng ký tại [acleddata.com/register](https://acleddata.com/register/) | **Co** (cho Phase 2) | Miễn phí cho academic/media. Cần nêu mục đích sử dụng |
| 7 | **Claude API** (Anthropic) | `ANTHROPIC_API_KEY` | Mua tại [console.anthropic.com](https://console.anthropic.com/) | **Co** (cho Phase 3) | Trả phí theo usage. Cần credit card |

### 10.2 File `.env.local` mẫu

```env
# === Air Quality ===
AQICN_TOKEN=your_aqicn_token_here

# === NASA FIRMS (Cháy rừng) ===
NASA_FIRMS_MAP_KEY=your_nasa_firms_key_here

# === ACLED (Xung đột) ===
ACLED_API_KEY=your_acled_api_key_here
ACLED_EMAIL=your_email@example.com

# === Claude API (AI News Summary) ===
ANTHROPIC_API_KEY=sk-ant-your_key_here

# === Optional ===
# NEXT_PUBLIC_APP_URL=https://esg-map.vercel.app
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 10.3 File `.env.example` (commit vào git)

```env
# === Required ===
AQICN_TOKEN=demo

# === Phase 2 ===
NASA_FIRMS_MAP_KEY=
ACLED_API_KEY=
ACLED_EMAIL=

# === Phase 3 ===
ANTHROPIC_API_KEY=

# === Optional ===
# NEXT_PUBLIC_APP_URL=
# NEXT_PUBLIC_GA_ID=
```

### 10.4 Lưu ý bảo mật

- **KHONG BAO GIO** commit file `.env.local` vào git
- Thêm `.env.local` vào `.gitignore`
- Trên Vercel, set environment variables qua Dashboard > Settings > Environment Variables
- API keys chỉ sử dụng ở **server-side** (API Routes), không expose ra client
- Biến `NEXT_PUBLIC_*` sẽ bị bundle vào client code -- chỉ dùng cho thông tin không nhạy cảm

---

## Phụ Lục

### A. Lệnh phát triển

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build production
npm run build

# Start production server
npm start

# Lint check
npm run lint
```

### B. Deploy lên Vercel

```bash
# Cài Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (preview)
vercel

# Deploy (production)
vercel --prod
```

### C. Kiểm tra API trực tiếp

```bash
# Test USGS Earthquake API
curl -s "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson" | jq '.features | length'

# Test WAQI API (thay YOUR_TOKEN)
curl -s "https://api.waqi.info/feed/hanoi/?token=YOUR_TOKEN" | jq '.data.aqi'

# Test GDACS RSS
curl -s "https://www.gdacs.org/xml/rss.xml" | head -50

# Test NASA EONET
curl -s "https://eonet.gsfc.nasa.gov/api/v3/events?limit=5" | jq '.events | length'
```

### D. Tài liệu tham khảo

| Tài liệu | URL |
|----------|-----|
| Next.js 14 Docs | [nextjs.org/docs](https://nextjs.org/docs) |
| MapLibre GL JS | [maplibre.org/maplibre-gl-js](https://maplibre.org/maplibre-gl-js/docs/) |
| Tailwind CSS v3 | [v3.tailwindcss.com](https://v3.tailwindcss.com/) |
| Recharts | [recharts.org](https://recharts.org/) |
| D3.js | [d3js.org](https://d3js.org/) |
| i18next | [i18next.com](https://www.i18next.com/) |
| WAQI API | [aqicn.org/json-api/doc](https://aqicn.org/json-api/doc/) |
| USGS Earthquake API | [earthquake.usgs.gov/fdsnws](https://earthquake.usgs.gov/fdsnws/event/1/) |
| GDACS | [gdacs.org](https://www.gdacs.org/) |
| NASA EONET | [eonet.gsfc.nasa.gov](https://eonet.gsfc.nasa.gov/docs/v3) |
| NASA FIRMS | [firms.modaps.eosdis.nasa.gov](https://firms.modaps.eosdis.nasa.gov/) |
| ACLED | [acleddata.com](https://acleddata.com/) |
| Claude API | [docs.anthropic.com](https://docs.anthropic.com/) |
| WorldMonitor (inspiration) | [github.com/koala73/worldmonitor](https://github.com/koala73/worldmonitor) |

---

> **ESG_Map** -- Ban Do Giam Sat ESG Toan Cau
> Xay dung boi ESG_Map Team | 2026
> Tai lieu nay duoc cap nhat lien tuc theo tien do du an.
