# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**@chemistry/molpad** — Interactive molecule editor/sketcher React component. Provides a 2D molecular drawing canvas with atom and bond editing tools.

**Repository:** `chemistry/molpad`
**Default Branch:** `master`
**Package:** Single npm library (React component)

## Development Commands

```bash
npm install              # Install dependencies
npm run build            # Build library (Vite + tsc declarations)
npm test                 # Run Vitest unit tests
npm run type-check       # TypeScript checking
npm run lint             # ESLint
npm run format:check     # Prettier check
npm run verify           # Full pipeline: type-check + lint + build + test
```

## Architecture

```
src/
├── actions/             # User action handlers (draw, select, erase)
├── components/          # React UI components (toolbar, canvas, panels)
├── declarations/        # TypeScript type declarations
├── reducers/            # State reducers for actions
├── services/            # Business logic (geometry, rendering, chemistry)
├── store/               # Zustand state management
├── widgets/             # Composite UI widgets
├── molpad.tsx           # Main MolPad component
└── index.ts             # Public API exports
```

### Key Patterns

- **Zustand** for state management with action-based reducers
- **Canvas 2D** rendering for molecular structures
- **Action system** — each tool (draw, select, erase) is a separate action handler
- ES2024 target, ESNext modules, Vite library build

### Key Dependencies

- React 18/19, Zustand — UI and state
- `@chemistry/elements` — Periodic table data
- `@chemistry/molecule` — Molecular graph model

## Testing

- **Framework:** Vitest with `@testing-library/react`
- **Coverage:** High coverage (270+ tests)
- **Pattern:** `*.test.ts` / `*.test.tsx` colocated with source

## Publishing

Published to npm as `@chemistry/molpad`. **Never run `npm publish` manually** — tag `v*` and push to trigger the release pipeline.

## Standards

See [root CLAUDE.md](../../CLAUDE.md) for tech standards and [showcase CLAUDE.md](../CLAUDE.md) for portfolio workflow rules.
