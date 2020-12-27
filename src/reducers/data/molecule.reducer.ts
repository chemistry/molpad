import {
    CLEAR_ALL,
    JMol,
    JMolWrapModel,
    LOAD_MOLECULE,
    Reducer,
} from "../../declarations";
import {
    MoleculeHelperService,
} from "../../services";

export const moleculeReducer: Reducer<JMolWrapModel> = (
    state,
    action,
) => {

    switch (action.type) {
        case LOAD_MOLECULE:
            const jmol = MoleculeHelperService.normalizeJmol(action.payload.molecule);
            return MoleculeHelperService.wrapMolecule(jmol);

        case CLEAR_ALL:
          return {
              atoms: {},
              bonds: {},
              id: "",
              title: "",
          };
        default:
          return state;
    }
};
