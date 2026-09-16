import React, { useState } from 'react';
import { MolecularGraph, AtomNode } from '../../utils/smilesParser';
import { ZoomIn, ZoomOut, RotateCcw, Eye } from 'lucide-react';

interface MoleculeViewer2DProps {
  graph: MolecularGraph;
  compoundName: string;
}

export const MoleculeViewer2D: React.FC<MoleculeViewer2DProps> = ({
  graph,
  compoundName
}) => {
  const [hoveredAtom, setHoveredAtom] = useState<AtomNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const resetTransform = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full h-[230px] bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex flex-col select-none shadow-2xs">
      {/* HUD Header */}
      <div className="flex items-center justify-between px-2.5 py-1 bg-white/90 border-b border-slate-200 text-[10px] font-mono text-slate-600 z-10">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-slate-800 font-bold">2D SKELETAL TOPOLOGY</span>
          <span className="text-slate-400">({graph.atoms.length} Atoms / {graph.bonds.length} Bonds)</span>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.15))}
            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.15))}
            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <button
            onClick={resetTransform}
            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div
        className="flex-1 w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 360 220"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Subtle Grid Pattern */}
          <defs>
            <pattern id="grid2d" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid2d)" />

          <g
            transform={`translate(${pan.x}, ${pan.y}) scale(${zoomLevel})`}
            style={{ transformOrigin: '180px 110px', transition: isPanning ? 'none' : 'transform 0.15s ease' }}
          >
            {/* Draw Covalent Bonds */}
            {graph.bonds.map((bond, idx) => {
              const a1 = graph.atoms[bond.from];
              const a2 = graph.atoms[bond.to];
              if (!a1 || !a2) return null;

              // Calculate offset perpendicular for double bonds
              const dx = a2.x2d - a1.x2d;
              const dy = a2.y2d - a1.y2d;
              const len = Math.sqrt(dx * dx + dy * dy) || 1;
              const nx = -dy / len;
              const ny = dx / len;

              if (bond.order === 2) {
                const offset = 2.4;
                return (
                  <g key={`bond-${idx}`}>
                    <line
                      x1={a1.x2d + nx * offset}
                      y1={a1.y2d + ny * offset}
                      x2={a2.x2d + nx * offset}
                      y2={a2.y2d + ny * offset}
                      stroke="#94a3b8"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    <line
                      x1={a1.x2d - nx * offset}
                      y1={a1.y2d - ny * offset}
                      x2={a2.x2d - nx * offset}
                      y2={a2.y2d - ny * offset}
                      stroke="#94a3b8"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </g>
                );
              }

              if (bond.order === 3) {
                const offset = 3.2;
                return (
                  <g key={`bond-${idx}`}>
                    <line
                      x1={a1.x2d}
                      y1={a1.y2d}
                      x2={a2.x2d}
                      y2={a2.y2d}
                      stroke="#94a3b8"
                      strokeWidth="2"
                    />
                    <line
                      x1={a1.x2d + nx * offset}
                      y1={a1.y2d + ny * offset}
                      x2={a2.x2d + nx * offset}
                      y2={a2.y2d + ny * offset}
                      stroke="#94a3b8"
                      strokeWidth="1.8"
                    />
                    <line
                      x1={a1.x2d - nx * offset}
                      y1={a1.y2d - ny * offset}
                      x2={a2.x2d - nx * offset}
                      y2={a2.y2d - ny * offset}
                      stroke="#94a3b8"
                      strokeWidth="1.8"
                    />
                  </g>
                );
              }

              // Standard Single Bond
              return (
                <line
                  key={`bond-${idx}`}
                  x1={a1.x2d}
                  y1={a1.y2d}
                  x2={a2.x2d}
                  y2={a2.y2d}
                  stroke="#94a3b8"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              );
            })}

            {/* Draw Atoms */}
            {graph.atoms.map((atom) => {
              const isCarbon = atom.symbol === 'C';
              const isHovered = hoveredAtom?.id === atom.id;

              return (
                <g
                  key={`atom-${atom.id}`}
                  className="cursor-pointer transition-transform"
                  onMouseEnter={() => setHoveredAtom(atom)}
                  onMouseLeave={() => setHoveredAtom(null)}
                >
                  {/* Outer glow on hover */}
                  {isHovered && (
                    <circle
                      cx={atom.x2d}
                      cy={atom.y2d}
                      r="12"
                      fill={atom.color}
                      opacity="0.25"
                    />
                  )}

                  {/* Node Circle */}
                  <circle
                    cx={atom.x2d}
                    cy={atom.y2d}
                    r={isCarbon ? 4 : 8}
                    fill={isCarbon ? '#64748b' : '#ffffff'}
                    stroke={atom.color}
                    strokeWidth={isCarbon ? '1.5' : '2'}
                  />

                  {/* Heteroatom Label (N, O, S, F, Cl, etc.) */}
                  {!isCarbon && (
                    <text
                      x={atom.x2d}
                      y={atom.y2d + 3.5}
                      textAnchor="middle"
                      fill={atom.color}
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      pointerEvents="none"
                    >
                      {atom.symbol}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Hovered Atom Tooltip */}
        {hoveredAtom && (
          <div className="absolute top-2 left-2 bg-white/95 border border-emerald-500 p-1.5 rounded-lg text-[10px] font-mono text-slate-800 shadow-md pointer-events-none">
            <div className="text-emerald-700 font-bold">
              Atom #{hoveredAtom.id}: {hoveredAtom.symbol}
            </div>
            <div className="text-slate-500">Coord: ({hoveredAtom.x2d.toFixed(1)}, {hoveredAtom.y2d.toFixed(1)})</div>
            <div className="text-slate-500">Hybridization: sp{hoveredAtom.symbol === 'C' ? '2/sp3' : '2'}</div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-2.5 py-1 bg-white/90 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span>Compound: <strong className="text-slate-800">{compoundName}</strong></span>
      </div>
    </div>
  );
};
