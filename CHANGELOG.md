# Changelog

## [1.0.22] - 2026-08-20
 - **React 19.2 Support**: Updated plugin to be fully compatible with React 19.2
 - **Sanity Studio v6.10 Support**: Ensured compatibility with Sanity Studio v6.10
 

## [1.0.5] - 2026-01-21

### 🚀 New Features
- **Full Sanity Studio v5 Support**: Plugin now optimized for Sanity Studio v5.5.0+
- **React 19 Compatibility**: Complete support for React 19 with modern hook patterns
- **Enhanced Type Safety**: Updated TypeScript definitions for React 19

### 🔧 Dependencies Updated
- **React**: Updated to v19.0
- **React DOM**: Updated to v19.0
- **TypeScript**: Updated from v4.9.5 to v5.2.0
- **ESLint**: Updated from v8.34.0 to v8.50.0
- **Prettier**: Updated from v2.8.4 to v3.0.0
- **ESLint Config**: Updated Sanity ESLint config from v6 to v7

### 🐛 Bug Fixes
- **Hook Dependencies**: Fixed missing dependency arrays in React hooks
  - `useEffect` now includes all required dependencies
  - `useCallback` functions properly track all dependencies
  - Eliminates React 19 strict mode warnings

### 📚 Documentation
- Updated README with Sanity Studio v5 & React 19 information
- Added requirements section with version specifications
- Added migration guide (MIGRATION_GUIDE.md)

### ✨ Improvements
- Better ESLint support with updated plugins and rules
- Improved formatting with Prettier v3
- Enhanced code quality and maintainability
- Better error handling and validation

### 🔗 Compatibility Matrix

| Dependency | Previous | Current | Note |
|-----------|----------|---------|------|
| Sanity | v5.5.0 | v5.5.0+ | Fully compatible |
| React | v19.1 | v19.0+ | Latest React 19 |
| React DOM | v19.1 | v19.0+ | Matching React version |
| TypeScript | v4.9.5 | v5.2.0+ | Modern TS features |
| Node.js | >=14 | >=14 | No breaking changes |

### 📦 Installation

```bash
npm install sanity-plugin-tags-v4@1.0.5
```

### 🙏 Credits
- Original plugin: P Christopher Bowers, Leo Baker-Hytch
- React 19 & Sanity v5 migration: Alexandre Magnier

---

## [1.0.4] - 2023-XX-XX

Previous release notes...
