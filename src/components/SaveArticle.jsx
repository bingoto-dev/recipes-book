import { useState } from 'react'

function SaveArticle({ onSave, onClose, theme }) {
  const [mode, setMode] = useState('url')
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')

  const isDark = theme === 'dark'

  const inputClass = isDark
    ? 'bg-stone-800 border border-stone-700 placeholder-stone-600 focus:border-stone-500 text-stone-200'
    : 'bg-stone-50 border border-stone-200 placeholder-stone-400 focus:border-stone-400 text-stone-900'

  const handleSubmitUrl = async () => {
    if (!url.trim()) return
    setIsProcessing(true)
    setError('')
    setStatus('Fetching & extracting article...')

    try {
      const res = await fetch('/.netlify/functions/extract-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to extract article')
      onSave(data)
    } catch (err) {
      setError(
        !navigator.onLine
          ? "You're offline. Connect to the internet to save new articles."
          : err.message || 'Failed to extract article.'
      )
    } finally {
      setIsProcessing(false)
      setStatus('')
    }
  }

  const handleSubmitText = async () => {
    if (!text.trim()) return
    setIsProcessing(true)
    setError('')
    setStatus('Formatting text...')

    try {
      const res = await fetch('/.netlify/functions/extract-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manualText: text.trim(), manualTitle: title.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to process text')
      onSave(data)
    } catch (err) {
      setError(
        !navigator.onLine
          ? "You're offline. Connect to the internet to save new articles."
          : err.message || 'Failed to process text.'
      )
    } finally {
      setIsProcessing(false)
      setStatus('')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && !isProcessing && onClose()}
    >
      <div className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl ${
        isDark ? 'bg-stone-900 border border-stone-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">Save Article</h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
              isDark ? 'hover:bg-stone-800 text-stone-400' : 'hover:bg-stone-100 text-stone-500'
            }`}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 mb-5 p-1 rounded-lg ${isDark ? 'bg-stone-800' : 'bg-stone-100'}`}>
          {[
            { key: 'url', label: 'Paste URL' },
            { key: 'text', label: 'Paste Text' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setMode(tab.key); setError('') }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === tab.key
                  ? isDark ? 'bg-stone-700 text-white' : 'bg-white text-stone-900 shadow-sm'
                  : isDark ? 'text-stone-400' : 'text-stone-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* URL mode */}
        {mode === 'url' && (
          <>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !isProcessing && handleSubmitUrl()}
              placeholder="https://example.com/article..."
              className={`w-full px-4 py-3 rounded-xl text-sm mb-3 outline-none transition-colors ${inputClass}`}
              disabled={isProcessing}
              autoFocus
            />
            <p className={`text-xs mb-4 leading-relaxed ${isDark ? 'text-stone-600' : 'text-stone-400'}`}>
              Works with Substack, Medium, blog posts, news sites, and most web pages.
              For Twitter/X threads or paywalled content, use "Paste Text".
            </p>
          </>
        )}

        {/* Text mode */}
        {mode === 'text' && (
          <>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Article title (optional)"
              className={`w-full px-4 py-3 rounded-xl text-sm mb-3 outline-none transition-colors ${inputClass}`}
              disabled={isProcessing}
              autoFocus
            />
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste the article text here..."
              rows={8}
              className={`w-full px-4 py-3 rounded-xl text-sm mb-3 outline-none resize-none transition-colors ${inputClass}`}
              disabled={isProcessing}
            />
            <p className={`text-xs mb-4 leading-relaxed ${isDark ? 'text-stone-600' : 'text-stone-400'}`}>
              Copy text from Twitter threads, paid Substacks, or any source and paste it here.
              AI will clean it up and format it for reading.
            </p>
          </>
        )}

        {/* Error */}
        {error && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            isDark
              ? 'bg-red-900/20 border border-red-800/40 text-red-400'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {error}
          </div>
        )}

        {/* Status spinner */}
        {isProcessing && status && (
          <div className="mb-4 flex items-center gap-2.5 text-sm text-amber-700">
            <div className="w-4 h-4 border-2 border-amber-700 border-t-transparent rounded-full animate-spin" />
            {status}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={mode === 'url' ? handleSubmitUrl : handleSubmitText}
          disabled={isProcessing || (mode === 'url' ? !url.trim() : !text.trim())}
          className="w-full py-3 bg-amber-700 text-white text-sm font-medium rounded-xl hover:bg-amber-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? 'Processing...' : 'Save to Shelf'}
        </button>
      </div>
    </div>
  )
}

export default SaveArticle
