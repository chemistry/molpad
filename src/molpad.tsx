import React, { forwardRef, useImperativeHandle } from 'react';
import { useMolpadStore } from './store/index.js';
import { MolPadView } from './components/index.js';
import { loadMoleculeAction } from './actions/index.js';
import { JMol } from './declarations/index.js';
import { MoleculeHelperService } from './services/index.js';

export interface MolPadHandle {
  loadMolecule: (jmol: JMol) => void;
  getJmol: () => JMol;
}

export const MolPad = forwardRef<MolPadHandle>((_props, ref) => {
  const dispatch = useMolpadStore((state) => state.dispatch);
  const molecule = useMolpadStore((state) => state.data.molecule);

  useImperativeHandle(ref, () => ({
    loadMolecule: (jmol: JMol) => {
      dispatch(loadMoleculeAction(jmol));
    },
    getJmol: () => {
      return MoleculeHelperService.unWrapMolecule(molecule)!;
    },
  }));

  return <MolPadView />;
});
