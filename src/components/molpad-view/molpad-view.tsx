import * as React from "react";
import "./molpad-view.less";

import {
    LeftToolBar,
    MolPadContent,
    PeriodicTable,
    RightToolBar,
    TopToolBar,
} from "../index";

export const MolPadView = () => {
    return (
      <div className="molpad-view">
          <div className="molpad-view__top-toolbar">
              <TopToolBar />
          </div>
          <div className="molpad-view__left-toolbar">
              <LeftToolBar />
          </div>
          <div className="molpad-view__right-toolbar">
             <RightToolBar />
          </div>
          <div className="molpad-view__content">
              <MolPadContent />
          </div>
          <div className="molpad-view__popup">
              <PeriodicTable  />
          </div>

    </div>);
};
