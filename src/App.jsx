import { useState } from 'react'
import RecipeGrid from './components/RecipeGrid'
import AddRecipe from './components/AddRecipe'
import RecipeModal from './components/RecipeModal'
import { mockRecipes } from './data/mockRecipes'

function App() {
  const [activeTab, setActiveTab] = useState('recipes')
  const [recipes, setRecipes] = useState(mockRecipes)
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedRecipe(null)
  }

  const handleDeleteRecipe = (recipeId) => {
    setRecipes(recipes.filter(r => r.id !== recipeId))
    handleCloseModal()
  }

  const handleAddRecipe = (newRecipe) => {
    setRecipes([newRecipe, ...recipes])
    setActiveTab('recipes')
  }

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      {/* Header */}
      <header className="header-nav sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 style={{ fontFamily: 'Poppins, sans-serif' }} className="text-3xl font-semibold text-[#FFFBF0]">
            Lippie & Mathi's Raving Recipes
          </h1>

          {/* Navigation Tabs */}
          <nav className="flex gap-3">
            <button
              onClick={() => setActiveTab('recipes')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'recipes'
                  ? 'bg-[#C4704A] text-white'
                  : 'bg-white/15 text-[#FFFBF0] border border-white/30 hover:bg-white/25'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
              </svg>
              My Recipes
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'add'
                  ? 'bg-[#C4704A] text-white'
                  : 'bg-white/15 text-[#FFFBF0] border border-white/30 hover:bg-white/25'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m-7-7h14" />
              </svg>
              Add Recipe
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'recipes' ? (
          <RecipeGrid recipes={recipes} onRecipeClick={handleRecipeClick} />
        ) : (
          <AddRecipe onAddRecipe={handleAddRecipe} />
        )}
      </main>

      {/* Recipe Modal */}
      {isModalOpen && selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={handleCloseModal}
          onDelete={handleDeleteRecipe}
        />
      )}
    </div>
  )
}

export default App
