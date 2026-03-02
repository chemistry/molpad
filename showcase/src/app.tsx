import { useRef, useCallback } from 'react';
import { MolPad } from '@chemistry/molpad';
import type { MolPadHandle } from '@chemistry/molpad';
import { BENZENE, CAFFEINE } from './data/molecules.ts';

export const App = () => {
  const molpadRef = useRef<MolPadHandle>(null);

  const loadBenzene = useCallback(() => {
    molpadRef.current?.loadMolecule(BENZENE);
  }, []);

  const loadCaffeine = useCallback(() => {
    molpadRef.current?.loadMolecule(CAFFEINE);
  }, []);

  return (
    <div className="container">
      <h1>
        <code>@chemistry/molpad</code>
      </h1>
      <p className="subtitle">
        Molecule editor/sketcher — <a href="https://www.npmjs.com/package/@chemistry/molpad">npm</a>{' '}
        · <a href="https://github.com/chemistry/molpad">GitHub</a>
      </p>

      <p className="description">
        Use the toolbar to draw molecular structures, or load a sample molecule:
      </p>

      <div className="actions">
        <button onClick={loadBenzene}>Load Benzene</button>
        <button onClick={loadCaffeine}>Load Caffeine</button>
      </div>

      <div className="molpad-container">
        <MolPad ref={molpadRef} />
      </div>
    </div>
  );
};
