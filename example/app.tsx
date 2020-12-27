import { MolPad } from '../src/molpad';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
// import 'font-awesome/css/font-awesome.css';
//import 'bootstrap/dist/css/bootstrap.css';

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
