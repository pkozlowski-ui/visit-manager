# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Visit Manager

A modern, beautiful visit management application built with React, TypeScript, and Vite.

**🚀 Live Demo**: https://visit-manager.vercel.app/

**📦 GitHub**: https://github.com/pkozlowski-ui/visit-manager

## Features

- 📅 **Calendar View** - Visual timeline of all visits
- 👥 **Client Management** - Track client information and history
- ✂️ **Service Management** - Define services with durations and pricing
- 👨‍💼 **Team Management** - Manage specialists and their availability
- 💾 **Data Backup** - Export/import all data as JSON
- 🌍 **Internationalization** - Support for multiple languages (EN, PL)
- 🎨 **Modern UI** - Beautiful, responsive design with dark mode support
- 📱 **Mobile-First** - Optimized for mobile devices

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS v4** - Styling
- **React Router** - Navigation
- **i18next** - Internationalization
- **date-fns** - Date utilities
- **Playwright** - E2E testing
- **LocalStorage** - Data persistence
- **Vercel** - Hosting (free tier)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

This app is deployed on Vercel's free tier. To deploy your own instance:

1. Fork this repository
2. Go to https://vercel.com/new
3. Import your forked repository
4. Click "Deploy"

See [deployment workflow](.agent/workflows/deploy.md) for detailed instructions.

## Data Management

All data is stored in browser's LocalStorage. To backup your data:

1. Go to **Settings → Preferences**
2. Scroll to **Data Backup** section
3. Click **Export Backup** to download JSON file
4. Use **Import Backup** to restore from file

**Important**: Clearing browser data will delete all visits/clients/services. Export backups regularly!

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
