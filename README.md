# Lippie & Mathi's Raving Recipes

A recipe management web app with AI-powered recipe extraction. Paste any recipe URL and let AI automatically extract ingredients, instructions, and nutrition info.

## Features

- **AI Recipe Extraction** - Paste a URL from any recipe website and automatically extract:
  - Recipe title and description
  - Ingredients list
  - Step-by-step instructions
  - Nutrition information (calories, protein, carbs, fat, etc.)
  - Prep time, cook time, and servings

- **Supported Platforms** - Extract recipes from:
  - Instagram
  - TikTok
  - YouTube
  - Pinterest
  - Recipe websites
  - Food blogs and articles

- **Beautiful UI** - Rustic cookbook-inspired design with:
  - Recipe grid with image cards
  - Detailed recipe modal view
  - Nutrition macro display

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Netlify Functions (Serverless)
- **AI**: OpenAI GPT-4o-mini (primary) / Claude (fallback)
- **Fonts**: Poppins, Playfair Display, Inter

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key (required)
- Anthropic API key (optional, for fallback)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/recipes.git
   cd recipes
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

4. Start the development server:
   ```bash
   npx netlify dev
   ```

5. Open http://localhost:5173 in your browser

## Project Structure

```
recipes/
├── src/
│   ├── components/
│   │   ├── AddRecipe.jsx      # Recipe URL input and extraction
│   │   ├── RecipeGrid.jsx     # Recipe card grid display
│   │   └── RecipeModal.jsx    # Detailed recipe view
│   ├── App.jsx                # Main app component
│   ├── index.css              # Global styles + Tailwind
│   └── main.jsx               # App entry point
├── netlify/
│   └── functions/
│       └── extract-recipe.js  # Serverless AI extraction
├── public/                    # Static assets
├── netlify.toml               # Netlify configuration
└── package.json
```

## Deployment

Deploy to Netlify:

1. Push your code to GitHub
2. Connect your repo to Netlify
3. Add environment variables in Netlify dashboard:
   - `OPENAI_API_KEY`
   - `ANTHROPIC_API_KEY` (optional)
4. Deploy!

## License

MIT
