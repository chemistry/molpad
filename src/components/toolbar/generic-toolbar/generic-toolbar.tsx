import React from 'react';
import { setToolModeAction } from '../../../actions/index.js';
import type { StoreState } from '../../../declarations/index.js';
import { useMolpadStore } from '../../../store/index.js';
import { ToolBar, ToolBarOrientation } from '../../../widgets/index.js';
import type { ToolBarItemConfig } from '../../../widgets/toolbar-item/toolbar-item.js';

function prepareData(data: ToolBarItemConfig[], state: StoreState): ToolBarItemConfig[] {
  return data.map((item) => {
    if (typeof item.isDisabled === 'function') {
      return {
        ...item,
        isDisabled: item.isDisabled(state),
      };
    }
    return item;
  });
}

export const GenericToolBar = (props: {
  onItemClicked?: (item: ToolBarItemConfig) => void;
  data: ToolBarItemConfig[];
  orientation: ToolBarOrientation;
}) => {
  const toolbar = useMolpadStore((state) => state.toolbar);
  const storeState = useMolpadStore((state) => state);
  const dispatch = useMolpadStore((state) => state.dispatch);

  const doHandleCommonAction = (item: ToolBarItemConfig) => {
    if (item.mode && item.type) {
      dispatch(
        setToolModeAction({
          mode: item.mode,
          type: item.type,
        })
      );
    }
  };

  return (
    <ToolBar
      orientation={props.orientation}
      data={prepareData(props.data, storeState)}
      selected={toolbar}
      onItemClicked={(item) => {
        if (item.isDisabled) {
          return;
        }
        doHandleCommonAction(item);
        if (props.onItemClicked) {
          props.onItemClicked(item);
        }
      }}
    ></ToolBar>
  );
};
