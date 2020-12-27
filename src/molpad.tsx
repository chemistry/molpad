import {
    Molecule,
} from "@chemistry/molecule";
import * as React from "react";
import { Provider } from "react-redux";
import { createStore, Store } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";

// Create Store
import {
    loadMoleculeAction,
} from "./actions";
import {
    MolPadView,
} from "./components";
import {
   JMol,
   StoreState,
} from "./declarations";
import { rootReducer } from "./reducers";
import {
    MoleculeHelperService,
} from "./services";

// Init Main Components
export class MolPad extends React.Component {

    public store: Store<StoreState>;

    constructor(props: any) {
        super(props);
        if (process.env.NODE_ENV !== "production") {
            this.store = createStore<StoreState, any, any, any>(rootReducer, composeWithDevTools());
        } else {
            this.store = createStore<StoreState, any, any, any>(rootReducer);
        }
    }

    public loadMolecule(jmol: JMol) {
        this.store.dispatch(loadMoleculeAction(jmol));
    }

    public getJmol(): JMol {
        const state = this.store.getState();
        return MoleculeHelperService.unWrapMolecule(state.data.molecule) as JMol;
    }

    public isSutableForSearch(): string {
        const state = this.store.getState();
        try {
            const molecule = new Molecule();
            molecule.load(state.data.molecule, "jnmol");
            return molecule.isSutableForSearch();
        } catch (e) {
            return "Can not parse molecule";
        }
    }

    public render() {
        return (
           <Provider store={this.store}>
              <MolPadView />
          </Provider>
        );
    }
}
