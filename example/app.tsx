import { MolPad } from '../src/molpad';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {
  BENZENE,
  COFFEINE,
  CYCLOPENTANE,
  CYCLOBUTANE
} from './fragments/index';

const MolPadWrap = ()=> {
    return (
        <div>
            <MolPad />
        </div>
    )
}

ReactDOM.render(
    (<MolPadWrap />),
    document.getElementById('app') as HTMLElement
);
