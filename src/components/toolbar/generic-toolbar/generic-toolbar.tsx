import * as React from "react";
import { connect } from "react-redux";
import {
   setToolModeAction,
} from "../../../actions";
import {
    StoreState,
    ToolBarState,
} from "../../../declarations";
import {
    ToolBar,
    ToolBarOrientation,
} from "../../../widgets";

const GenericToolBarComponent = (props: {
    toolbar: ToolBarState,
    onItemClicked?: any,
    doHandleCommonAction: any,
    data: any,
    state: StoreState,
    orientation: ToolBarOrientation,
  }) => {
    return (
        <ToolBar
            orientation={props.orientation}
            data={prepareData(props.data, props.state)}
            selected={props.toolbar}
            onItemClicked={(item) => {
                if (item.isDisabled) {
                    return;
                }
                props.doHandleCommonAction(item);
                if (props.onItemClicked) {
                    props.onItemClicked(item);
                }
            }}
      ></ToolBar>);
};

function prepareData(data: any[], state: StoreState) {
    return data.map((item) => {
        if (typeof item.isDisabled === "function") {
            return {
                ...item,
                isDisabled: item.isDisabled(state),
            };
        }
        return item;
    });
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        doHandleCommonAction: (item: any) => {
            if (item.mode && item.type) {
                dispatch(setToolModeAction({
                    mode: item.mode, type: item.type,
                }));
            }
        },
    };
};

function mapStateToProps(state: StoreState) {
    return {
        toolbar: state.toolbar,
        state,
    };
}

export const GenericToolBar = connect(mapStateToProps, mapDispatchToProps)(GenericToolBarComponent);
