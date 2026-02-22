import { useState, useEffect, useCallback } from 'react'
import Library from './components/Library'
import Reader from './components/Reader'
import SaveArticle from './components/SaveArticle'
import { getAllArticles, saveArticle, deleteArticle } from './lib/db'

function App() {
  const [view, setView] = useState('library')
  const [articles, setArticles] = useState([])
  const [currentArticle, setCurrentArticle] = useState(null)
  const [showSave, setShowSave] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('shelf-theme') || 'sepia')
  const [fontSize, setFontSize] = useState(() => parseInt(localStorage.getItem('shelf-fontsize')) || 20)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllArticles().then(all => {
      setArticles(all.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => { localStorage.setItem('shelf-theme', theme) }, [theme])
  useEffect(() => { localStorage.setItem('shelf-fontsize', fontSize.toString()) }, [fontSize])

  const handleSave = useCallback(async (article) => {
    await saveArticle(article)
    setArticles(prev => [article, ...prev])
    setShowSave(false)
  }, [])

  const handleDelete = useCallback(async (id) => {
    await deleteArticle(id)
    setArticles(prev => prev.filter(a => a.id !== id))
  }, [])

  const handleRead = useCallback((article) => {
    setCurrentArticle(article)
    setView('reader')
    window.scrollTo(0, 0)
  }, [])

  const handleBack = useCallback(() => {
    setView('library')
    setCurrentArticle(null)
  }, [])

  if (view === 'reader' && currentArticle) {
    return (
      <Reader
        article={currentArticle}
        onBack={handleBack}
        theme={theme}
        fontSize={fontSize}
        onThemeChange={setTheme}
        onFontSizeChange={setFontSize}
      />
    )
  }

  const bg = theme === 'dark' ? 'bg-stone-950 text-stone-200'
    : theme === 'sepia' ? 'bg-[#f4ecd8] text-stone-900'
    : 'bg-[#faf7f2] text-stone-900'

  return (
    <div className={`min-h-screen transition-colors duration-300 ${bg}`}>
      <Library
        articles={articles}
        loading={loading}
        onRead={handleRead}
        onDelete={handleDelete}
        onSave={() => setShowSave(true)}
        theme={theme}
        onThemeChange={setTheme}
      />
      {showSave && (
        <SaveArticle
          onSave={handleSave}
          onClose={() => setShowSave(false)}
          theme={theme}
        />
      )}
    </div>
  )
}

export default App
