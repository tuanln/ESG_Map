import { AISummary, NewsArticle } from '@/types/news'
import { SolutionsSummary } from '@/types/solutions'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_MODEL = 'gemini-2.0-flash'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

// Retry helper: 1 retry after 3s delay
async function fetchWithRetry(url: string, options: RequestInit, retries = 1): Promise<Response> {
  try {
    const res = await fetch(url, options)
    if (!res.ok && retries > 0) {
      console.warn(`Gemini API returned ${res.status}, retrying in 3s...`)
      await new Promise(r => setTimeout(r, 3000))
      return fetchWithRetry(url, options, retries - 1)
    }
    return res
  } catch (error) {
    if (retries > 0) {
      console.warn('Gemini API fetch failed, retrying in 3s...', error)
      await new Promise(r => setTimeout(r, 3000))
      return fetchWithRetry(url, options, retries - 1)
    }
    throw error
  }
}

// Sample summary for local testing / when no API key
const SAMPLE_SUMMARY: AISummary = {
  date: new Date().toISOString().split('T')[0],
  summary: `Tổng hợp ESG toàn cầu hôm nay: Chất lượng không khí tại khu vực Nam Á tiếp tục ở mức đáng báo động, với New Delhi ghi nhận AQI trên 250. Tại Đông Nam Á, Hà Nội và Jakarta cũng nằm trong nhóm ô nhiễm nặng. Về thiên tai, GDACS ghi nhận nhiều sự kiện động đất cường độ trung bình tại khu vực Thái Bình Dương. Xung đột tại Ukraine, Gaza và Sudan tiếp tục leo thang. Tin tích cực: EU thông qua gói chính sách Net Zero mới, Việt Nam đẩy mạnh phát triển năng lượng tái tạo với mục tiêu 30% vào 2030.`,
  highlights: [
    {
      title: 'AQI Delhi vượt 250 - mức nguy hại',
      category: 'environment',
      severity: 'critical',
      description: 'Bụi mịn PM2.5 tại New Delhi đạt 180 µg/m³, gấp 12 lần khuyến nghị WHO. Trường học đóng cửa, xây dựng tạm ngừng.',
    },
    {
      title: 'Động đất M5.3 tại Bangladesh',
      category: 'social',
      severity: 'warning',
      description: 'Động đất cường độ 5.3 Richter tại Bangladesh ảnh hưởng khoảng 60,000 người. GDACS đánh giá mức cảnh báo Orange.',
    },
    {
      title: 'EU thông qua gói Net Zero Industry Act',
      category: 'governance',
      severity: 'info',
      description: 'Liên minh châu Âu chính thức thông qua đạo luật công nghiệp Net Zero, đặt mục tiêu sản xuất 40% công nghệ xanh nội địa vào 2030.',
    },
    {
      title: 'Xung đột Sudan: 500,000 người di dời mới',
      category: 'social',
      severity: 'critical',
      description: 'Giao tranh tại Khartoum và Darfur khiến thêm 500,000 người phải di dời trong tháng qua, theo UNHCR.',
    },
    {
      title: 'Việt Nam: Chiến lược năng lượng tái tạo 2030',
      category: 'governance',
      severity: 'info',
      description: 'Chính phủ Việt Nam phê duyệt kế hoạch phát triển năng lượng tái tạo, mục tiêu đạt 30% tổng sản lượng điện từ nguồn xanh.',
    },
    {
      title: 'Cháy rừng Amazon mở rộng 15%',
      category: 'environment',
      severity: 'warning',
      description: 'Diện tích cháy rừng Amazon tăng 15% so với cùng kỳ năm ngoái. Brazil triển khai lực lượng quân đội hỗ trợ chữa cháy.',
    },
  ],
  generatedBy: 'sample',
  generatedAt: new Date().toISOString(),
}

export async function generateAISummary(articles: NewsArticle[]): Promise<AISummary> {
  // If no Gemini API key, return sample
  if (!GEMINI_API_KEY) {
    console.log('[AI Summary] No GEMINI_API_KEY, using sample data')
    return SAMPLE_SUMMARY
  }

  try {
    // Prepare headlines for Gemini
    const headlines = articles.slice(0, 30).map(a =>
      `[${a.category.toUpperCase()}] ${a.source}: ${a.title}`
    ).join('\n')

    const prompt = `Bạn là chuyên gia phân tích ESG (Môi trường - Xã hội - Quản trị) toàn cầu. Dựa trên các tiêu đề tin tức sau, hãy tạo bản tóm tắt ESG hàng ngày bằng tiếng Việt.

Lưu ý phân tích theo các tiêu chuẩn quốc tế:
- ISO 37122 (Thành phố thông minh bền vững): 17 lĩnh vực gồm Energy, Environment, Transportation, Urban Planning, Governance, Telecom/Innovation...
- BREEAM Communities (Smart Building): Governance, Social & Economic, Resources & Energy, Land Use & Ecology, Transport & Movement

Tin tức hôm nay:
${headlines}

Hãy trả về JSON với format sau (KHÔNG bao gồm markdown code block, chỉ JSON thuần):
{
  "summary": "Tóm tắt tổng quan 3-5 câu về tình hình ESG toàn cầu hôm nay, liên hệ các tiêu chuẩn ISO 37122/BREEAM nếu phù hợp",
  "highlights": [
    {
      "title": "Tiêu đề ngắn gọn",
      "category": "environment|social|governance",
      "severity": "info|warning|critical",
      "description": "Mô tả chi tiết 1-2 câu"
    }
  ]
}

Tạo 4-6 highlights, ưu tiên các sự kiện quan trọng nhất. Phân bổ đều giữa E/S/G.`

    const res = await fetchWithRetry(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
        },
      }),
      signal: AbortSignal.timeout(30000),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error(`[AI Summary] Gemini API error ${res.status}:`, errText)
      return SAMPLE_SUMMARY
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      console.error('[AI Summary] Empty response from Gemini')
      return SAMPLE_SUMMARY
    }

    const parsed = JSON.parse(text)

    console.log('[AI Summary] Generated successfully via Gemini')
    return {
      date: new Date().toISOString().split('T')[0],
      summary: parsed.summary || SAMPLE_SUMMARY.summary,
      highlights: (parsed.highlights || []).map((h: any) => ({
        title: h.title,
        category: h.category || 'general',
        severity: h.severity || 'info',
        description: h.description,
      })),
      generatedBy: 'gemini',
      generatedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('[AI Summary] Error:', error)
    return SAMPLE_SUMMARY
  }
}

// === Solutions AI Summary ===

const SAMPLE_SOLUTIONS_SUMMARY: SolutionsSummary = {
  summary: 'Xu hướng giải pháp ESG toàn cầu 2026 tập trung vào 4 trụ cột: năng lượng tái tạo (đặc biệt hydrogen xanh và điện gió ngoài khơi), giao thông xanh (điện hóa vận tải công cộng), nông nghiệp bền vững (ứng dụng AI và công nghệ chính xác), và kinh tế tuần hoàn (zero-waste). Các dự án Smart City theo ISO 37122 và công trình xanh BREEAM đang mở rộng nhanh tại châu Á. Việt Nam nổi bật với Smart Grid TP.HCM, Đà Nẵng Smart City, và các dự án đô thị xanh Vinhomes/Ecopark.',
  trends: [
    {
      title: 'Hydrogen xanh - Nhiên liệu tương lai',
      description: 'Đầu tư toàn cầu vào hydrogen xanh tăng 300% so với 2023. Úc, Chile, và Trung Đông dẫn đầu sản xuất. Việt Nam có tiềm năng lớn nhờ bờ biển dài và bức xạ mặt trời cao.',
      category: 'renewable-energy',
    },
    {
      title: 'Điện hóa giao thông đô thị',
      description: 'Hơn 60 thành phố cam kết 100% xe buýt điện trước 2035. Trung Quốc dẫn đầu với Thâm Quyến đã hoàn thành 100%. VinBus tại Việt Nam là mô hình tiêu biểu Đông Nam Á.',
      category: 'green-transport',
    },
    {
      title: 'Nông nghiệp thông minh ứng dụng AI',
      description: 'AI và drone trong nông nghiệp chính xác giúp giảm 40% lượng phân bón và thuốc BVTV. Việt Nam đang thí điểm tại Đắk Lắk và đồng bằng sông Cửu Long.',
      category: 'sustainable-agriculture',
    },
    {
      title: 'Zero-waste và kinh tế tuần hoàn',
      description: 'Mô hình Thụy Điển (tái chế 99% rác) đang được nhiều nước học hỏi. TP.HCM triển khai phân loại rác tại nguồn cho 10 triệu dân, mục tiêu giảm 50% chôn lấp.',
      category: 'waste-management',
    },
  ],
  vietnamFocus: 'Việt Nam đang có bước tiến mạnh mẽ với nhiều dự án ESG tiêu biểu: Smart Grid TP.HCM, Đà Nẵng Smart City (ISO 37122), Vinhomes Grand Park và Ecopark (BREEAM Communities), điện mặt trời Ninh Thuận (450MW), Metro TP.HCM tuyến 1, xe buýt điện VinBus. Chính phủ đặt mục tiêu 30% năng lượng tái tạo vào 2030 và Net Zero vào 2050.',
  generatedAt: new Date().toISOString(),
  generatedBy: 'sample',
}

let cachedSolutionsSummary: SolutionsSummary | null = null
let solutionsSummaryCacheTime = 0
const SOLUTIONS_SUMMARY_CACHE_TTL = 8 * 60 * 60 * 1000 // 8 hours

export async function generateSolutionsSummary(forceRefresh = false): Promise<SolutionsSummary> {
  // Check cache (unless force refresh)
  if (!forceRefresh && cachedSolutionsSummary && Date.now() - solutionsSummaryCacheTime < SOLUTIONS_SUMMARY_CACHE_TTL) {
    return cachedSolutionsSummary
  }

  if (!GEMINI_API_KEY) {
    console.log('[Solutions Summary] No GEMINI_API_KEY, using sample data')
    return SAMPLE_SOLUTIONS_SUMMARY
  }

  try {
    const prompt = `Bạn là chuyên gia phân tích giải pháp ESG (Môi trường - Xã hội - Quản trị) toàn cầu. Hãy phân tích xu hướng giải pháp ESG mới nhất và đề xuất cho Việt Nam, bằng tiếng Việt.

Lưu ý đánh giá theo các tiêu chuẩn quốc tế:
- ISO 37122 (Smart City bền vững): Energy, Environment, Transportation, Urban Planning, Governance, Telecom/Innovation
- BREEAM Communities (Smart Building): Governance (GO), Social & Economic (SE), Resources & Energy (RE), Land Use & Ecology (LE), Transport & Movement (TM)

Trả về JSON (KHÔNG bao gồm markdown code block, chỉ JSON thuần):
{
  "summary": "Tóm tắt xu hướng giải pháp ESG toàn cầu 3-5 câu, bao gồm ISO 37122 và BREEAM",
  "trends": [
    {
      "title": "Tên xu hướng",
      "description": "Mô tả chi tiết 2-3 câu",
      "category": "renewable-energy|green-transport|sustainable-agriculture|waste-management"
    }
  ],
  "vietnamFocus": "Phân tích và đề xuất 3-4 câu cho Việt Nam, liên hệ Smart City/BREEAM"
}

Tạo 4 trends, mỗi category 1 trend.`

    const res = await fetchWithRetry(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
        },
      }),
      signal: AbortSignal.timeout(30000),
    })

    if (!res.ok) {
      console.error(`[Solutions Summary] Gemini API error ${res.status}`)
      return SAMPLE_SOLUTIONS_SUMMARY
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      console.error('[Solutions Summary] Empty response from Gemini')
      return SAMPLE_SOLUTIONS_SUMMARY
    }

    const parsed = JSON.parse(text)
    const result: SolutionsSummary = {
      summary: parsed.summary || SAMPLE_SOLUTIONS_SUMMARY.summary,
      trends: parsed.trends || SAMPLE_SOLUTIONS_SUMMARY.trends,
      vietnamFocus: parsed.vietnamFocus || SAMPLE_SOLUTIONS_SUMMARY.vietnamFocus,
      generatedAt: new Date().toISOString(),
      generatedBy: 'gemini',
    }

    cachedSolutionsSummary = result
    solutionsSummaryCacheTime = Date.now()
    console.log('[Solutions Summary] Generated successfully via Gemini')
    return result
  } catch (error) {
    console.error('[Solutions Summary] Error:', error)
    return SAMPLE_SOLUTIONS_SUMMARY
  }
}

// Reset caches (used by cron)
export function resetAICaches() {
  cachedSolutionsSummary = null
  solutionsSummaryCacheTime = 0
}
