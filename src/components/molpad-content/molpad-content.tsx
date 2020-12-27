import {
    Element,
} from "@chemistry/elements";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import {
    mouseDownAction,
    mouseLeaveAction,
    mouseMoveAction,
    mouseUpAction,
} from "../../actions";
import {
    CameraState,
    CursorState,
    JMol,
    JMolAtomWrap,
    JMolBondsClassification,
    JMolBondWrap,
    JMolWrapModel,
    StoreState,
} from "../../declarations";
import "./molpad-content.less";

import {
    Molecule,
} from "@chemistry/molecule";
import {
    CameraHelperService,
    LineCoords,
    MolSvgHelper,
} from "../../services";

interface MolPadContentProps {
    molecule: JMolWrapModel;
    bondsClasification: JMolBondsClassification;
    camera: CameraState;
    cursor: CursorState;
    handleMouseDown: any;
    handleMouseMove: any;
    handleMouseUp: any;
    handleMouseLeave: any;
}

interface MolPadContentState {
    atomIdHovered: string;
    bondIdHovered: string;
}

const X_50_PERSENT = 267;
const Y_50_PERSENT = 253;

class MolPadContentComponent extends React.Component<MolPadContentProps, MolPadContentState> {
    private svgcontainer: any;

    constructor(props: MolPadContentProps) {
        super(props);
        this.getAtomsView = this.getAtomsView.bind(this);
        this.getBondsView = this.getBondsView.bind(this);
        this.proxyMouseDown = this.proxyMouseDown.bind(this);
        this.proxyMouseUp = this.proxyMouseUp.bind(this);
        this.proxyMouseLeave = this.proxyMouseLeave.bind(this);
        this.proxyMouseMove = this.proxyMouseMove.bind(this);
        this.render = this.render.bind(this);
        this.state = {
            atomIdHovered: "",
            bondIdHovered: "",
        };
        this.svgcontainer = null;
    }

    public getAtomsOverlapView() {
        const cameraState = this.props.camera;
        const atomsCollection = this.props.molecule.atoms;
        const atoms = Object.keys(atomsCollection).map((atomId) => atomsCollection[atomId]);

        const atomsposition = atoms.map((atom: JMolAtomWrap) => {
            return CameraHelperService.project(cameraState, { x: atom.x, y: atom.y });
        });
        const overlaps: Array<{x: number , y: number}> = [];
        // debugger;
        const DUBLICATE_R = 10;
        atomsposition.forEach((pos1, i) => {
            atomsposition.forEach((pos2, j) => {
                if (
                    j <= i ||
                    Math.abs(pos1.x - pos2.x) > DUBLICATE_R ||
                    Math.abs(pos1.y - pos2.y) > DUBLICATE_R
                ) {
                    return;
                }
                const dx = Math.abs(pos1.x - pos2.x);
                const dy = Math.abs(pos1.y - pos2.y);
                const l = Math.sqrt(dx * dx + dy * dy);
                if (l > DUBLICATE_R) {
                    return;
                }
                overlaps.push({
                    x: (pos1.x + pos2.x) / 2,
                    y: (pos1.y + pos2.y) / 2,
                });
            });
        });

        if (overlaps.length === 0) {
            return "";
        }
        return overlaps.map(({x, y}, index) => {
            return (<g className="molsvg-overlap" key={index}>
                <circle cx={x} cy={y} r="5" className="molsvg-overlap" />
            </g>);
        });
    }

    public getAtomsView() {
        const cameraState = this.props.camera;
        const atomsCollection = this.props.molecule.atoms;
        const atoms = Object.keys(atomsCollection).map((atomId) => atomsCollection[atomId]);
        const bondsCollection = this.props.molecule.bonds;

        const view = atoms.map((atom: JMolAtomWrap) => {
            const { x, y } = CameraHelperService.project(cameraState, { x: atom.x, y: atom.y });

            if (!MolSvgHelper.isAtomShown(atom)) {
                return null;
            }
            const label = MolSvgHelper.isLabelShown(atom, bondsCollection) ? atom.type : "";
            const elementData = Element.getElementByName(atom.type);
            const color = elementData ? elementData.color2 : "#000";

            return (
                <g
                    key={atom.id}
                    className="molsvg-atom"
                    onMouseOver={() => this.onAtomOverHandler(atom.id)}
                    onMouseOut={() => this.onAtomOverHandler("")}
                >
                <circle cx={x} cy={y} r="10" className="molsvg-atom__wrap" />
                    {!label ? null : (
                        <text
                          x={x}
                          y={y}
                          fill="black"
                          textAnchor="middle"
                          alignmentBaseline="middle"
                          style={{fill: color }}
                        >{label}</text>
                    )}
                </g>
            );
        });
        const hover = atoms.map((atom: JMolAtomWrap) => {
            const { x, y } = CameraHelperService.project(cameraState, {x: atom.x, y: atom.y});

            if (!MolSvgHelper.isAtomShown(atom)) {
                return null;
            }
            let className = "molsvg-atom-hover";
            if (atom.id === this.state.atomIdHovered) {
                className += " molsvg-atom-hover--hover";
            }
            return (
              <g key={atom.id} className={className}>
                  <circle
                    cx={x}
                    cy={y}
                    r="10"
                    fill="#99ff99"
                    className="molsvg-atom-hover__wrap"
                  />
              </g>
            );
        });

        return {
            view,
            hover,
        };
    }

    public onAtomOverHandler(atomId: string) {
        this.setState({
            atomIdHovered: atomId,
        });
    }

    public onBondOverHandler(bondId: string) {
        this.setState({
            bondIdHovered: bondId,
        });
    }

    public getBondsView() {
        const cameraState = this.props.camera;
        const bondsCollection = this.props.molecule.bonds;
        const atoms = this.props.molecule.atoms;
        const bonds = Object.keys(bondsCollection).map((bondId) => bondsCollection[bondId]);
        const bondsClasification = this.props.bondsClasification;

        const linesListCoords = bonds.map((bond: JMolBondWrap) => {
            const atom1 = atoms[bond.atom1];
            const atom2 = atoms[bond.atom2];
            const camera = cameraState;
            const viewDirection = bondsClasification[bond.id] || 0;
            const linesCoords = MolSvgHelper.getBondLines({
                atom1,
                atom2,
                bond,
                bonds: bondsCollection,
                viewDirection,
                camera,
            });
            return {
                linesCoords,
                bondId: bond.id,
            };
        });

        const view = linesListCoords.map(({linesCoords, bondId}: { linesCoords: LineCoords[], bondId: string}) => {
            return (
                <g
                    className="molsvg-bond"
                    key={bondId}
                    onMouseOver={() => this.onBondOverHandler(bondId)}
                    onMouseOut={() => this.onBondOverHandler("")}
                >
                      <line
                          {...linesCoords[0]}
                          stroke="#99ff99"
                          strokeWidth="15"
                          strokeLinecap="round"
                          className="molsvg-bond__wrap"
                      />
                      {linesCoords.slice(1).map((lineCoord, index)  => {
                          return (
                            <line
                                  key={index}
                                  {...lineCoord}
                                  stroke="black"
                                  strokeWidth="1"
                            />
                          );
                      })}
                </g>
            );
        });

        const hover = linesListCoords.map(({linesCoords, bondId}: { linesCoords: LineCoords[], bondId: string}) => {
            let className = "molsvg-bond-hover";
            if (bondId === this.state.bondIdHovered) {
                className += " molsvg-bond-hover--hover";
            }

            return (
                <g
                    className={className}
                    key={bondId}
                >
                      <line
                          {...linesCoords[0]}
                          stroke="#99ff99"
                          strokeWidth="15"
                          strokeLinecap="round"
                          className="molsvg-bond-hover__wrap"
                      />
                </g>
            );
        });

        return {
            view,
            hover,
        };
    }

    public proxyMouseDown(event: any) {
        if (!this.svgcontainer) {
            return;
        }
        const bounds = this.svgcontainer.getBoundingClientRect();
        const x = event.nativeEvent.clientX - bounds.left - X_50_PERSENT;
        const y = event.nativeEvent.clientY - bounds.top - Y_50_PERSENT;
        this.props.handleMouseDown(x, y);
    }

    public proxyMouseMove(event: any) {
        if (
          !this.svgcontainer ||
          !this.props.cursor.mouseClick ||
          !this.props.cursor.data
        ) {
            return;
        }
        const bounds = this.svgcontainer.getBoundingClientRect();
        const x = event.nativeEvent.clientX - bounds.left - X_50_PERSENT;
        const y = event.nativeEvent.clientY - bounds.top - Y_50_PERSENT;

        this.props.handleMouseMove(x, y);
    }

    public proxyMouseUp(event: any) {
        if (!this.svgcontainer) {
            return;
        }
        const bounds = this.svgcontainer.getBoundingClientRect();
        const x = event.nativeEvent.clientX - bounds.left - X_50_PERSENT;
        const y = event.nativeEvent.clientY - bounds.top - Y_50_PERSENT;
        this.props.handleMouseUp(x, y);
    }

    public proxyMouseLeave() {
        if (!this.props.cursor.mouseClick) {
            return;
        }
        this.props.handleMouseLeave();
    }

    public render() {
      const atomsView = this.getAtomsView();
      const bondsView = this.getBondsView();
      const overlapView = this.getAtomsOverlapView();
      const transform = "translate(" + X_50_PERSENT + "," + Y_50_PERSENT + ")";
      return (
          <div className="molpad-content">
              <svg width="100%" height="100%"
                className="molsvg"
                onMouseDown={this.proxyMouseDown}
                onMouseUp={this.proxyMouseUp}
                onMouseLeave={this.proxyMouseLeave}
                onMouseMove={this.proxyMouseMove}
                ref={(svgcontainer) => { this.svgcontainer = svgcontainer; }}
              >
                  <g transform={transform}>
                      {bondsView.hover}
                      {atomsView.hover}
                      {bondsView.view}
                      {atomsView.view}
                      {overlapView}
                  </g>
              </svg>
          </div>
      );
    }
}

function mapStateToProps(state: StoreState) {
    return {
        molecule: state.data.molecule,
        bondsClasification: state.cache.bondsClasification,
        camera: state.data.camera,
        cursor: state.cursor,
    };
}

function mapDispatchToProps(dispatch: any /* Dispatch<StoreState> */) {
    return {
        handleMouseDown: (x: number, y: number) => {
            dispatch(mouseDownAction(x, y));
        },
        handleMouseMove: (x: number, y: number) => {
            dispatch(mouseMoveAction(x, y));
        },
        handleMouseUp: (x: number, y: number) => {
            dispatch(mouseUpAction(x, y));
        },
        handleMouseLeave: (x: number, y: number) => {
            dispatch(mouseLeaveAction());
        },
    };
}

export const MolPadContent: React.ComponentClass<{}, {}> = connect(mapStateToProps, mapDispatchToProps as any)(MolPadContentComponent);
