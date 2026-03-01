import { ChemElements } from '@chemistry/elements';
import type { ChemElementInfo } from '@chemistry/elements';
import React from 'react';
import { hidePeriodicTableAction } from '../../actions/index.js';
import { useMolpadStore } from '../../store/index.js';
import { Popup } from '../../widgets/index.js';
import './periodic-table.css';

interface IPeriodicTable {
  [row: number]: {
    [column: number]: ChemElementInfo;
  };
}

const ELEMENTS = ChemElements.getAll();
const PERIODIC_TABLE = ELEMENTS.reduce<IPeriodicTable>((acc, element) => {
  const row = element.posX;
  const col = element.posY;
  acc[row] = acc[row] || {};
  acc[row][col] = element;
  return acc;
}, {});

const rowsRange = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const colsRange = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

const getPeriodicRepresentation = ({
  onElementSelect,
}: {
  onElementSelect: (element: string) => void;
}): JSX.Element => {
  return (
    <table className="c-periodic-table">
      <tbody>
        {rowsRange.map((rowId) => {
          if (!PERIODIC_TABLE[rowId]) {
            return <tr key={rowId}></tr>;
          }

          return (
            <tr key={rowId}>
              {colsRange.map((colId) => {
                const element = PERIODIC_TABLE[rowId][colId];
                if (!element) {
                  return <td key={colId}>&nbsp;</td>;
                }

                return (
                  <td
                    key={colId}
                    title={element.name}
                    style={{ color: element.color2 }}
                    className="c-periodic-table__element"
                    role="button"
                    onClick={() => {
                      onElementSelect(element.symbol);
                    }}
                  >
                    {element.symbol}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export const PeriodicTableComponent = ({
  isOpen,
  onClose,
  onElementSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onElementSelect: (element: string) => void;
}): JSX.Element => {
  return (
    <Popup isOpen={isOpen} title={'Periodic Table'} onClose={onClose} width={754}>
      {getPeriodicRepresentation({ onElementSelect })}
    </Popup>
  );
};

export const PeriodicTable = () => {
  const isOpen = useMolpadStore((state) => state.isTableShown);
  const dispatch = useMolpadStore((state) => state.dispatch);

  const onClose = () => {
    dispatch(hidePeriodicTableAction(''));
  };

  const onElementSelect = (element: string) => {
    dispatch(hidePeriodicTableAction(element));
  };

  return (
    <PeriodicTableComponent isOpen={isOpen} onClose={onClose} onElementSelect={onElementSelect} />
  );
};
