import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ESG Map - Bản Đồ ESG Toàn Cầu',
  description: 'Giám sát Môi trường - Xã hội - Quản trị toàn cầu thời gian thực. Chất lượng không khí, động đất, thiên tai, xung đột trên bản đồ tương tác.',
  keywords: ['ESG', 'môi trường', 'ô nhiễm', 'động đất', 'bản đồ', 'smart city', 'đô thị thông minh'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-esg-darker text-slate-200 antialiased">
        {children}
      </body>
    </html>
  )
}
