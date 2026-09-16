import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MolecularGraph } from '../../utils/smilesParser';
import { RotateCw, Maximize2, RefreshCw } from 'lucide-react';

interface MoleculeViewer3DProps {
  graph: MolecularGraph;
  compoundName: string;
}

export const MoleculeViewer3D: React.FC<MoleculeViewer3DProps> = ({
  graph,
  compoundName
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const molGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const [isRotating, setIsRotating] = useState(true);
  const isDragging = useRef(false);
  const prevMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = Math.max(container.clientWidth || 360, 200);
    const height = Math.max(container.clientHeight || 230, 150);

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.5);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x0284c7, 0.4);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    // 5. Molecule Group
    const molGroup = new THREE.Group();
    molGroupRef.current = molGroup;
    scene.add(molGroup);

    // Build 3D structure from graph
    build3DMolecule(graph, molGroup);

    // 6. Resize Observer
    const ro = new ResizeObserver(() => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      if (w > 0 && h > 0) {
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(w, h);
      }
    });
    ro.observe(container);

    // 7. Animation loop
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      if (molGroupRef.current && isRotating && !isDragging.current) {
        molGroupRef.current.rotation.y += 0.008;
      }
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    return () => {
      ro.disconnect();
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      renderer.dispose();
      container.replaceChildren();
    };
  }, []);

  // Re-build 3D structure when molecular graph updates
  useEffect(() => {
    if (molGroupRef.current) {
      build3DMolecule(graph, molGroupRef.current);
    }
  }, [graph]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    prevMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !molGroupRef.current) return;
    const deltaX = e.clientX - prevMouse.current.x;
    const deltaY = e.clientY - prevMouse.current.y;
    molGroupRef.current.rotation.y += deltaX * 0.01;
    molGroupRef.current.rotation.x += deltaY * 0.01;
    prevMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!cameraRef.current) return;
    cameraRef.current.position.z = Math.max(3.5, Math.min(16, cameraRef.current.position.z + e.deltaY * 0.01));
  };

  return (
    <div className="relative w-full h-[230px] bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex flex-col select-none shadow-2xs">
      {/* Top Header HUD */}
      <div className="flex items-center justify-between px-2.5 py-1 bg-white/90 border-b border-slate-200 text-[10px] font-mono text-slate-600 z-10">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
          <span className="text-slate-800 font-bold">3D BALL & STICK CONFORMER</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 transition-colors ${
              isRotating ? 'bg-sky-600 text-white font-bold' : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <RotateCw className="w-2.5 h-2.5" />
            <span>{isRotating ? 'SPIN ON' : 'PAUSED'}</span>
          </button>
          <button
            onClick={() => {
              if (molGroupRef.current && cameraRef.current) {
                molGroupRef.current.rotation.set(0, 0, 0);
                cameraRef.current.position.set(0, 0, 8.5);
              }
            }}
            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
            title="Reset Conformer"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas */}
      <div
        ref={mountRef}
        className="flex-1 w-full h-full cursor-grab active:cursor-grabbing outline-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Footer Info */}
      <div className="px-2.5 py-1 bg-white/90 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span>Conformer: <strong className="text-slate-800">{compoundName}</strong></span>
      </div>
    </div>
  );
};

// Helper to construct 3D Three.js objects from MolecularGraph
function build3DMolecule(graph: MolecularGraph, group: THREE.Group) {
  // Clear old meshes
  while (group.children.length > 0) {
    const obj = group.children[0];
    group.remove(obj);
  }

  // Calculate center of mass in 3D
  let cx = 0, cy = 0, cz = 0;
  graph.atoms.forEach((a) => {
    cx += a.x3d;
    cy += a.y3d;
    cz += a.z3d;
  });
  if (graph.atoms.length > 0) {
    cx /= graph.atoms.length;
    cy /= graph.atoms.length;
    cz /= graph.atoms.length;
  }

  // Create Atom Spheres
  const atomPositions: THREE.Vector3[] = [];
  graph.atoms.forEach((atom) => {
    const pos = new THREE.Vector3(atom.x3d - cx, atom.y3d - cy, atom.z3d - cz);
    atomPositions.push(pos);

    const geo = new THREE.SphereGeometry(atom.radius * 0.7, 16, 16);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(atom.color),
      roughness: 0.25,
      metalness: 0.15
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    group.add(mesh);
  });

  // Create Bond Cylinders
  const bondMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.35,
    metalness: 0.1
  });

  graph.bonds.forEach((bond) => {
    const p1 = atomPositions[bond.from];
    const p2 = atomPositions[bond.to];
    if (!p1 || !p2) return;

    const dir = new THREE.Vector3().subVectors(p2, p1);
    const len = dir.length();
    const half = dir.clone().multiplyScalar(0.5).add(p1);

    const radius = bond.order === 2 ? 0.08 : bond.order === 3 ? 0.1 : 0.055;
    const geo = new THREE.CylinderGeometry(radius, radius, len, 8);
    const mesh = new THREE.Mesh(geo, bondMat);

    // Orient cylinder along dir
    mesh.position.copy(half);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    group.add(mesh);
  });
}
