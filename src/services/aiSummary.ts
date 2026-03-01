import { AISummary, SummaryHighlight, NewsArticle } from '@/types/news'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_MODEL = 'gemini-2.0-flash'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

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
    return SAMPLE_SUMMARY
  }

  try {
    // Prepare headlines for Gemini
    const headlines = articles.slice(0, 30).map(a =>
      `[${a.category.toUpperCase()}] ${a.source}: ${a.title}`
    ).join('\n')

    const prompt = `Bạn là chuyên gia phân tích ESG (Môi trường - Xã hội - Quản trị) toàn cầu. Dựa trên các tiêu đề tin tức sau, hãy tạo bản tóm tắt ESG hàng ngày bằng tiếng Việt.

Tin tức hôm nay:
${headlines}

Hãy trả về JSON với format sau (KHÔNG bao gồm markdown code block, chỉ JSON thuần):
{
  "summary": "Tóm tắt tổng quan 3-5 câu về tình hình ESG toàn cầu hôm nay",
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

    const res = await fetch(GEMINI_URL, {
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
      console.error('Gemini API error:', res.status, await res.text())
      return SAMPLE_SUMMARY
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) return SAMPLE_SUMMARY

    const parsed = JSON.parse(text)

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
    console.error('AI Summary error:', error)
    return SAMPLE_SUMMARY
  }
}
