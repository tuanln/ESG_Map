'use client'

import { useState } from 'react'

interface HeaderProps {
  onToggleSidebar: () => void
  sidebarOpen: boolean
}

export default function Header({ onToggleSidebar, sidebarOpen }: HeaderProps) {
  const [lang, setLang] = useState<'vi' | 'en'>('vi')

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-12 bg-esg-darker/90 backdrop-blur-md border-b border-esg-border flex items-center justify-between px-4">
      {/* Left: Logo + Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-esg-card transition-colors"
          title={sidebarOpen ? 'Ẩn sidebar' : 'Hiện sidebar'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {sidebarOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <>
                <path d="M3 12h18M3 6h18M3 18h18" />
              </>
            )}
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-esg-green to-esg-blue flex items-center justify-center text-white text-xs font-bold">
            E
          </div>
          <div>
            <h1 className="text-sm font-bold leading-none text-white">ESG Map</h1>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5">Bản đồ ESG Toàn Cầu</p>
          </div>
        </div>
      </div>

      {/* Center: Nav */}
      <nav className="hidden md:flex items-center gap-1">
        {[
          { label: 'Bản đồ', href: '/', active: true },
          { label: 'Phân tích', href: '/dashboard', active: false },
          { label: 'Tin tức', href: '/news', active: false },
          { label: 'Giải pháp', href: '/solutions', active: false },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              item.active
                ? 'bg-esg-card text-white'
                : 'text-slate-400 hover:text-white hover:bg-esg-card/50'
            }`}
          >
            {item.label}
          </a>
        ))}
      </nav>

      {/* Right: Language + Status */}
      <div className="flex items-center gap-3">
        {/* Live indicator */}
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-esg-green animate-pulse" />
          <span className="text-[10px] text-slate-400 hidden sm:inline">TRỰC TIẾP</span>
        </div>

        {/* Language toggle */}
        <button
          onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
          className="px-2 py-1 text-xs rounded border border-esg-border hover:bg-esg-card transition-colors text-slate-300"
        >
          {lang === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}
        </button>
      </div>
    </header>
  )
}
