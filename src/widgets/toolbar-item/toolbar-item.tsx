import * as React from 'react';
import type { StoreState } from '../../declarations/index.js';
import { ToolMode } from '../../declarations/index.js';
import { ToolBarOrientation } from '../toolbar/toolbar.js';
import './toolbar-item.css';

export interface ToolBarItemConfig {
  id?: string;
  title: string;
  icon?: string;
  name?: string;
  mode?: ToolMode;
  type?: string;
  isDisabled?: boolean | ((state: StoreState) => boolean);
  iconClassName?: string;
  style?: Record<string, unknown>;
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
  style?: Record<string, unknown>;
}

function getClassNameByOrientation(
  orientation: ToolBarOrientation | undefined,
  isSelected: boolean,
  isDisabled?: boolean,
  iconClassName?: string
) {
  const classNames = ['c-toolbar-item'];
  if (iconClassName) {
    classNames.push(iconClassName);
  }

  switch (orientation) {
    case ToolBarOrientation.top:
      classNames.push('c-toolbar-item--top');
      break;
    case ToolBarOrientation.left:
      classNames.push('c-toolbar-item--left');
      break;
    case ToolBarOrientation.right:
      classNames.push('c-toolbar-item--right');
      break;
    default:
      break;
  }
  if (isSelected) {
    classNames.push('c-toolbar-item--selected');
  }
  if (isDisabled) {
    classNames.push('c-toolbar-item--disabled');
  }

  return classNames.join(' ');
}

export const ToolBarItem = (props: ToolBarItemProps) => {
  const { orientation, isSelected, isDisabled, iconClassName } = props;
  const toolbarClassName = getClassNameByOrientation(
    orientation,
    isSelected,
    isDisabled,
    iconClassName
  );
  return (
    <div
      className={toolbarClassName}
      title={props.title ?? ''}
      onClick={props.onItemClicked}
      style={props.style as React.CSSProperties | undefined}
    >
      {props.name ?? ''}
      {props.icon ? <i className={'fa ' + props.icon} aria-hidden="true"></i> : ''}
    </div>
  );
};
