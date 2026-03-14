import { ChemElements } from '@chemistry/elements';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  mouseDownAction,
  mouseLeaveAction,
  mouseMoveAction,
  mouseUpAction,
} from '../../actions/index.js';
import { JMolAtomWrap, JMolBondWrap } from '../../declarations/index.js';
import { useMolpadStore } from '../../store/index.js';
import './molpad-content.css';

import { CameraHelperService, LineCoords, MolSvgHelper } from '../../services/index.js';

export const MolPadContent = () => {
  const svgcontainer = useRef<SVGSVGElement | null>(null);
  const [atomIdHovered, setAtomIdHovered] = useState('');
  const [center, setCenter] = useState({ x: 267, y: 253 });

  useEffect(() => {
    const updateCenter = () => {
      if (svgcontainer.current) {
        const bounds = svgcontainer.current.getBoundingClientRect();
        setCenter({ x: Math.round(bounds.width / 2), y: Math.round(bounds.height / 2) });
      }
    };
    updateCenter();
    window.addEventListener('resize', updateCenter);
    return () => {
      window.removeEventListener('resize', updateCenter);
    };
  }, []);
  const [bondIdHovered, setBondIdHovered] = useState('');

  const molecule = useMolpadStore((state) => state.data.molecule);
  const bondsClasification = useMolpadStore((state) => state.cache.bondsClasification);
  const camera = useMolpadStore((state) => state.data.camera);
  const cursor = useMolpadStore((state) => state.cursor);
  const dispatch = useMolpadStore((state) => state.dispatch);

  const getAtomsOverlapView = () => {
    const cameraState = camera;
    const atomsCollection = molecule.atoms;
    const atoms = Object.keys(atomsCollection).map((atomId) => atomsCollection[atomId]);

    const atomsposition = atoms.map((atom: JMolAtomWrap) => {
      return CameraHelperService.project(cameraState, { x: atom.x, y: atom.y });
    });
    const overlaps: { x: number; y: number }[] = [];
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
      return '';
    }
    return overlaps.map(({ x, y }, index) => {
      return (
        <g className="molsvg-overlap" key={index}>
          <circle cx={x} cy={y} r="5" className="molsvg-overlap" />
        </g>
      );
    });
  };

  const getAtomsView = () => {
    const cameraState = camera;
    const atomsCollection = molecule.atoms;
    const atoms = Object.keys(atomsCollection).map((atomId) => atomsCollection[atomId]);
    const bondsCollection = molecule.bonds;

    const view = atoms.map((atom: JMolAtomWrap) => {
      const { x, y } = CameraHelperService.project(cameraState, { x: atom.x, y: atom.y });

      if (!MolSvgHelper.isAtomShown(atom)) {
        return null;
      }
      const label = MolSvgHelper.isLabelShown(atom, bondsCollection) ? atom.type : '';
      const elementData = ChemElements.getBySymbol(atom.type);
      const color = elementData ? elementData.color2 : '#000';

      return (
        <g
          key={atom.id}
          className="molsvg-atom"
          onMouseOver={() => {
            setAtomIdHovered(atom.id);
          }}
          onMouseOut={() => {
            setAtomIdHovered('');
          }}
        >
          <circle cx={x} cy={y} r="10" className="molsvg-atom__wrap" />
          {!label ? null : (
            <text
              x={x}
              y={y}
              fill="black"
              textAnchor="middle"
              alignmentBaseline="middle"
              style={{ fill: color }}
            >
              {label}
            </text>
          )}
        </g>
      );
    });
    const hover = atoms.map((atom: JMolAtomWrap) => {
      const { x, y } = CameraHelperService.project(cameraState, { x: atom.x, y: atom.y });

      if (!MolSvgHelper.isAtomShown(atom)) {
        return null;
      }
      let className = 'molsvg-atom-hover';
      if (atom.id === atomIdHovered) {
        className += ' molsvg-atom-hover--hover';
      }
      return (
        <g key={atom.id} className={className}>
          <circle cx={x} cy={y} r="10" fill="#99ff99" className="molsvg-atom-hover__wrap" />
        </g>
      );
    });

    return {
      view,
      hover,
    };
  };

  const getBondsView = () => {
    const cameraState = camera;
    const bondsCollection = molecule.bonds;
    const atoms = molecule.atoms;
    const bonds = Object.keys(bondsCollection).map((bondId) => bondsCollection[bondId]);

    const linesListCoords = bonds.map((bond: JMolBondWrap) => {
      const atom1 = atoms[bond.atom1];
      const atom2 = atoms[bond.atom2];
      const viewDirection = bondsClasification[bond.id] || 0;
      const linesCoords = MolSvgHelper.getBondLines({
        atom1,
        atom2,
        bond,
        bonds: bondsCollection,
        viewDirection,
        camera: cameraState,
      });
      return {
        linesCoords,
        bondId: bond.id,
      };
    });

    const view = linesListCoords.map(
      ({ linesCoords, bondId }: { linesCoords: LineCoords[]; bondId: string }) => {
        return (
          <g
            className="molsvg-bond"
            key={bondId}
            onMouseOver={() => {
              setBondIdHovered(bondId);
            }}
            onMouseOut={() => {
              setBondIdHovered('');
            }}
          >
            <line
              {...linesCoords[0]}
              stroke="#99ff99"
              strokeWidth="15"
              strokeLinecap="round"
              className="molsvg-bond__wrap"
            />
            {linesCoords.slice(1).map((lineCoord, index) => {
              return <line key={index} {...lineCoord} stroke="black" strokeWidth="1" />;
            })}
          </g>
        );
      }
    );

    const hover = linesListCoords.map(
      ({ linesCoords, bondId }: { linesCoords: LineCoords[]; bondId: string }) => {
        let className = 'molsvg-bond-hover';
        if (bondId === bondIdHovered) {
          className += ' molsvg-bond-hover--hover';
        }

        return (
          <g className={className} key={bondId}>
            <line
              {...linesCoords[0]}
              stroke="#99ff99"
              strokeWidth="15"
              strokeLinecap="round"
              className="molsvg-bond-hover__wrap"
            />
          </g>
        );
      }
    );

    return {
      view,
      hover,
    };
  };

  const proxyMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (!svgcontainer.current) {
        return;
      }
      const bounds = svgcontainer.current.getBoundingClientRect();
      const x = event.nativeEvent.clientX - bounds.left - center.x;
      const y = event.nativeEvent.clientY - bounds.top - center.y;
      dispatch(mouseDownAction(x, y));
    },
    [dispatch]
  );

  const proxyMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!svgcontainer.current || !cursor.mouseClick || !cursor.data) {
        return;
      }
      const bounds = svgcontainer.current.getBoundingClientRect();
      const x = event.nativeEvent.clientX - bounds.left - center.x;
      const y = event.nativeEvent.clientY - bounds.top - center.y;

      dispatch(mouseMoveAction(x, y));
    },
    [dispatch, cursor.mouseClick, cursor.data]
  );

  const proxyMouseUp = useCallback(
    (event: React.MouseEvent) => {
      if (!svgcontainer.current) {
        return;
      }
      const bounds = svgcontainer.current.getBoundingClientRect();
      const x = event.nativeEvent.clientX - bounds.left - center.x;
      const y = event.nativeEvent.clientY - bounds.top - center.y;
      dispatch(mouseUpAction(x, y));
    },
    [dispatch]
  );

  const proxyMouseLeave = useCallback(() => {
    if (!cursor.mouseClick) {
      return;
    }
    dispatch(mouseLeaveAction());
  }, [dispatch, cursor.mouseClick]);

  const atomsView = getAtomsView();
  const bondsView = getBondsView();
  const overlapView = getAtomsOverlapView();
  const transform = 'translate(' + center.x + ',' + center.y + ')';

  return (
    <div className="molpad-content">
      <svg
        width="100%"
        height="100%"
        className="molsvg"
        onMouseDown={proxyMouseDown}
        onMouseUp={proxyMouseUp}
        onMouseLeave={proxyMouseLeave}
        onMouseMove={proxyMouseMove}
        ref={svgcontainer}
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
};
