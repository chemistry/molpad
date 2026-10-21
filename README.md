# MolPad

[![GitHub Build Status](https://github.com/chemistry/molpad/workflows/CI/badge.svg)](https://github.com/chemistry/molpad/actions?query=workflow%3ACI)
[![npm version](https://img.shields.io/npm/v/@chemistry/molpad)](https://www.npmjs.com/package/@chemistry/molpad)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

React component for drawing and editing molecular structures.

![MolPad](https://github.com/chemistry/molpad/blob/master/molpad.png?raw=true)

## Installation

```bash
npm install @chemistry/molpad
```

## Usage

```tsx
import { useRef } from 'react';
import { MolPad, MolPadHandle } from '@chemistry/molpad';

function App() {
  const molpadRef = useRef<MolPadHandle>(null);

  const loadMolecule = () => {
    molpadRef.current?.loadMolecule(moleculeData);
  };

  const exportMolecule = () => {
    const jmol = molpadRef.current?.getJmol();
    console.log(jmol);
  };

  return <MolPad ref={molpadRef} />;
}
```

## Tech Stack

- React 18/19, TypeScript 5.9, ES2024 target, ESM
- Zustand 5 for state management (with devtools)
- Vitest for testing, 98%+ coverage (270 tests)
- ESLint 10 (flat config) + Prettier
- Native `tsc` build (no bundler)
- Node.js 22+

## Commands

| Command                | Description                                                   |
| ---------------------- | ------------------------------------------------------------- |
| `npm run build`        | Build the library                                             |
| `npm run test`         | Run unit tests                                                |
| `npm run lint`         | Run ESLint                                                    |
| `npm run format:check` | Check Prettier formatting                                     |
| `npm run type-check`   | Run TypeScript type checking                                  |
| `npm run verify`       | Full verification (type-check + lint + format + test + build) |

## Showcase App

A Vite-based demo is available in `showcase/`:

```bash
cd showcase
npm install
npm run dev
```

## Release

```bash
gh workflow run prepare-release.yml -R chemistry/molpad
```

This opens a `chore(release)` PR with auto-merge armed. When PR Validation is green it merges, and `release.yml` publishes to npm (OIDC trusted publishing), tags `v<version>` and creates a GitHub Release.

## License

This project is licensed under the MIT license, Copyright (c) 2026 Volodymyr Vreshch.
For more information see [LICENSE](https://github.com/chemistry/molpad/blob/master/LICENSE).
