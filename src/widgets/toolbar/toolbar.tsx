import * as React from 'react';
import { ToolMode } from '../../declarations/index.js';
import { ToolBarItem, ToolBarItemConfig } from '../index.js';
import './toolbar.css';

export interface ToolBarProps {
  orientation: ToolBarOrientation;
  data: ToolBarItemConfig[];
  selected: {
    mode: ToolMode;
    type: string;
  };
  onItemClicked: (item: ToolBarItemConfig) => void;
}

export enum ToolBarOrientation {
  top = 'top',
  left = 'left',
  right = 'right',
}

export const ToolBar = (props: ToolBarProps) => {
  return (
    <div className="c-toolbar">
      {props.data.map((itemProps: ToolBarItemConfig, index: number) => {
        let isSelected = false;
        if (props.selected.mode && props.selected.type) {
          isSelected =
            itemProps.mode === props.selected.mode && itemProps.type === props.selected.type;
        }

        const isDisabled =
          typeof itemProps.isDisabled === 'function' ? false : itemProps.isDisabled;

        return (
          <ToolBarItem
            key={index}
            {...itemProps}
            isDisabled={isDisabled}
            onItemClicked={props.onItemClicked.bind(null, itemProps)}
            isSelected={isSelected}
            orientation={props.orientation}
          />
        );
      })}
    </div>
  );
};
