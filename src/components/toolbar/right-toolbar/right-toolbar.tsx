import {
    Element,
} from "@chemistry/elements";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import {
   showPeriodicTableAction,
} from "../../../actions";
import {
    StoreState,
    ToolMode,
} from "../../../declarations";
import {
  ToolBarOrientation,
} from "../../../widgets";
import {
   GenericToolBar,
} from "../generic-toolbar";

const DEFAULT_ELEMENTS = ["C", "N", "O", "S", "P"];

function getToolBarConfig(additionalElements: string[]): any {
    const elements = [...DEFAULT_ELEMENTS, ...additionalElements];

    const res: any[] = elements.map((element) => {
        const el = Element.getElementByName(element);

        return {
            title: element,
            name: element,
            mode: ToolMode.atom,
            type: element,
            style: { color: el.color2, opacity: 0.9 },
        };
    });
    res.push({
        id: "TABLE",
        title: "Table",
        icon: "fa-table ",
    });
    return res;
}

const RightToolBarComponent = ({
    handleActions,
    additionalElements,
}: {
    handleActions?: (item: any) => void,
    additionalElements?: string[],
}) => {

    return (<GenericToolBar
        data={getToolBarConfig(additionalElements || [])}
        orientation={ToolBarOrientation.right}
        onItemClicked={handleActions}
    />);
};

const mapDispatchToProps: any = (dispatch: Dispatch<any>) => {
    return {
        handleActions: (item: any) => {
            switch (item.id) {
                case "TABLE":
                      dispatch(showPeriodicTableAction());
                      break;
                default:
                    break;
            }
        },
    };
};

function mapStateToProps(state: StoreState) {
    return {
        additionalElements: state.settings.additionalElements,
    };
}

export const RightToolBar = connect(mapStateToProps, mapDispatchToProps)(RightToolBarComponent);
