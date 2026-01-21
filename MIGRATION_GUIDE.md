# Migration Guide: Sanity Studio v5 + React 19

## Overview

Ce plugin `sanity-plugin-tags-v4` a été mis à jour pour être entièrement compatible avec **Sanity Studio v5** et **React 19**.

## Changes Made

### 1. **Versions des Dépendances (package.json)**

#### TypeScript et Outils
- `@types/react`: `^18.0.28` → `^19.0`
- `typescript`: `^4.9.5` → `^5.2.0`

#### ESLint et Prettier
- `@typescript-eslint/eslint-plugin`: `^5.52.0` → `^6.0.0`
- `@typescript-eslint/parser`: `^5.52.0` → `^6.0.0`
- `eslint`: `^8.34.0` → `^8.50.0`
- `eslint-config-sanity`: `^6.0.0` → `^7.0.0`
- `prettier`: `^2.8.4` → `^3.0.0`

#### Runtime
- `react`: `^19.1` → `^19.0`
- `react-dom`: `^19.1` → `^19.0`
- `react-is`: `^19.1` → `^19.0`

### 2. **Hook Dependencies (React 19 Strict Mode)**

#### TagsInput.tsx
- ✅ **useEffect**: Ajout de toutes les dépendances manquantes
  - Avant: `[]`
  - Après: `[client, value, customLabel, customValue, isMulti, predefinedTags, includeFromReference, includeFromRelated, documentType]`

- ✅ **useCallback (handleCreate)**: Ajout des dépendances
  - Avant: `[onChange, selected]`
  - Après: `[client, customLabel, customValue, onCreate, selected, handleChange, setLoadOption]`

- ✅ **useCallback (handleChange)**: Ajout des dépendances
  - Avant: `[onChange]`
  - Après: `[onChange, customLabel, customValue, isMulti, isReference]`

### 3. **Documentation (README.md)**

- ✅ Titre mis à jour: "Sanity Studio v5" et "React 19"
- ✅ Instructions d'installation clarifiées
- ✅ Section "Requirements" ajoutée avec les versions minimales
- ✅ Section "React 19 Features" pour mettre en évidence les améliorations

### 4. **Peer Dependencies**

```json
{
  "react": "^19.0",
  "react-dom": "^19.0",
  "rxjs": "^7.8.0",
  "sanity": "^5.5.0",
  "styled-components": "^6.1.0"
}
```

## Benefits

### React 19
- ✅ **Meilleure optimisation des re-renders** grâce au enhanced hook dependency tracking
- ✅ **Hooks plus lisibles et sûrs** avec les dépendances déclarées explicitement
- ✅ **Meilleure performance** avec les optimisations du compilateur React
- ✅ **Erreurs détectées plus rapidement** en développement

### Sanity Studio v5
- ✅ Intégration complète avec les dernières API
- ✅ Meilleure UX et performances dans Studio
- ✅ Support des nouvelles fonctionnalités de Studio v5
- ✅ Meilleure gestion des plugins

## Compatibility

- ✅ **Sanity Studio**: >= v5.5.0
- ✅ **React**: >= v19.0
- ✅ **React DOM**: >= v19.0
- ✅ **TypeScript**: >= v5.2
- ✅ **Node.js**: >= v14 (recommandé: v18+)

## Breaking Changes

**Aucun changement cassant** pour les utilisateurs du plugin !

La version de l'API du plugin reste la même. Les changements internes sont transparents pour les utilisateurs.

## Installation

```bash
npm install sanity-plugin-tags-v4
```

Puis dans `sanity.config.ts`:

```typescript
import {defineConfig} from 'sanity'
import {tags} from 'sanity-plugin-tags-v4'

export default defineConfig({
  //...
  plugins: [tags({})],
})
```

## Build & Testing

```bash
# Installation des dépendances
npm install

# Build du plugin
npm run build

# Watch mode
npm run watch

# Linting
npm run lint

# Formatage
npm run format
```

## Notes

- Les observables RxJS continuent à fonctionner de la même manière
- La compatibilité avec `react-select` v5.10.2+ est maintenue
- Les CSS modules restent inchangés
- Les types TypeScript sont correctement mis à jour

## Support & Issues

Pour toute question ou problème, veuillez ouvrir une issue sur:
https://github.com/exaland/sanity-plugin-tags-v4/issues
