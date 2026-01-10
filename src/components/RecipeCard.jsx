function RecipeCard({ recipe, onClick }) {
  const difficultyColors = {
    Easy: 'bg-[#7A8450]',
    Medium: 'bg-[#C9A962] text-[#4A3728]',
    Hard: 'bg-[#C4704A]'
  }

  return (
    <div
      onClick={onClick}
      className="recipe-card cursor-pointer rounded-2xl overflow-hidden"
    >
      {/* Image Container - Horizontal like Rustic */}
      <div className="relative h-[200px] overflow-hidden">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover transition-transform duration-300"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <div className="flex gap-1.5">
            {/* Time Badge */}
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold text-[#4A3728] bg-white/95 backdrop-blur-sm">
              {recipe.cookTime}
            </span>
            {/* Difficulty Badge */}
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold text-white backdrop-blur-sm ${difficultyColors[recipe.difficulty]}`}>
              {recipe.difficulty}
            </span>
          </div>
          {/* Favorite heart */}
          <span className="px-2.5 py-1.5 rounded-full text-xs bg-white/95 backdrop-blur-sm text-red-400">
            ♥
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display font-semibold text-[#4A3728] text-xl mb-2 line-clamp-1">
          {recipe.title}
        </h3>
        <p className="text-[#8B7355] text-sm line-clamp-2 leading-relaxed mb-4">
          {recipe.description}
        </p>

        {/* Macros Row - Rustic Style */}
        <div className="flex gap-4 p-3 bg-[#FFF8E7] rounded-xl mb-4">
          <div className="flex-1 text-center">
            <div className="text-[#4A3728] font-bold text-sm">{recipe.nutrition.calories}</div>
            <div className="text-[#8B7355] text-[11px] uppercase tracking-wide">Calories</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-[#4A3728] font-bold text-sm">{recipe.nutrition.protein}g</div>
            <div className="text-[#8B7355] text-[11px] uppercase tracking-wide">Protein</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-[#4A3728] font-bold text-sm">{recipe.nutrition.carbs}g</div>
            <div className="text-[#8B7355] text-[11px] uppercase tracking-wide">Carbs</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-[#4A3728] font-bold text-sm">{recipe.nutrition.fat}g</div>
            <div className="text-[#8B7355] text-[11px] uppercase tracking-wide">Fat</div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {recipe.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1.5 bg-[#FFF8E7] border border-[#E5D9C9] text-[#6D4C41] text-xs rounded-full font-medium"
            >
              {tag}
            </span>
          ))}
          {recipe.tags.length > 3 && (
            <span className="px-3 py-1.5 bg-[#C9A962] text-white text-xs rounded-full font-medium">
              +{recipe.tags.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default RecipeCard
