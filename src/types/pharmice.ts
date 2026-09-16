export type OrganSystem = 'skeletal' | 'vascular' | 'nervous' | 'visceral';

export type ToxicityClass = 'I' | 'II' | 'III' | 'IV' | 'V';

export interface Compound {
  id: string;
  name: string;
  commonName: string;
  smiles: string;
  formula: string;
  molecularWeight: number;
  logP: number;
  tpsa: number; // Topological Polar Surface Area in Å²
  hbd: number;  // Hydrogen Bond Donors
  hba: number;  // Hydrogen Bond Acceptors
  rotatableBonds: number;
  qed: number;   // Quantitative Estimate of Drug-likeness (0-1)
  casNumber?: string;
  therapeuticClass: string;
  mechanismOfAction: string;
  rationale?: string;
  isCustomLead?: boolean;
}

export interface StoichiometricGroup {
  id: string;
  label: string;
  fragmentSmiles: string;
  formula: string;
  deltaMw: number;
  deltaLogP: number;
  deltaTpsa: number;
  deltaHbd: number;
  deltaHba: number;
  category: 'polar' | 'lipophilic' | 'halogen' | 'aromatic' | 'solubilizing';
  description: string;
}

export type InjectionRoute = 
  | 'IV'   // Intravenous (Central / Tail Vein)
  | 'IP'   // Intraperitoneal (Abdominal Cavity / Portal First-Pass)
  | 'ICV'  // Intracerebroventricular / Intracranial (Direct CNS)
  | 'PO'   // Oral Gavage (Gastric / Enteric)
  | 'IH'   // Pulmonary Inhalation / Intratracheal
  | 'SC'   // Subcutaneous (Dorsal / Flank)
  | 'IM';  // Intramuscular / Intraosseous (Femoral)

export interface AnatomicalLandmark {
  id: string;
  name: string;
  organ: string;
  system: OrganSystem;
  coords3D: [number, number, number]; // Three.js vector space
  stereotaxicBregmaMm?: { ap: number; ml: number; dv: number }; // Paxinos mouse brain / stereotaxic coordinates (AP, ML, DV from Bregma)
  organWeightPercent?: number; // % of total C57BL/6 mouse body weight
  mouseAtlasRef?: string;
  description: string;
  baselineToxThreshold_uM: number;
  perfusionRate_ml_min: number;
  isBBB?: boolean;
  isHepaticClearance?: boolean;
  injectionRoute?: InjectionRoute;
  routeLabel?: string;
}

export interface OrganAccumulation {
  organ: string;
  concentration_uM: number;
  maxTolerated_uM: number;
  ratio: number;
  status: 'safe' | 'warning' | 'critical';
}

export interface ToxicityProfile {
  ld50_mg_kg: number;
  routeAdjustedLd50: number; // Dynamically adjusted based on the specific injection locus
  toxicityClass: ToxicityClass;
  confidenceInterval95: [number, number];
  injectionSite: {
    id: string;
    name: string;
    organ: string;
    route: InjectionRoute;
    routeLabel: string;
    firstPassType: string;
    bioavailabilityPct: number;
    tmax_hours: number;
    localCmaxFactor: number;
    injectionMechanism: string;
  };
  amesMutagenicity: {
    positive: boolean;
    confidencePct: number;
    assayEndpoint: string;
  };
  hergCardiotoxicity: {
    ic50_uM: number;
    risk: 'Low' | 'Moderate' | 'High';
    qtcIntervalMsDelta: number;
  };
  diliRisk: {
    risk: 'Safe' | 'Moderate' | 'Severe';
    altElevationPredictedPct: number;
    mitochondrialToxScore: number;
  };
  nephrotoxicity: {
    risk: 'Safe' | 'Moderate' | 'Elevated';
    oct2AccumulationPct: number;
  };
  neurotoxicity: {
    risk: 'Safe' | 'Moderate' | 'High';
    convulsantPotential: string;
  };
  bbbPenetration: {
    logBB: number;
    isPermeable: boolean;
    cnsClassification: string;
  };
  pharmacokinetics: {
    tmax_hours: number;
    halfLife_hours: number;
    vd_L_kg: number; // Volume of distribution
    oralBioavailabilityPct: number;
  };
  organAccumulations: OrganAccumulation[];
}

export interface SurvivalDataPoint {
  hours: number;
  vehicleControl: number;
  inSilicoPredict: number;
  rodentEmpiricalBenchmark: number;
  lowerCI: number;
  upperCI: number;
}

export interface SymptomTimelineEvent {
  hour: number;
  severity: 'benign' | 'mild' | 'moderate' | 'severe';
  organ: string;
  title: string;
  description: string;
  biomarkerDelta: string;
}

export interface RaycastHitData {
  point: [number, number, number];
  landmark: AnatomicalLandmark;
  distanceToBBB_mm: number;
  distanceToLiver_mm: number;
  estimatedLocalConc_uM: number;
  exposureRatio: number;
}

export interface LayerVisibility {
  bodySilhouette?: boolean;
  skeletal: boolean;
  vascular: boolean;
  nervous: boolean;
  visceral: boolean;
  collisionMeshes: boolean;
  drugParticles: boolean;
}

export type RolloutPhase = 'phase1_open' | 'phase2_enterprise';
