import * as React from "react";
import {
    ToolMode,
} from "../../../declarations";
import {
  ToolBarOrientation,
} from "../../../widgets";
import {
   GenericToolBar,
} from "../generic-toolbar";
import "./icons/icons.less";

export const TOOLBAR_LEFT_CONFIG  = [{
    title: "",
    name: "",
    mode: ToolMode.bond,
    type: "1",
    iconClassName: "c-toolbar-item--bond-single",
  }, {
    name: "",
    mode: ToolMode.bond,
    type: "2",
    iconClassName: "c-toolbar-item--bond-double",
  }, {
    name: "",
    mode: ToolMode.bond,
    type: "3",
    iconClassName: "c-toolbar-item--bond-triple",
}, {
    name: "",
    mode: ToolMode.fragment,
    type: "benzene",
    iconClassName: "c-toolbar-item--fragment-benzene",
}, {
    name: "",
    mode: ToolMode.fragment,
    type: "cyclohexane",
    iconClassName: "c-toolbar-item--fragment-cyclohexane",
},  {
    name: "",
    mode: ToolMode.fragment,
    type: "cyclopentane",
    iconClassName: "c-toolbar-item--fragment-cyclopentane",
}, {
    name: "",
    mode: ToolMode.fragment,
    type: "cyclobutane",
    iconClassName: "c-toolbar-item--fragment-cyclobutane",
}];

export const LeftToolBar = () => {
    return (<GenericToolBar
        data={TOOLBAR_LEFT_CONFIG}
        orientation={ToolBarOrientation.left}
    />);
};
