import { useState } from 'react'
import ArticleCard from './ArticleCard'

function Library({ articles, loading, onRead, onDelete, onSave, theme, onThemeChange }) {
  const [search, setSearch] = useState('')
  const isDark = theme === 'dark'

  const filtered = search
    ? articles.filter(a =>
        (a.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.author || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.source || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.excerpt || '').toLowerCase().includes(search.toLowerCase())
      )
    : articles

  const cycleTheme = () => {
    const order = ['light', 'sepia', 'dark']
    const next = order[(order.indexOf(theme) + 1) % order.length]
    onThemeChange(next)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <header className="py-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shelf</h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-stone-500' : 'text-stone-500'}`}>
            {articles.length} article{articles.length !== 1 ? 's' : ''} saved offline
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={cycleTheme}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-colors ${
              isDark ? 'hover:bg-stone-800' : 'hover:bg-stone-200/60'
            }`}
            title="Change theme"
          >
            {theme === 'dark' ? '🌙' : theme === 'sepia' ? '📜' : '☀️'}
          </button>

          {/* Save button */}
          <button
            onClick={onSave}
            className="px-4 py-2 bg-amber-700 text-white text-sm font-medium rounded-lg hover:bg-amber-800 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Save
          </button>
        </div>
      </header>

      {/* Search */}
      {articles.length > 0 && (
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search saved articles..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl text-sm transition-colors outline-none ${
              isDark
                ? 'bg-stone-900 border border-stone-800 placeholder-stone-600 focus:border-stone-600'
                : theme === 'sepia'
                  ? 'bg-[#faf3e3] border border-[#e0d5be] placeholder-stone-400 focus:border-[#c4b694]'
                  : 'bg-white border border-stone-200 placeholder-stone-400 focus:border-stone-400'
            }`}
          />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-6 h-6 border-2 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-stone-500 text-sm">Loading your shelf...</p>
        </div>
      ) : filtered.length === 0 && articles.length === 0 ? (
        <EmptyState onSave={onSave} isDark={isDark} />
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-stone-500">No articles match your search</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-12">
          {filtered.map((article, i) => (
            <div key={article.id} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
              <ArticleCard
                article={article}
                onRead={() => onRead(article)}
                onDelete={() => onDelete(article.id)}
                theme={theme}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyState({ onSave, isDark }) {
  return (
    <div className="py-20 text-center">
      <div className="text-6xl mb-6">📖</div>
      <h2 className="text-xl font-semibold mb-2">Your reading shelf is empty</h2>
      <p className={`mb-6 max-w-sm mx-auto text-sm leading-relaxed ${isDark ? 'text-stone-500' : 'text-stone-500'}`}>
        Save articles, Substack posts, blog entries, and Twitter threads to read offline — even on a plane.
      </p>
      <button
        onClick={onSave}
        className="px-5 py-2.5 bg-amber-700 text-white text-sm font-medium rounded-lg hover:bg-amber-800 transition-colors"
      >
        Save your first article
      </button>
    </div>
  )
}

export default Library
