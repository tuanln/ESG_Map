# Hướng Dẫn Cấu Hình API Keys

## 1. Lấy Gemini API Key từ Google

### Bước 1: Truy cập Google AI Studio
- Mở trình duyệt, vào: https://aistudio.google.com/apikey
- Đăng nhập bằng tài khoản Google

### Bước 2: Tạo API Key
- Click **"Create API Key"**
- Chọn project Google Cloud (hoặc tạo mới)
- Copy API key vừa tạo (dạng `AIza...`)

### Bước 3: Kiểm tra API key
Chạy lệnh sau trong terminal để test:
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```
Nếu trả về JSON response thì key hoạt động.

### Lưu ý
- Gemini API có free tier: 15 RPM (requests/minute), 1 triệu tokens/ngày
- Đủ cho ESG_Map với cron 3 lần/ngày
- Xem quota tại: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com

---

## 2. Đưa API Key lên Vercel Dashboard

> **QUAN TRỌNG**: KHÔNG bao giờ commit API key vào code hoặc file `.env`. Chỉ cấu hình trực tiếp trên Vercel Dashboard.

### Bước 1: Mở Vercel Dashboard
- Vào https://vercel.com/dashboard
- Chọn project **esg-map**

### Bước 2: Vào Settings > Environment Variables
- Click **"Settings"** (tab trên cùng)
- Chọn **"Environment Variables"** (menu bên trái)

### Bước 3: Thêm GEMINI_API_KEY
- **Key**: `GEMINI_API_KEY`
- **Value**: paste API key từ Google AI Studio
- **Environment**: chọn cả 3 (Production, Preview, Development)
- Click **"Save"**

### Bước 4: Thêm CRON_SECRET
- **Key**: `CRON_SECRET`
- **Value**: tạo chuỗi random bằng lệnh:
  ```bash
  openssl rand -hex 32
  ```
  Hoặc dùng bất kỳ chuỗi dài, phức tạp nào
- **Environment**: chọn cả 3
- Click **"Save"**

### Bước 5: Redeploy
- Vào tab **"Deployments"**
- Click dấu "..." bên phải deployment mới nhất
- Chọn **"Redeploy"**
- Chờ deploy hoàn tất (~1-2 phút)

---

## 3. Kiểm Tra Hoạt Động

### Test AI Summary
Truy cập: `https://esg-map.vercel.app/api/ai-summary`

Nếu thấy `"generatedBy": "gemini"` thì Gemini API đã hoạt động.

### Test Cron Endpoint
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://esg-map.vercel.app/api/cron/refresh
```

Nếu trả về `"success": true` thì cron endpoint hoạt động.

### Xem Cron Logs
- Vercel Dashboard > project > **"Cron Jobs"** tab
- Hoặc **"Logs"** tab > filter "cron"

---

## 4. Các API Key Khác (Tùy chọn)

| Key | Nguồn | Miễn phí | Hướng dẫn |
|-----|-------|----------|-----------|
| `AQICN_TOKEN` | https://aqicn.org/data-platform/token/ | Co | Đăng ký email, nhận token qua email |
| `NASA_FIRMS_KEY` | https://firms.modaps.eosdis.nasa.gov | Co | Tạo Earthdata account |
| `ACLED_API_KEY` | https://acleddata.com/register/ | Co (academic) | Đăng ký, chờ duyệt 1-2 ngày |

Thêm các key này vào Vercel Dashboard tương tự bước 2-5 ở trên.

---

## 5. Bảo Mật

- **KHÔNG** commit API key vào file `.env`, `.env.local`, hoặc bất kỳ file nào trong repo
- **KHÔNG** log API key ra console trong production
- File `.env.example` chỉ chứa tên biến (không có giá trị) để hướng dẫn
- Vercel mã hóa environment variables và chỉ inject vào runtime
- Rotate key định kỳ (3-6 tháng) tại Google AI Studio

---

*Cập nhật: 02/03/2026*
