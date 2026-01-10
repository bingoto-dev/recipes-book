import { useState } from 'react'

function AddRecipe({ onAddRecipe }) {
  const [url, setUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const supportedPlatforms = [
    {
      name: 'Instagram',
      color: 'text-[#E4405F]',
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
    {
      name: 'TikTok',
      color: 'text-[#000000]',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      )
    },
    {
      name: 'YouTube',
      color: 'text-[#FF0000]',
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    },
    {
      name: 'Pinterest',
      color: 'text-[#BD081C]',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0a12 12 0 0 0-4.373 23.178c-.07-.937-.134-2.377.028-3.401.146-.925.944-3.998.944-3.998s-.241-.482-.241-1.193c0-1.117.648-1.951 1.454-1.951.686 0 1.017.515 1.017 1.131 0 .689-.439 1.72-.666 2.676-.189.8.402 1.453 1.192 1.453 1.43 0 2.529-1.507 2.529-3.682 0-1.926-1.384-3.27-3.361-3.27-2.29 0-3.633 1.717-3.633 3.493 0 .692.266 1.433.599 1.836.066.08.075.149.056.23-.061.255-.197.8-.224.912-.035.146-.116.177-.268.107-1.001-.466-1.626-1.93-1.626-3.107 0-2.529 1.838-4.852 5.299-4.852 2.782 0 4.943 1.982 4.943 4.631 0 2.764-1.742 4.99-4.16 4.99-.812 0-1.577-.423-1.838-.92l-.5 1.906c-.181.698-.671 1.573-1 2.106a12 12 0 1 0 3.828-23.36z"/>
        </svg>
      )
    },
    {
      name: 'Websites',
      color: 'text-[#4A3728]',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      )
    },
    {
      name: 'Articles',
      color: 'text-[#4A3728]',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      )
    },
  ]

  const extractRecipe = async () => {
    if (!url.trim()) return

    setIsProcessing(true)
    setError('')
    setStatus('Fetching page content...')

    try {
      setStatus('AI is analyzing the recipe...')

      const response = await fetch('/.netlify/functions/extract-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      })

      const text = await response.text()

      if (!text) {
        throw new Error('Empty response from server')
      }

      let data
      try {
        data = JSON.parse(text)
      } catch (e) {
        console.error('Failed to parse response:', text)
        throw new Error('Invalid response from server')
      }

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to extract recipe')
      }

      setStatus('Recipe extracted successfully!')

      // Short delay to show success message
      await new Promise(resolve => setTimeout(resolve, 500))

      onAddRecipe(data)
      setUrl('')
      setStatus('')
    } catch (err) {
      console.error('Error:', err)
      setError(err.message || 'Failed to extract recipe. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl font-semibold text-[#4A3728] mb-3">
          Add a New Recipe
        </h2>
        <p className="text-[#8B7355]">
          Paste any recipe link and AI will extract it for you automatically
        </p>
      </div>

      {/* URL Input Card */}
      <div className="bg-[#FFFBF0] rounded-2xl p-6 shadow-sm border border-[#E5D9C9] mb-6">
        <div className="relative">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isProcessing && url.trim() && extractRecipe()}
            placeholder="Paste recipe URL here..."
            className="w-full px-4 py-3.5 pr-28 rounded-xl bg-[#FFF8E7] text-[#4A3728] placeholder-[#8B7355] text-base focus:outline-none focus:ring-2 focus:ring-[#C4704A]/30 border border-[#E5D9C9] transition-all"
            disabled={isProcessing}
          />
          <button
            onClick={extractRecipe}
            disabled={isProcessing || !url.trim()}
            className={`absolute right-1.5 top-1/2 -translate-y-1/2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              isProcessing || !url.trim()
                ? 'bg-[#E5D9C9] text-[#8B7355] cursor-not-allowed'
                : 'bg-[#C4704A] text-white hover:bg-[#D4805A]'
            }`}
          >
            {isProcessing ? 'Extracting...' : 'Extract'}
          </button>
        </div>

        {/* Status Message */}
        {isProcessing && status && (
          <div className="mt-4 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-[#C4704A] border-t-transparent rounded-full animate-spin" />
            <span className="text-[#8B7355] text-sm">{status}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Supported Platforms */}
      <div className="bg-[#FFFBF0] rounded-2xl p-6 shadow-sm border border-[#E5D9C9]">
        <h3 className="text-[#4A3728] font-medium text-sm mb-4 text-center uppercase tracking-wide">
          Supported Platforms
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {supportedPlatforms.map((platform) => (
            <div
              key={platform.name}
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[#FFF8E7] transition-colors"
            >
              <span className={platform.color}>{platform.icon}</span>
              <span className="text-[#8B7355] text-xs font-medium">{platform.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="mt-6 grid sm:grid-cols-3 gap-4">
        <div className="bg-[#FFFBF0] rounded-xl p-5 shadow-sm border border-[#E5D9C9] text-center">
          <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-[#7A8450] flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="text-[#4A3728] font-medium text-sm mb-1">Auto-Extract</h4>
          <p className="text-[#8B7355] text-xs">Ingredients & steps pulled automatically</p>
        </div>
        <div className="bg-[#FFFBF0] rounded-xl p-5 shadow-sm border border-[#E5D9C9] text-center">
          <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-[#C4704A] flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h4 className="text-[#4A3728] font-medium text-sm mb-1">Nutrition Info</h4>
          <p className="text-[#8B7355] text-xs">Macros calculated per serving</p>
        </div>
        <div className="bg-[#FFFBF0] rounded-xl p-5 shadow-sm border border-[#E5D9C9] text-center">
          <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-[#C9A962] flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 className="text-[#4A3728] font-medium text-sm mb-1">Beautiful Cards</h4>
          <p className="text-[#8B7355] text-xs">Auto-generated recipe images</p>
        </div>
      </div>

      {/* Note */}
      <p className="text-center text-[#8B7355] text-xs mt-6">
        Powered by Claude AI — extracts recipes from most recipe websites
      </p>
    </div>
  )
}

export default AddRecipe
