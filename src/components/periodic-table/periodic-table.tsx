import {
    Element,
} from "@chemistry/elements";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import {
    hidePeriodicTableAction,
} from "../../actions";
import {
    StoreState,
    ToolBarState,
} from "../../declarations";
import {
  Popup,
} from "../../widgets";
import "./periodic-table.less";

interface IPeriodicTable {
    [row: number]: {
        [column: number]: Element,
    };
}

const ELEMENTS = Element.getAllList();
const PERIODIC_TABLE = ELEMENTS.reduce((acc, element) => {
    const row = element.posX;
    const col = element.posY;
    acc[row] = acc[row] || {};
    acc[row][col] = element;
    return acc;
}, {} as IPeriodicTable);

const rowsRange = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const colsRange = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

const getPeriodicRepresentation = (
    { onElementSelect }: { onElementSelect: (element: string) => void },
): JSX.Element => {
    return (
        <table className="c-periodic-table">
            <tbody>
            {rowsRange.map((rowId) => {
                if (!PERIODIC_TABLE[rowId]) {
                  return (<tr key={rowId}></tr>);
                }

                return (

                    <tr key={rowId}>
                    {
                      colsRange.map((colId) => {
                          const element = PERIODIC_TABLE[rowId][colId];
                          if (!element) {
                              return (<td key={colId}>&nbsp;</td>);
                          }

                          return (
                            <td
                                key={colId}
                                title={element.name}
                                style={{ color: element.color2 }}
                                className="c-periodic-table__element"
                                role="button"
                                onClick={() => { onElementSelect(element.symbol); } }
                              >
                                {element.symbol}
                            </td>
                          );
                      })
                    }
                    </tr>
                );
            })}
        </tbody>
    </table>
    );
};

export const PeriodicTableComponent = ({ isOpen, onClose, onElementSelect }: {
    isOpen: boolean,
    onClose: () => void,
    onElementSelect: (element: string) => void,
}): JSX.Element  => {

    return (
        <Popup
            isOpen={isOpen}
            title={"Periodic Table"}
            onClose={onClose}
            width={754}
        >
          {getPeriodicRepresentation({ onElementSelect })}
        </Popup>
    );
};

const mapDispatchToProps: any = (dispatch: Dispatch<any>) => {
    return {
        onClose: () => {
            dispatch(hidePeriodicTableAction(""));
        },
        onElementSelect: (element: string) => {
            dispatch(hidePeriodicTableAction(element));
        },
    };
};

function mapStateToProps(state: StoreState) {
    return {
        isOpen: state.isTableShown,
    };
}

export const PeriodicTable: React.ComponentClass<{}, {}> = connect(mapStateToProps, mapDispatchToProps)(PeriodicTableComponent);
