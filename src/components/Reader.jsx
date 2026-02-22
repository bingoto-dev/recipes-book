import { useState, useEffect } from 'react'

function Reader({ article, onBack, theme, fontSize, onThemeChange, onFontSizeChange }) {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        if (showSettings) setShowSettings(false)
        else onBack()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onBack, showSettings])

  // Close settings when clicking outside
  useEffect(() => {
    if (!showSettings) return
    const handleClick = (e) => {
      if (!e.target.closest('[data-settings]')) setShowSettings(false)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [showSettings])

  const bgClass =
    theme === 'dark' ? 'bg-[#1a1a1a] text-[#d4cfc7]'
    : theme === 'sepia' ? 'bg-[#f4ecd8] text-[#433322]'
    : 'bg-white text-stone-900'

  const headerBg =
    theme === 'dark' ? 'bg-[#1a1a1a]/90 border-stone-800'
    : theme === 'sepia' ? 'bg-[#f4ecd8]/90 border-[#ddd0b5]'
    : 'bg-white/90 border-stone-200'

  const metaColor =
    theme === 'dark' ? 'text-stone-500'
    : theme === 'sepia' ? 'text-[#8b7355]'
    : 'text-stone-500'

  const hrColor =
    theme === 'dark' ? 'border-stone-800'
    : theme === 'sepia' ? 'border-[#d4c9a8]'
    : 'border-stone-200'

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-300`}>
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-50">
        <div
          className="h-full bg-amber-600 transition-[width] duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Sticky header */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b ${headerBg}`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className={`flex items-center gap-1 text-sm font-medium transition-colors ${
              theme === 'dark' ? 'text-stone-400 hover:text-stone-200' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <span className={`text-xs truncate max-w-[180px] sm:max-w-xs ${
            theme === 'dark' ? 'text-stone-600' : 'text-stone-400'
          }`}>
            {article.title}
          </span>

          {/* Settings */}
          <div className="relative" data-settings>
            <button
              onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings) }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                theme === 'dark' ? 'hover:bg-stone-800' : 'hover:bg-stone-100'
              }`}
              title="Reading settings"
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {showSettings && (
              <div className={`absolute right-0 top-full mt-2 w-60 rounded-xl shadow-xl p-4 z-50 border ${
                theme === 'dark' ? 'bg-stone-900 border-stone-700' : 'bg-white border-stone-200'
              }`}>
                {/* Theme */}
                <label className={`text-xs font-medium mb-2 block ${metaColor}`}>Theme</label>
                <div className="flex gap-2 mb-4">
                  {[
                    { key: 'light', label: 'Aa', cls: 'bg-white text-stone-900 border-stone-300' },
                    { key: 'sepia', label: 'Aa', cls: 'bg-[#f4ecd8] text-[#433322] border-[#d4c9a8]' },
                    { key: 'dark', label: 'Aa', cls: 'bg-[#1a1a1a] text-[#d4cfc7] border-stone-600' },
                  ].map(t => (
                    <button
                      key={t.key}
                      onClick={() => onThemeChange(t.key)}
                      className={`flex-1 py-2 rounded-lg border text-sm transition-all ${t.cls} ${
                        theme === t.key ? 'ring-2 ring-amber-500 ring-offset-1' : ''
                      }`}
                      style={{ fontFamily: "'Lora', Georgia, serif" }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Font size */}
                <label className={`text-xs font-medium mb-2 block ${metaColor}`}>
                  Size: {fontSize}px
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onFontSizeChange(Math.max(14, fontSize - 2))}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-base font-medium ${
                      theme === 'dark' ? 'bg-stone-800 hover:bg-stone-700' : 'bg-stone-100 hover:bg-stone-200'
                    }`}
                  >
                    A
                  </button>
                  <div className={`flex-1 h-1.5 rounded-full relative overflow-hidden ${
                    theme === 'dark' ? 'bg-stone-700' : 'bg-stone-200'
                  }`}>
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-amber-600 transition-all"
                      style={{ width: `${((fontSize - 14) / 14) * 100}%` }}
                    />
                  </div>
                  <button
                    onClick={() => onFontSizeChange(Math.min(28, fontSize + 2))}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg font-medium ${
                      theme === 'dark' ? 'bg-stone-800 hover:bg-stone-700' : 'bg-stone-100 hover:bg-stone-200'
                    }`}
                  >
                    A
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Article */}
      <article className="max-w-[680px] mx-auto px-5 sm:px-6 py-10 sm:py-14">
        <header className="mb-8">
          <h1
            className="text-3xl sm:text-[2.5rem] font-bold leading-tight mb-4"
            style={{ fontFamily: "'Lora', Georgia, serif" }}
          >
            {article.title}
          </h1>
          <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-sm ${metaColor}`}>
            {article.author && <span>By {article.author}</span>}
            {article.author && article.source && <span>·</span>}
            {article.source && <span>{article.source}</span>}
            {(article.author || article.source) && article.readingTime && <span>·</span>}
            {article.readingTime && <span>{article.readingTime} min read</span>}
            {article.wordCount && (
              <>
                <span>·</span>
                <span>{article.wordCount.toLocaleString()} words</span>
              </>
            )}
          </div>
        </header>

        <hr className={`mb-10 ${hrColor}`} />

        <div
          className="article-content"
          style={{ fontSize: `${fontSize}px` }}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* End */}
        <div className={`mt-16 mb-8 text-center text-xl ${
          theme === 'dark' ? 'text-stone-700' : theme === 'sepia' ? 'text-[#c4b694]' : 'text-stone-300'
        }`}>
          ◆
        </div>

        <div className="text-center pb-8">
          <button
            onClick={onBack}
            className={`text-sm font-medium transition-colors ${
              theme === 'dark' ? 'text-stone-500 hover:text-stone-300' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            ← Back to shelf
          </button>
        </div>
      </article>
    </div>
  )
}

export default Reader
