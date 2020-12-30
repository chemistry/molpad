# Molpad
[![GitHub Build Status](https://github.com/chemistry/molpad/workflows/CI/badge.svg)](https://github.com/chemistry/molpad/actions?query=workflow%3ACI)
[![License: MIT](https://img.shields.io/badge/License-MIT-gren.svg)](https://opensource.org/licenses/MIT)


Simple Molecule Editor
![MolPad](https://github.com/chemistry/molpad/blob/master/molpad.png?raw=true)


## How to use
```javascript
import { MolPad } from '../src/molpad';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

ReactDOM.render(
    (<MolPad />),
    document.getElementById('app') as HTMLElement
);
```

## Technical description (all libraries):
  * Typescript 3.7
  * Auto tests with JEST
  * Height code coverage

## Commands:
  * Start demo project: `npm start`
  * Run linter verification: `npm run lint`
  * Run linter verification & fix: `npm run lintfix`
  * Build project: `npm run build`

## Release
```bash
git tag v2.3.0
git push --tags
```

## License
  This project is licensed under the MIT license, Copyright (c) 2020 Volodymyr Vreshch.
  For more information see [LICENSE.md](https://github.com/chemistry/crystalview/blob/master/LICENSE).
