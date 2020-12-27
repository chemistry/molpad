import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import {
   clearAllAction,
   redoAction,
   undoAction,
   zoomInAction,
   zoomOutAction,
} from "../../../actions";
import {
    ToolMode,
} from "../../../declarations";
import {
    StoreState,
} from "../../../declarations";
import {
    CameraHelperService,
} from "../../../services";
import {
  ToolBarOrientation,
} from "../../../widgets";
import {
   GenericToolBar,
} from "../generic-toolbar";

export const TOOLBAR_TOP_CONFIG = [{
      id: "NEW",
      title: "New",
      icon: "fa-file-o",
      isDisabled: (state: StoreState) => {
          const atoms = state.data.molecule.atoms;
          const bonds = state.data.molecule.bonds;
          return Object.keys(atoms).length === 0 && Object.keys(bonds).length === 0;
      },
  }, {
      id: "UNDO",
      title: "Undo",
      icon: "fa-undo",
      isDisabled: (state: StoreState) => {
          return state.pastData.length === 0;
      },
  }, {
      id: "REDO",
      title: "Redo",
      icon: "fa-repeat",
      isDisabled: (state: StoreState) => {
          return state.futureData.length === 0;
      },
  }, {
      id: "ZOOM_OUT",
      title: "Zoom Out",
      icon: "fa-search-minus",
      isDisabled: (state: StoreState) => {
          return !CameraHelperService.canZoomOut(state.data.camera);
      },
  }, {
      id: "ZOOM_IN",
      title: "Zoom In",
      icon: "fa-search-plus",
      isDisabled: (state: StoreState) => {
          return !CameraHelperService.canZoomIn(state.data.camera);
      },
}, {
    id: "CLEAR",
    title: "Clear",
    icon: "fa-eraser",
    mode: ToolMode.clear,
    type: "#",
    isDisabled: (state: StoreState) => {
        const atoms = state.data.molecule.atoms;
        const bonds = state.data.molecule.bonds;
        return Object.keys(atoms).length === 0 && Object.keys(bonds).length === 0;
    },
}];

export const TopToolBarComponent = (props: {
    handleActions?: any,
}) => {
    return (<GenericToolBar
        data={TOOLBAR_TOP_CONFIG}
        orientation={ToolBarOrientation.top}
        onItemClicked={props.handleActions}
    />);
};

const mapDispatchToProps: any = (dispatch: Dispatch<any>) => {
    return {
        handleActions: (item: any) => {
            switch ( item.id) {
                case "NEW":
                      dispatch(clearAllAction());
                      break;
                case "UNDO":
                      dispatch(undoAction());
                      break;
                case "REDO":
                      dispatch(redoAction());
                      break;
                case "ZOOM_IN":
                      dispatch(zoomInAction());
                      break;
                case "ZOOM_OUT":
                    dispatch(zoomOutAction());
                    break;
                default:
                    break;
            }
        },
    };
};

function mapStateToProps() {
    return { };
}

export const TopToolBar = connect(mapStateToProps, mapDispatchToProps)(TopToolBarComponent);
