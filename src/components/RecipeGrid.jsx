import RecipeCard from './RecipeCard'

function RecipeGrid({ recipes, onRecipeClick }) {
  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#8B7355]">
        <svg className="w-24 h-24 mb-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h2 className="font-display text-2xl font-semibold mb-2 text-[#4A3728]">No recipes yet</h2>
        <p className="text-[#8B7355]">Add your first recipe to get started!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {recipes.map((recipe, index) => (
        <div
          key={recipe.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <RecipeCard recipe={recipe} onClick={() => onRecipeClick(recipe)} />
        </div>
      ))}
    </div>
  )
}

export default RecipeGrid
