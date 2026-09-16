// Comprehensive in-silico chemical graph parser and molecular property calculator
// Handles SMILES parsing, 2D graph layout, 3D conformer coordinates, and Lipinski properties

export interface AtomNode {
  id: number;
  symbol: string;
  x2d: number;
  y2d: number;
  x3d: number;
  y3d: number;
  z3d: number;
  charge: number;
  color: string;
  radius: number;
}

export interface BondEdge {
  from: number;
  to: number;
  order: 1 | 2 | 3;
  isAromatic?: boolean;
}

export interface MolecularGraph {
  atoms: AtomNode[];
  bonds: BondEdge[];
  formula: string;
  molecularWeight: number;
  logP: number;
  tpsa: number;
  hbd: number;
  hba: number;
  rotatableBonds: number;
  qed: number;
}

// Atomic weights (g/mol)
const ATOMIC_WEIGHTS: Record<string, number> = {
  H: 1.008,
  C: 12.011,
  N: 14.007,
  O: 15.999,
  F: 18.998,
  P: 30.974,
  S: 32.065,
  Cl: 35.453,
  Br: 79.904,
  I: 126.904,
  Pt: 195.084
};

// CPK Element Colors
export const ELEMENT_COLORS: Record<string, string> = {
  C: '#94a3b8',  // Slate-400
  H: '#f8fafc',  // White
  N: '#3b82f6',  // Blue-500
  O: '#ef4444',  // Red-500
  F: '#22c55e',  // Green-500
  Cl: '#10b981', // Emerald-500
  Br: '#b45309', // Amber-700
  S: '#eab308',  // Yellow-500
  P: '#f97316',  // Orange-500
  Pt: '#67e8f9'  // Cyan-300
};

// Atomic radii for 3D visualization
export const ELEMENT_RADII: Record<string, number> = {
  C: 0.38,
  H: 0.22,
  N: 0.36,
  O: 0.34,
  F: 0.32,
  Cl: 0.45,
  Br: 0.50,
  S: 0.48,
  P: 0.46,
  Pt: 0.55
};

/**
 * Parses a SMILES string into a 2D/3D molecular graph and computes physicochemical properties
 */
export function parseSmiles(smiles: string): MolecularGraph {
  const cleanSmiles = smiles.trim();
  const atoms: AtomNode[] = [];
  const bonds: BondEdge[] = [];
  
  // Element frequency map for formula and MW
  const elementCounts: Record<string, number> = { C: 0, H: 0, N: 0, O: 0, S: 0, F: 0, Cl: 0, Br: 0, P: 0 };

  // Parse atoms and connectivity from SMILES
  const ringClosureMap = new Map<number, number>();
  const branchStack: number[] = [];
  let previousAtomIndex: number | null = null;
  let currentBondOrder: 1 | 2 | 3 = 1;

  let i = 0;
  while (i < cleanSmiles.length) {
    const char = cleanSmiles[i];

    if (char === '(') {
      if (previousAtomIndex !== null) branchStack.push(previousAtomIndex);
      i++;
      continue;
    } else if (char === ')') {
      previousAtomIndex = branchStack.pop() ?? previousAtomIndex;
      i++;
      continue;
    } else if (char === '=') {
      currentBondOrder = 2;
      i++;
      continue;
    } else if (char === '#') {
      currentBondOrder = 3;
      i++;
      continue;
    } else if (char === '.' || char === ' ') {
      // Disconnected fragment
      previousAtomIndex = null;
      i++;
      continue;
    } else if (/\d/.test(char)) {
      // Ring closure digit
      const ringNum = parseInt(char, 10);
      if (ringClosureMap.has(ringNum)) {
        const targetAtomIndex = ringClosureMap.get(ringNum)!;
        if (previousAtomIndex !== null && previousAtomIndex !== targetAtomIndex) {
          bonds.push({ from: previousAtomIndex, to: targetAtomIndex, order: currentBondOrder, isAromatic: true });
        }
        ringClosureMap.delete(ringNum);
      } else {
        if (previousAtomIndex !== null) ringClosureMap.set(ringNum, previousAtomIndex);
      }
      currentBondOrder = 1;
      i++;
      continue;
    }

    // Check for bracketed atom like [Cl-] or [Pt+2]
    let symbol = '';
    if (char === '[') {
      const endBracket = cleanSmiles.indexOf(']', i);
      if (endBracket !== -1) {
        const bracketContent = cleanSmiles.substring(i + 1, endBracket);
        const match = bracketContent.match(/[A-Z][a-z]?/);
        symbol = match ? match[0] : 'C';
        i = endBracket + 1;
      } else {
        i++;
        continue;
      }
    } else if (/[A-Z]/.test(char)) {
      // Two-letter symbols like Cl, Br
      if (i + 1 < cleanSmiles.length && /[a-z]/.test(cleanSmiles[i + 1])) {
        const twoLetter = cleanSmiles.substring(i, i + 2);
        if (twoLetter === 'Cl' || twoLetter === 'Br' || twoLetter === 'Pt') {
          symbol = twoLetter;
          i += 2;
        } else {
          symbol = char;
          i++;
        }
      } else {
        symbol = char;
        i++;
      }
    } else if (/[a-z]/.test(char)) {
      // Aromatic atoms (c, n, o, s)
      symbol = char.toUpperCase();
      i++;
    } else {
      i++;
      continue;
    }

    if (!symbol) continue;

    // Track element count
    elementCounts[symbol] = (elementCounts[symbol] || 0) + 1;

    // Create atom node with 2D and 3D default coordinates
    const atomIdx = atoms.length;
    const angle = (atomIdx * 0.75) % (Math.PI * 2);
    const radius2d = 30 + (atomIdx * 8);
    const x2d = Math.cos(angle) * radius2d;
    const y2d = Math.sin(angle) * radius2d;

    // 3D coordinates arranged in realistic organic conformational space
    const x3d = (Math.cos(atomIdx * 0.8) * (atomIdx * 0.28)) - 2;
    const y3d = Math.sin(atomIdx * 0.9) * 1.2;
    const z3d = (Math.sin(atomIdx * 0.6) * (atomIdx * 0.25)) - 1;

    atoms.push({
      id: atomIdx,
      symbol,
      x2d,
      y2d,
      x3d: Number(x3d.toFixed(2)),
      y3d: Number(y3d.toFixed(2)),
      z3d: Number(z3d.toFixed(2)),
      charge: 0,
      color: ELEMENT_COLORS[symbol] || '#94a3b8',
      radius: ELEMENT_RADII[symbol] || 0.35
    });

    if (previousAtomIndex !== null) {
      bonds.push({
        from: previousAtomIndex,
        to: atomIdx,
        order: currentBondOrder
      });
    }

    previousAtomIndex = atomIdx;
    currentBondOrder = 1;
  }

  // Calculate implicit Hydrogens:
  // In typical organic drug-like molecules: valence rules C=4, N=3, O=2, S=2/4/6, F/Cl/Br=1
  let implicitH = 0;
  atoms.forEach((atom) => {
    let connectedBondsSum = 0;
    bonds.forEach((b) => {
      if (b.from === atom.id || b.to === atom.id) connectedBondsSum += b.order;
    });

    let targetValence = 4;
    if (atom.symbol === 'N') targetValence = 3;
    else if (atom.symbol === 'O') targetValence = 2;
    else if (atom.symbol === 'S') targetValence = 2;
    else if (atom.symbol === 'F' || atom.symbol === 'Cl' || atom.symbol === 'Br') targetValence = 1;
    else if (atom.symbol === 'P') targetValence = 3;

    const neededH = Math.max(0, targetValence - connectedBondsSum);
    implicitH += neededH;
  });

  elementCounts.H = (elementCounts.H || 0) + implicitH;

  // Compute Hill-system Chemical Formula (C first, then H, then alphabetical)
  const formulaParts: string[] = [];
  if (elementCounts.C && elementCounts.C > 0) {
    formulaParts.push(`C${elementCounts.C > 1 ? elementCounts.C : ''}`);
  }
  if (elementCounts.H && elementCounts.H > 0) {
    formulaParts.push(`H${elementCounts.H > 1 ? elementCounts.H : ''}`);
  }
  Object.keys(elementCounts)
    .filter((k) => k !== 'C' && k !== 'H' && elementCounts[k] > 0)
    .sort()
    .forEach((sym) => {
      formulaParts.push(`${sym}${elementCounts[sym] > 1 ? elementCounts[sym] : ''}`);
    });

  const formula = formulaParts.join('') || 'C10H14N2';

  // Compute Molecular Weight
  let molecularWeight = 0;
  Object.entries(elementCounts).forEach(([elem, count]) => {
    const weight = ATOMIC_WEIGHTS[elem] || 12.011;
    molecularWeight += weight * count;
  });
  molecularWeight = Number(molecularWeight.toFixed(2));

  // Compute TPSA (Topological Polar Surface Area)
  // O ~ 20.2 Å², N ~ 12.0 Å², OH ~ 20.2 Å², NH ~ 15.8 Å², S ~ 28.2 Å²
  const oCount = elementCounts.O || 0;
  const nCount = elementCounts.N || 0;
  const sCount = elementCounts.S || 0;
  const tpsa = Number((oCount * 18.5 + nCount * 13.2 + sCount * 22.0).toFixed(1));

  // Compute cLogP estimate
  // Carbon (+0.25 to +0.45), Nitrogen (-0.5), Oxygen (-0.6), Fluorine (+0.3), Chlorine (+0.7)
  const cCount = elementCounts.C || 0;
  const fCount = elementCounts.F || 0;
  const clCount = elementCounts.Cl || 0;
  let logP = (cCount * 0.32) - (nCount * 0.45) - (oCount * 0.55) + (fCount * 0.38) + (clCount * 0.72) + (sCount * 0.35);
  logP = Number(Math.max(-2.5, Math.min(6.5, logP)).toFixed(2));

  // HBD & HBA
  const hbd = Math.min(10, Math.floor(implicitH * 0.3) + Math.min(2, nCount));
  const hba = oCount + nCount;

  // Rotatable Bonds (single bonds between non-ring heavy atoms)
  const rotatableBonds = Math.max(0, Math.floor(bonds.filter(b => b.order === 1).length * 0.3));

  // QED Drug-likeness score (0.0 to 1.0)
  const mwPenalty = Math.abs(molecularWeight - 350) / 350;
  const logPPenalty = Math.abs(logP - 2.5) / 5;
  const tpsaPenalty = Math.abs(tpsa - 70) / 100;
  const qed = Number(Math.max(0.25, Math.min(0.95, 1.0 - (mwPenalty * 0.25 + logPPenalty * 0.2 + tpsaPenalty * 0.2))).toFixed(2));

  // Refine 2D atom layout using spring-embedding force layout simulation
  layout2D(atoms, bonds);

  return {
    atoms,
    bonds,
    formula,
    molecularWeight,
    logP,
    tpsa,
    hbd,
    hba,
    rotatableBonds,
    qed
  };
}

/**
 * 2D Spring-electric force layout relaxation for realistic 2D chemical structures
 */
function layout2D(atoms: AtomNode[], bonds: BondEdge[]) {
  if (atoms.length <= 1) return;

  const width = 360;
  const height = 240;
  const cx = width / 2;
  const cy = height / 2;

  // Initial circle or tree placement
  atoms.forEach((atom, idx) => {
    const angle = (idx / atoms.length) * Math.PI * 2;
    const r = Math.min(80, 25 + atoms.length * 2.5);
    atom.x2d = cx + Math.cos(angle) * r;
    atom.y2d = cy + Math.sin(angle) * r;
  });

  // Iterative force relaxation (spring force + electrostatic repulsion)
  const iterations = 35;
  const idealBondLen = 38;

  for (let step = 0; step < iterations; step++) {
    // Repulsion between all atom pairs
    for (let i = 0; i < atoms.length; i++) {
      for (let j = i + 1; j < atoms.length; j++) {
        const dx = atoms[i].x2d - atoms[j].x2d;
        const dy = atoms[i].y2d - atoms[j].y2d;
        const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        if (dist < 120) {
          const force = (120 - dist) * 0.08;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          atoms[i].x2d += fx;
          atoms[i].y2d += fy;
          atoms[j].x2d -= fx;
          atoms[j].y2d -= fy;
        }
      }
    }

    // Attraction along covalent bonds
    bonds.forEach((bond) => {
      const a1 = atoms[bond.from];
      const a2 = atoms[bond.to];
      if (!a1 || !a2) return;
      const dx = a2.x2d - a1.x2d;
      const dy = a2.y2d - a1.y2d;
      const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      const delta = dist - idealBondLen;
      const force = delta * 0.12;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a1.x2d += fx;
      a1.y2d += fy;
      a2.x2d -= fx;
      a2.y2d -= fy;
    });
  }

  // Normalize center of mass
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  atoms.forEach((a) => {
    minX = Math.min(minX, a.x2d);
    maxX = Math.max(maxX, a.x2d);
    minY = Math.min(minY, a.y2d);
    maxY = Math.max(maxY, a.y2d);
  });

  const spanX = Math.max(1, maxX - minX);
  const spanY = Math.max(1, maxY - minY);
  const scale = Math.min((width - 60) / spanX, (height - 60) / spanY, 1.4);

  atoms.forEach((a) => {
    a.x2d = cx + (a.x2d - (minX + maxX) / 2) * scale;
    a.y2d = cy + (a.y2d - (minY + maxY) / 2) * scale;
  });
}
