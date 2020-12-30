import * as React from "react";
export interface PopupProps {
    isOpen: boolean;
    title: string;
    onClose: () => void;
    width: number;
    children: JSX.Element;
}

import "./popup.less";

export const Popup = ({isOpen, title, onClose, width, children}: PopupProps) => {
    if (!isOpen) {
        return (<div />);
    }
    return (
        <div className="c-popup">
            <div className="modal fade show" role="dialog">
              <div className="modal-dialog" role="document" style ={{width, maxWidth: width}}>
                <div className="modal-content">
                  <div className="modal-header">
                      <h5 className="modal-title">{title}</h5>
                      <button
                          type="button"
                          className="close"
                          data-dismiss="modal"
                          aria-label="Close"
                          onClick={onClose}
                        >
                          <span aria-hidden="true">&times;</span>
                      </button>
                  </div>
                  <div className="modal-body">
                      {children}
                  </div>
                  <div className="modal-footer">
                      <button
                          type="button"
                          className="btn btn-secondary"
                          data-dismiss="modal"
                          onClick={onClose}
                      >Close</button>
                  </div>
                </div>
              </div>
            </div>
        </div>
    );
};
