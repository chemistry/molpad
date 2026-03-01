import { ChemElements } from '@chemistry/elements';
import React from 'react';
import { showPeriodicTableAction } from '../../../actions/index.js';
import { ToolMode } from '../../../declarations/index.js';
import { useMolpadStore } from '../../../store/index.js';
import { ToolBarOrientation } from '../../../widgets/index.js';
import type { ToolBarItemConfig } from '../../../widgets/toolbar-item/toolbar-item.js';
import { GenericToolBar } from '../generic-toolbar/index.js';

import './icons/icons.css';

const DEFAULT_ELEMENTS = ['C', 'N', 'O', 'S', 'P'];

function getToolBarConfig(additionalElements: string[]): ToolBarItemConfig[] {
  const elements = [...DEFAULT_ELEMENTS, ...additionalElements];

  const res: ToolBarItemConfig[] = elements.map((element) => {
    const el = ChemElements.getBySymbol(element);
    const color = el ? el.color2 : '#000';

    return {
      title: element,
      name: element,
      mode: ToolMode.atom,
      type: element,
      style: { color, opacity: 0.9 },
    };
  });
  res.push({
    id: 'TABLE',
    title: 'Table',
    iconClassName: 'c-toolbar-item--table',
  });
  return res;
}

export const RightToolBar = () => {
  const additionalElements = useMolpadStore((state) => state.settings.additionalElements);
  const dispatch = useMolpadStore((state) => state.dispatch);

  const handleActions = (item: ToolBarItemConfig) => {
    switch (item.id) {
      case 'TABLE':
        dispatch(showPeriodicTableAction());
        break;
      default:
        break;
    }
  };

  return (
    <div>
      <GenericToolBar
        data={getToolBarConfig(additionalElements ?? [])}
        orientation={ToolBarOrientation.right}
        onItemClicked={handleActions}
      />
    </div>
  );
};
