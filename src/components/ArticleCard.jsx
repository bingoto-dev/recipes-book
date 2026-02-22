import { useState } from 'react'

function ArticleCard({ article, onRead, onDelete, theme }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isDark = theme === 'dark'
  const isSepia = theme === 'sepia'

  const savedDate = new Date(article.savedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  })

  return (
    <div
      className={`group relative rounded-xl p-5 cursor-pointer transition-all duration-200 ${
        isDark
          ? 'bg-stone-900 border border-stone-800 hover:border-stone-700'
          : isSepia
            ? 'bg-[#faf3e3] border border-[#e0d5be] hover:border-[#c4b694] hover:shadow-md'
            : 'bg-white border border-stone-200 hover:border-stone-300 hover:shadow-md'
      }`}
      onClick={onRead}
    >
      {/* Source + reading time */}
      <div className={`flex items-center gap-2 text-xs mb-2.5 ${
        isDark ? 'text-stone-500' : isSepia ? 'text-[#8b7355]' : 'text-stone-500'
      }`}>
        {article.source && <span className="font-medium">{article.source}</span>}
        {article.source && article.readingTime && <span>·</span>}
        {article.readingTime && <span>{article.readingTime} min read</span>}
      </div>

      {/* Title */}
      <h3 className="font-semibold leading-snug mb-2 line-clamp-2">{article.title}</h3>

      {/* Excerpt */}
      {article.excerpt && (
        <p className={`text-sm leading-relaxed line-clamp-2 mb-3 ${
          isDark ? 'text-stone-400' : isSepia ? 'text-[#6d5c45]' : 'text-stone-600'
        }`}>
          {article.excerpt}
        </p>
      )}

      {/* Footer */}
      <div className={`flex items-center gap-2 text-xs ${
        isDark ? 'text-stone-600' : isSepia ? 'text-[#a08b6d]' : 'text-stone-400'
      }`}>
        {article.author && <span>By {article.author}</span>}
        {article.author && <span>·</span>}
        <span>{savedDate}</span>
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          if (confirmDelete) {
            onDelete()
          } else {
            setConfirmDelete(true)
            setTimeout(() => setConfirmDelete(false), 2500)
          }
        }}
        className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-all text-xs ${
          confirmDelete
            ? 'bg-red-500 text-white opacity-100'
            : isDark
              ? 'opacity-0 group-hover:opacity-100 bg-stone-800 text-stone-400 hover:bg-stone-700'
              : 'opacity-0 group-hover:opacity-100 bg-stone-100 text-stone-400 hover:bg-stone-200'
        }`}
        title={confirmDelete ? 'Tap again to delete' : 'Delete'}
      >
        ×
      </button>
    </div>
  )
}

export default ArticleCard
