import * as React from "react";
import {
    ToolMode,
} from "../../declarations";
import {
    ToolBarOrientation,
} from "../toolbar/toolbar";
import "./toolbar-item.less";

export interface ToolBarItemConfig {
    title: string;
    icon?: string;
    name?: string;
    mode?: ToolMode;
    type?: string;
    isDisabled?: boolean;
    iconClassName?: string;
    style?: object;
}

export interface ToolBarItemProps {
    title: string;
    icon?: string;
    name?: string;
    orientation: ToolBarOrientation;
    isSelected: boolean;
    onItemClicked: () => void;
    isDisabled?: boolean;
    iconClassName?: string;
    style?: object;
}

function getClassNameByOrientation(
    orientation: ToolBarOrientation | undefined,
    isSelected: boolean,
    isDisabled?: boolean,
    iconClassName?: string,
) {
  const classNames =  ["c-toolbar-item"];
  if (iconClassName) {
    classNames.push(iconClassName);
  }

  switch (orientation) {
        case ToolBarOrientation.top:
            classNames.push("c-toolbar-item--top");
            break;
        case ToolBarOrientation.left:
            classNames.push("c-toolbar-item--left");
            break;
        case ToolBarOrientation.right:
            classNames.push("c-toolbar-item--right");
            break;
        default:
            break;
    }
  if (isSelected) {
        classNames.push("c-toolbar-item--selected");
    }
  if (isDisabled) {
        classNames.push("c-toolbar-item--disabled");
    }

  return classNames.join(" ");
}

export const ToolBarItem = (props: ToolBarItemProps) => {
    const {orientation, isSelected, isDisabled, iconClassName } = props;
    const toolbarClassName = getClassNameByOrientation(orientation, isSelected, isDisabled, iconClassName);
    const style = null;
    return (
        <div
          className={toolbarClassName}
          title={props.title || ""}
          onClick={props.onItemClicked}
          style={props.style}
        >{props.name || ""}
        {
          props.icon ? (<i className={"fa " + props.icon } aria-hidden="true"></i>) : ""
        }
        </div>
    );
};
