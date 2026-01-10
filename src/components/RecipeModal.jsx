import { useState } from 'react'

function RecipeModal({ recipe, onClose, onDelete }) {
  const [activeTab, setActiveTab] = useState('ingredients')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [checkedIngredients, setCheckedIngredients] = useState([])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(recipe.id)
    } else {
      setShowDeleteConfirm(true)
    }
  }

  const toggleIngredient = (index) => {
    setCheckedIngredients(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-overlay"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl modal-content">
        {/* Header with Image - Taller like mockup */}
        <div className="relative h-72 sm:h-80 overflow-hidden">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/95 flex items-center justify-center text-[#4A3728] hover:bg-white transition-colors shadow-lg text-xl font-light"
          >
            ×
          </button>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className={`absolute top-4 left-4 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-medium transition-all shadow-lg ${
              showDeleteConfirm
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white/95 text-[#4A3728] hover:bg-red-500 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {showDeleteConfirm ? 'Confirm' : 'Delete'}
          </button>

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
            <h2 className="font-display text-3xl font-bold text-white mb-2">{recipe.title}</h2>
            <div className="flex flex-wrap gap-5 text-white/90 text-sm">
              <span className="flex items-center gap-1.5">
                <span>⏱</span> {recipe.prepTime} + {recipe.cookTime}
              </span>
              <span className="flex items-center gap-1.5">
                <span>👥</span> {recipe.servings} servings
              </span>
              <span className="flex items-center gap-1.5">
                <span>📊</span> {recipe.difficulty}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-320px)]">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b-2 border-[#E5D9C9]">
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`px-6 py-3 text-sm font-semibold transition-colors relative ${
                activeTab === 'ingredients'
                  ? 'text-[#4A3728]'
                  : 'text-[#8B7355] hover:text-[#6D4C41]'
              }`}
            >
              Ingredients
              {activeTab === 'ingredients' && (
                <div className="absolute bottom-[-2px] left-0 right-0 h-[3px] bg-[#C4704A] rounded-t" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('instructions')}
              className={`px-6 py-3 text-sm font-semibold transition-colors relative ${
                activeTab === 'instructions'
                  ? 'text-[#4A3728]'
                  : 'text-[#8B7355] hover:text-[#6D4C41]'
              }`}
            >
              Instructions
              {activeTab === 'instructions' && (
                <div className="absolute bottom-[-2px] left-0 right-0 h-[3px] bg-[#C4704A] rounded-t" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-6 py-3 text-sm font-semibold transition-colors relative ${
                activeTab === 'notes'
                  ? 'text-[#4A3728]'
                  : 'text-[#8B7355] hover:text-[#6D4C41]'
              }`}
            >
              Notes
              {activeTab === 'notes' && (
                <div className="absolute bottom-[-2px] left-0 right-0 h-[3px] bg-[#C4704A] rounded-t" />
              )}
            </button>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-8">
            {/* Left Column - Content */}
            <div>
              {activeTab === 'ingredients' && (
                <div>
                  <h3 className="font-display text-lg font-semibold text-[#4A3728] mb-4">
                    Ingredients ({recipe.servings} servings)
                  </h3>
                  <ul className="space-y-0">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-3 py-3 border-b border-[#E5D9C9] cursor-pointer hover:bg-[#FFF8E7] -mx-2 px-2 rounded"
                        onClick={() => toggleIngredient(index)}
                      >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          checkedIngredients.includes(index)
                            ? 'bg-[#7A8450] border-[#7A8450]'
                            : 'border-[#8D6E63]'
                        }`}>
                          {checkedIngredients.includes(index) && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm transition-all ${
                          checkedIngredients.includes(index)
                            ? 'text-[#8B7355] line-through'
                            : 'text-[#4A3728]'
                        }`}>
                          {ingredient}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === 'instructions' && (
                <div>
                  <h3 className="font-display text-lg font-semibold text-[#4A3728] mb-4">
                    Instructions
                  </h3>
                  <ol className="space-y-4">
                    {recipe.instructions.map((instruction, index) => (
                      <li key={index} className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-[#C4704A] flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold">
                          {index + 1}
                        </div>
                        <p className="text-[#4A3728] text-sm leading-relaxed pt-1">{instruction}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {activeTab === 'notes' && (
                <div>
                  <h3 className="font-display text-lg font-semibold text-[#4A3728] mb-4">
                    Chef's Notes
                  </h3>
                  <div className="bg-[#FFF8E7] rounded-xl p-5 border border-[#E5D9C9]">
                    <p className="text-[#6D4C41] text-sm leading-relaxed italic">
                      {recipe.description}
                    </p>
                    <div className="mt-4 pt-4 border-t border-[#E5D9C9]">
                      <p className="text-[#8B7355] text-xs">
                        Cuisine: {recipe.cuisine} • Difficulty: {recipe.difficulty}
                      </p>
                    </div>
                  </div>
                  {/* Tags */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-[#4A3728] mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {recipe.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-[#FFF8E7] border border-[#E5D9C9] text-[#6D4C41] text-xs rounded-full font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Nutrition Facts */}
            <div className="bg-[#FFF8E7] rounded-2xl p-5 h-fit">
              <h3 className="font-display text-lg font-semibold text-[#4A3728] mb-4">
                Nutrition Facts
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {/* Calories - Highlighted */}
                <div className="bg-[#C4704A] rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">{recipe.nutrition.calories}</div>
                  <div className="text-xs text-white/80 uppercase tracking-wide mt-1">Calories</div>
                </div>
                {/* Protein */}
                <div className="bg-white rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[#4A3728]">{recipe.nutrition.protein}g</div>
                  <div className="text-xs text-[#8B7355] uppercase tracking-wide mt-1">Protein</div>
                </div>
                {/* Carbs */}
                <div className="bg-white rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[#4A3728]">{recipe.nutrition.carbs}g</div>
                  <div className="text-xs text-[#8B7355] uppercase tracking-wide mt-1">Carbs</div>
                </div>
                {/* Fat */}
                <div className="bg-white rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[#4A3728]">{recipe.nutrition.fat}g</div>
                  <div className="text-xs text-[#8B7355] uppercase tracking-wide mt-1">Fat</div>
                </div>
                {/* Fiber */}
                <div className="bg-white rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[#4A3728]">{recipe.nutrition.fiber}g</div>
                  <div className="text-xs text-[#8B7355] uppercase tracking-wide mt-1">Fiber</div>
                </div>
                {/* Sugar */}
                <div className="bg-white rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[#4A3728]">{recipe.nutrition.sugar}g</div>
                  <div className="text-xs text-[#8B7355] uppercase tracking-wide mt-1">Sugar</div>
                </div>
              </div>
              {/* Sodium */}
              <div className="bg-white rounded-xl p-4 text-center mt-3">
                <div className="text-xl font-bold text-[#4A3728]">{recipe.nutrition.sodium}mg</div>
                <div className="text-xs text-[#8B7355] uppercase tracking-wide mt-1">Sodium</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecipeModal
