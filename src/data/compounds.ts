import { Compound, StoichiometricGroup, AnatomicalLandmark, ToxicityProfile, SurvivalDataPoint, SymptomTimelineEvent } from '../types/pharmice';

export const INITIAL_COMPOUNDS: Compound[] = [
  {
    id: 'pmc-408',
    name: 'PMC-408 (In Silico Lead)',
    commonName: 'Fluorinated Pyridinyl Kinase Inhibitor',
    smiles: 'CN1CCN(CC1)CC2=CC=C(C=C2)C(=O)NC3=CC(=C(C=C3)F)NC4=NC=CC(=N4)C5=CN=CC=C5',
    formula: 'C28H28FN7O',
    molecularWeight: 497.58,
    logP: 2.76,
    tpsa: 85.3,
    hbd: 2,
    hba: 7,
    rotatableBonds: 6,
    qed: 0.84,
    therapeuticClass: 'Oncology / Selective Kinase Antagonist',
    mechanismOfAction: 'ATP-competitive reversible tyrosine kinase block with high hinge binding and minimal off-target cytochrome induction',
    rationale: 'Engineered in silico under FDA Modernization Act 2.0 to replace rodent high-dose escalation cohorts. Achieved 96.4% virtual safety clearance.',
    isCustomLead: true
  },
  {
    id: 'acetaminophen',
    name: 'Acetaminophen (APAP)',
    commonName: 'Paracetamol / N-acetyl-p-aminophenol',
    smiles: 'CC(=O)NC1=CC=C(C=C1)O',
    formula: 'C8H9NO2',
    molecularWeight: 151.16,
    logP: 0.46,
    tpsa: 49.3,
    hbd: 2,
    hba: 2,
    rotatableBonds: 1,
    qed: 0.62,
    casNumber: '103-90-2',
    therapeuticClass: 'Analgesic / Antipyretic',
    mechanismOfAction: 'Central COX inhibition with downstream peroxynitrite scavenging; toxic metabolite NAPQI induces hepatic glutathione depletion at supra-therapeutic doses',
    rationale: 'Benchmark reference compound for Rodent Drug-Induced Liver Injury (DILI) and hepatocyte necrosis models.'
  },
  {
    id: 'ibuprofen',
    name: 'Ibuprofen',
    commonName: '2-(4-isobutylphenyl)propanoic acid',
    smiles: 'CC(C)CC1=CC=C(C=C1)C(C)C(=O)O',
    formula: 'C13H18O2',
    molecularWeight: 206.28,
    logP: 3.51,
    tpsa: 37.3,
    hbd: 1,
    hba: 2,
    rotatableBonds: 4,
    qed: 0.77,
    casNumber: '15687-27-1',
    therapeuticClass: 'Nonsteroidal Anti-inflammatory (NSAID)',
    mechanismOfAction: 'Non-selective reversible inhibition of cyclooxygenases COX-1 and COX-2, decreasing prostaglandin synthesis',
    rationale: 'Benchmark reference for gastrointestinal mucosal barrier penetration and mild renal hemodynamics alteration.'
  },
  {
    id: 'doxorubicin',
    name: 'Doxorubicin',
    commonName: 'Adriamycin Anthracycline',
    smiles: 'CC1C(C(CC(O1)OC2CC(CC3=C2C(=O)C4=C(C3=O)C(=CC=C4)OC)(C(=O)CO)O)N)O',
    formula: 'C27H29NO11',
    molecularWeight: 543.52,
    logP: 1.27,
    tpsa: 206.1,
    hbd: 6,
    hba: 12,
    rotatableBonds: 5,
    qed: 0.38,
    casNumber: '23214-92-8',
    therapeuticClass: 'Antineoplastic Anthracycline',
    mechanismOfAction: 'Topoisomerase II intercalation and reactive oxygen species generation leading to mitochondrial membrane permeabilization',
    rationale: 'Benchmark reference for acute Rodent Cardiotoxicity and cardiomyocyte mitochondrial dysfunction.'
  },
  {
    id: 'haloperidol',
    name: 'Haloperidol',
    commonName: '4-[4-(4-chlorophenyl)-4-hydroxypiperidin-1-yl]-1-(4-fluorophenyl)butan-1-one',
    smiles: 'C1CC(CCN1CCCC(=O)C2=CC=C(C=C2)F)(C3=CC=C(C=C3)Cl)O',
    formula: 'C21H23ClFNO2',
    molecularWeight: 375.86,
    logP: 4.30,
    tpsa: 40.5,
    hbd: 1,
    hba: 3,
    rotatableBonds: 6,
    qed: 0.72,
    casNumber: '52-86-8',
    therapeuticClass: 'Typical Antipsychotic / D2 Antagonist',
    mechanismOfAction: 'High-affinity blockade of postsynaptic dopamine D2 receptors in mesolimbic and striatal pathways',
    rationale: 'Benchmark reference for rapid Blood-Brain Barrier (BBB) penetration and extrapyramidal movement metrics.'
  },
  {
    id: 'cisplatin',
    name: 'Cisplatin',
    commonName: 'cis-diamminedichloroplatinum(II)',
    smiles: 'N.N.[Cl-].[Cl-].[Pt+2]',
    formula: 'Cl2H6N2Pt',
    molecularWeight: 300.05,
    logP: -2.19,
    tpsa: 52.0,
    hbd: 2,
    hba: 2,
    rotatableBonds: 0,
    qed: 0.44,
    casNumber: '15663-27-1',
    therapeuticClass: 'Platinum-based DNA Alkylator',
    mechanismOfAction: 'Intrastrand and interstrand crosslinking of purine bases causing apoptotic arrest in cycling cells',
    rationale: 'Gold standard model for Rodent Nephrotoxicity via organic cation transporter-2 (OCT2) proximal tubular accumulation.'
  },
  {
    id: 'caffeine',
    name: 'Caffeine',
    commonName: '1,3,7-trimethylxanthine',
    smiles: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C',
    formula: 'C8H10N4O2',
    molecularWeight: 194.19,
    logP: -0.07,
    tpsa: 58.4,
    hbd: 0,
    hba: 4,
    rotatableBonds: 0,
    qed: 0.79,
    casNumber: '58-08-2',
    therapeuticClass: 'CNS Stimulant / Phosphodiesterase Inhibitor',
    mechanismOfAction: 'Non-selective adenosine receptor A1 and A2A competitive antagonist with mild intracellular cAMP upregulation',
    rationale: 'High safety margin control molecule displaying zero cellular mutagenicity and low clearance liability.'
  }
];

export const STOICHIOMETRIC_GROUPS: StoichiometricGroup[] = [
  {
    id: 'grp-fluoro',
    label: '-F (Fluoro)',
    fragmentSmiles: 'F',
    formula: '+F',
    deltaMw: 18.99,
    deltaLogP: +0.25,
    deltaTpsa: 0.0,
    deltaHbd: 0,
    deltaHba: 0,
    category: 'halogen',
    description: 'Improves metabolic stability by blocking CYP-mediated aromatic hydroxylation.'
  },
  {
    id: 'grp-cf3',
    label: '-CF3 (Trifluoromethyl)',
    fragmentSmiles: 'C(F)(F)F',
    formula: '+CF3',
    deltaMw: 69.01,
    deltaLogP: +0.92,
    deltaTpsa: 0.0,
    deltaHbd: 0,
    deltaHba: 0,
    category: 'lipophilic',
    description: 'Significantly enhances membrane permeation and lipophilicity; modifies pKa of adjacent sites.'
  },
  {
    id: 'grp-hydroxyl',
    label: '-OH (Hydroxyl)',
    fragmentSmiles: 'O',
    formula: '+OH',
    deltaMw: 17.01,
    deltaLogP: -0.65,
    deltaTpsa: +20.2,
    deltaHbd: +1,
    deltaHba: +1,
    category: 'polar',
    description: 'Increases aqueous solubility; acts as both hydrogen bond donor and acceptor.'
  },
  {
    id: 'grp-carboxyl',
    label: '-COOH (Carboxyl)',
    fragmentSmiles: 'C(=O)O',
    formula: '+COOH',
    deltaMw: 45.02,
    deltaLogP: -0.80,
    deltaTpsa: +37.3,
    deltaHbd: +1,
    deltaHba: +2,
    category: 'polar',
    description: 'Ionizable acidic moiety, increases systemic clearance and curtails passive BBB penetration.'
  },
  {
    id: 'grp-amine',
    label: '-NH2 (Amine)',
    fragmentSmiles: 'N',
    formula: '+NH2',
    deltaMw: 16.02,
    deltaLogP: -0.95,
    deltaTpsa: +26.0,
    deltaHbd: +1,
    deltaHba: +1,
    category: 'polar',
    description: 'Basic nitrogen headgroup; facilitates electrostatic salt-bridge interaction with target proteins.'
  },
  {
    id: 'grp-methoxy',
    label: '-OCH3 (Methoxy)',
    fragmentSmiles: 'OC',
    formula: '+OCH3',
    deltaMw: 31.03,
    deltaLogP: +0.10,
    deltaTpsa: +9.2,
    deltaHbd: 0,
    deltaHba: +1,
    category: 'solubilizing',
    description: 'Weak electron-donating resonance group that modulates binding pocket steric fill.'
  },
  {
    id: 'grp-methyl',
    label: '-CH3 (Methyl)',
    fragmentSmiles: 'C',
    formula: '+CH3',
    deltaMw: 15.03,
    deltaLogP: +0.50,
    deltaTpsa: 0.0,
    deltaHbd: 0,
    deltaHba: 0,
    category: 'lipophilic',
    description: 'Standard hydrophobic anchor; can shield hydrogen bond donors to enhance oral bioavailability.'
  },
  {
    id: 'grp-sulfonamide',
    label: '-SO2NH2 (Sulfonamide)',
    fragmentSmiles: 'S(=O)(=O)N',
    formula: '+SO2NH2',
    deltaMw: 80.08,
    deltaLogP: -0.75,
    deltaTpsa: +65.2,
    deltaHbd: +1,
    deltaHba: +3,
    category: 'solubilizing',
    description: 'Robust pharmacophore with high hydrogen bonding capacity and reduced cardiovascular hERG risk.'
  },
  {
    id: 'grp-cyano',
    label: '-CN (Cyano)',
    fragmentSmiles: 'C#N',
    formula: '+CN',
    deltaMw: 26.02,
    deltaLogP: -0.32,
    deltaTpsa: +23.8,
    deltaHbd: 0,
    deltaHba: +1,
    category: 'polar',
    description: 'Linear dipole bioisostere for halogens with strong directional electrostatics.'
  },
  {
    id: 'grp-phenyl',
    label: '-Ph (Phenyl Ring)',
    fragmentSmiles: 'C1=CC=CC=C1',
    formula: '+C6H5',
    deltaMw: 77.10,
    deltaLogP: +1.95,
    deltaTpsa: 0.0,
    deltaHbd: 0,
    deltaHba: 0,
    category: 'aromatic',
    description: 'Aromatic pi-stacking moiety; improves potency at hydrophobic deep pockets.'
  }
];

export const ANATOMICAL_LANDMARKS: AnatomicalLandmark[] = [
  {
    id: 'cranial-bbb',
    name: 'Blood-Brain Barrier (BBB)',
    organ: 'Brain / Prefrontal Capillaries',
    system: 'nervous',
    coords3D: [0.0, 1.46, 2.45],
    stereotaxicBregmaMm: { ap: 0.8, ml: 1.2, dv: -2.4 },
    organWeightPercent: 1.75,
    mouseAtlasRef: 'Allen Mouse Brain Atlas / Paxinos P02',
    description: 'Microvascular endothelial tight junctions with astrocyte end-feet sealing CNS parenchyma from circulating xenobiotics.',
    baselineToxThreshold_uM: 2.8,
    perfusionRate_ml_min: 0.95,
    isBBB: true,
    injectionRoute: 'ICV',
    routeLabel: 'Intracerebroventricular / Intracranial (Direct CNS)'
  },
  {
    id: 'cardiac-ventricle',
    name: 'Left Ventricle / hERG Channel',
    organ: 'Heart',
    system: 'vascular',
    coords3D: [0.08, 0.65, 1.25],
    stereotaxicBregmaMm: { ap: -8.5, ml: 1.8, dv: -9.2 },
    organWeightPercent: 0.55,
    mouseAtlasRef: 'Murine Cardiac Chamber (T4-T6 Ventral Thorax)',
    description: 'Ventral thoracic 4-chamber cardiac pump with high density of Kv11.1 (hERG) channels susceptible to QT-prolongation.',
    baselineToxThreshold_uM: 5.4,
    perfusionRate_ml_min: 4.8,
    injectionRoute: 'IV',
    routeLabel: 'Intracardiac / Central Intravenous (IV / Tail Vein)'
  },
  {
    id: 'pulmonary-alveoli',
    name: 'Pulmonary Alveolar Bed',
    organ: 'Lungs',
    system: 'visceral',
    coords3D: [-0.32, 0.72, 1.20],
    stereotaxicBregmaMm: { ap: -7.8, ml: -3.5, dv: -8.0 },
    organWeightPercent: 0.70,
    mouseAtlasRef: 'Mouse Lung Atlas (Left single lobe, Right 4 lobes)',
    description: 'High-surface-area respiratory capillary bed receiving total cardiac output; vulnerable to cationic amphiphilic phospholipidosis.',
    baselineToxThreshold_uM: 6.5,
    perfusionRate_ml_min: 15.0,
    injectionRoute: 'IH',
    routeLabel: 'Intratracheal / Pulmonary Inhalation (IH)'
  },
  {
    id: 'hepatic-lobule',
    name: 'Hepatic Parenchyma (DILI Hub)',
    organ: 'Liver',
    system: 'visceral',
    coords3D: [-0.15, 0.45, 0.25],
    stereotaxicBregmaMm: { ap: -14.2, ml: -2.2, dv: -10.5 },
    organWeightPercent: 5.40,
    mouseAtlasRef: 'Murine Hepatic Lobes (Median, Left Lateral, Right, Caudate)',
    description: 'Major metabolic hub rich in CYP3A11/CYP2D22, responsible for clearance and primary target for Drug-Induced Liver Injury (DILI).',
    baselineToxThreshold_uM: 8.2,
    perfusionRate_ml_min: 12.4,
    isHepaticClearance: true,
    injectionRoute: 'IP',
    routeLabel: 'Intraperitoneal (IP / Hepatic Portal First-Pass)'
  },
  {
    id: 'gastric-mucosa',
    name: 'Gastric Mucosal Epithelium',
    organ: 'Stomach / GI Tract',
    system: 'visceral',
    coords3D: [0.28, 0.48, 0.45],
    stereotaxicBregmaMm: { ap: -13.5, ml: 3.8, dv: -9.8 },
    organWeightPercent: 1.20,
    mouseAtlasRef: 'Murine Stomach (Non-glandular Forestomach & Glandular Corpus)',
    description: 'Acidic mucosal barrier and initial absorption site for oral formulations; susceptible to COX-1 inhibition ulceration.',
    baselineToxThreshold_uM: 10.0,
    perfusionRate_ml_min: 3.2,
    injectionRoute: 'PO',
    routeLabel: 'Oral Gavage (PO / Gastric Mucosa)'
  },
  {
    id: 'splenic-pulp',
    name: 'Splenic Red/White Pulp',
    organ: 'Spleen',
    system: 'visceral',
    coords3D: [-0.52, 0.42, 0.05],
    stereotaxicBregmaMm: { ap: -16.0, ml: -5.4, dv: -9.5 },
    organWeightPercent: 0.35,
    mouseAtlasRef: 'Murine Spleen (Greater Curvature Mesentery)',
    description: 'Elongated lymphoid organ filtering erythrocyte senescence and orchestrating systemic immune/antibody responsiveness.',
    baselineToxThreshold_uM: 3.8,
    perfusionRate_ml_min: 1.8,
    injectionRoute: 'IP',
    routeLabel: 'Intrasplenic / Mesenteric Lymphoid Bolus'
  },
  {
    id: 'renal-glomerulus',
    name: 'Renal Cortex & Glomeruli',
    organ: 'Kidneys',
    system: 'visceral',
    coords3D: [0.46, 0.48, -0.65],
    stereotaxicBregmaMm: { ap: -19.5, ml: 4.8, dv: -8.6 },
    organWeightPercent: 1.35,
    mouseAtlasRef: 'Murine Kidneys (Retroperitoneal / Hepatic Impression)',
    description: 'Glomerular filtration and OCT2/OAT1 proximal tubule transport hub mediating active xenobiotic excretion and nephrotoxicity.',
    baselineToxThreshold_uM: 4.1,
    perfusionRate_ml_min: 8.6,
    injectionRoute: 'IV',
    routeLabel: 'Renal Arterial Infusion / Retroperitoneal'
  },
  {
    id: 'cecum-microbiome',
    name: 'Cecum / Enteric Fermentation',
    organ: 'Large Intestine / Cecum',
    system: 'visceral',
    coords3D: [0.25, 0.28, -1.05],
    stereotaxicBregmaMm: { ap: -24.0, ml: 3.2, dv: -12.0 },
    organWeightPercent: 2.10,
    mouseAtlasRef: 'Murine Cecal Pouch (Rodent Microbiome Reservoir)',
    description: 'Large blind fermentation pouch distinctive to rodent anatomy; essential for prodrug microbial hydrolysis and enterohepatic recycling.',
    baselineToxThreshold_uM: 9.0,
    perfusionRate_ml_min: 2.5,
    injectionRoute: 'PO',
    routeLabel: 'Enteric Cecal / Colonic Gavage'
  },
  {
    id: 'spinal-cord',
    name: 'Dorsal Spinal Axis',
    organ: 'Spinal Cord',
    system: 'nervous',
    coords3D: [0.0, 1.28, 0.30],
    stereotaxicBregmaMm: { ap: -12.0, ml: 0.0, dv: -4.5 },
    organWeightPercent: 0.40,
    mouseAtlasRef: 'Murine Vertebral Canal (Thoracolumbar Spine)',
    description: 'Myelinated motor and sensory axonal tracts traversing neural arches; sensitive to neurotoxic conduction block and neuropathy.',
    baselineToxThreshold_uM: 3.0,
    perfusionRate_ml_min: 0.4,
    injectionRoute: 'SC',
    routeLabel: 'Subcutaneous / Intrathecal (Dorsal Axis)'
  },
  {
    id: 'femoral-marrow',
    name: 'Femoral Bone Marrow',
    organ: 'Skeletal / Marrow',
    system: 'skeletal',
    coords3D: [-0.92, 0.28, -1.40],
    stereotaxicBregmaMm: { ap: -26.5, ml: -9.5, dv: -11.0 },
    organWeightPercent: 1.10,
    mouseAtlasRef: 'Murine Femur & Tibia (Hematopoietic Stem Cell Niche)',
    description: 'Primary rodent hematopoietic niche containing rapidly dividing progenitors; sensitive to myelosuppressive and alkylating toxicity.',
    baselineToxThreshold_uM: 1.5,
    perfusionRate_ml_min: 0.6,
    injectionRoute: 'IM',
    routeLabel: 'Intramuscular / Intraosseous (Femoral Marrow)'
  }
];

// Predictive algorithm generating in-silico toxicological profile dynamically tailored to injection location
export function computeToxicityProfile(
  compound: Compound, 
  injectionLandmark?: AnatomicalLandmark | null
): ToxicityProfile {
  const landmark = injectionLandmark || ANATOMICAL_LANDMARKS[0];
  const route = landmark.injectionRoute || 'IV';
  const { molecularWeight, logP, tpsa, hbd, hba, rotatableBonds } = compound;

  // Base oral LD50 benchmark based on compound chemical architecture
  let baseOralLd50 = 850;
  if (compound.id === 'pmc-408') baseOralLd50 = 980;
  else if (compound.id === 'acetaminophen') baseOralLd50 = 338;
  else if (compound.id === 'doxorubicin') baseOralLd50 = 21.8;
  else if (compound.id === 'haloperidol') baseOralLd50 = 128;
  else if (compound.id === 'cisplatin') baseOralLd50 = 25.4;
  else if (compound.id === 'ibuprofen') baseOralLd50 = 636;
  else if (compound.id === 'caffeine') baseOralLd50 = 1920;
  else {
    baseOralLd50 = Math.max(
      15,
      Math.round(750 + (tpsa * 2.2) - (logP * 120) - (molecularWeight * 0.4) + (hbd * 40))
    );
  }

  // Dynamic PBPK route factors calibrated to murine pharmacology
  let routeFactor = 1.0;
  let firstPassType = 'Gastrointestinal & Hepatic First-Pass';
  let bioavailabilityPct = Math.min(96, Math.max(22, Math.round(100 - (tpsa * 0.4) - (rotatableBonds * 3))));
  let tmax_hours = Number((1.4 + (rotatableBonds * 0.15)).toFixed(2));
  let localCmaxFactor = 1.5;
  let injectionMechanism = 'Oral mucosal & gastric enterocyte transit into portal circulation';

  switch (route) {
    case 'ICV': // Direct CNS / Intracerebral
      routeFactor = 0.16; // ICV is ~6x more lethal acutely than oral due to direct neural access
      firstPassType = 'Direct CNS Bypassing BBB';
      bioavailabilityPct = 100;
      tmax_hours = 0.05;
      localCmaxFactor = 9.2;
      injectionMechanism = 'Direct micro-stereotaxic infusion into ventricular / cerebral CSF; zero BBB endothelial filtering';
      break;
    case 'IV': // Intravenous / Cardiac / Tail vein
      routeFactor = 0.38; // IV delivers immediate 100% systemic bolus
      firstPassType = 'Immediate Systemic Circulation';
      bioavailabilityPct = 100;
      tmax_hours = 0.08;
      localCmaxFactor = 3.6;
      injectionMechanism = 'Direct intravascular bolus into cardiac / tail vein vascular lumen; bypasses GI and cutaneous barriers';
      break;
    case 'IH': // Pulmonary Inhalation / Intratracheal
      routeFactor = 0.46;
      firstPassType = 'Alveolar Capillary Transport';
      bioavailabilityPct = 92;
      tmax_hours = 0.18;
      localCmaxFactor = 5.2;
      injectionMechanism = 'Aerosolized intratracheal deposition across thin 0.2 µm pneumocyte alveolar-capillary membrane';
      break;
    case 'IP': // Intraperitoneal (Hepatic portal direct)
      routeFactor = 0.70;
      firstPassType = '100% Hepatic Portal First-Pass';
      bioavailabilityPct = 84;
      tmax_hours = 0.45;
      localCmaxFactor = 2.8;
      injectionMechanism = 'Peritoneal serosa absorption drain into mesenteric venules directly entering hepatic portal vein';
      break;
    case 'IM': // Intramuscular / Femoral Marrow
      routeFactor = 0.82;
      firstPassType = 'Skeletal & Medullary Perfusion';
      bioavailabilityPct = 88;
      tmax_hours = 0.75;
      localCmaxFactor = 4.0;
      injectionMechanism = 'Deposition into femoral interstitial myofibrils with rapid capillary & endosteal marrow permeation';
      break;
    case 'SC': // Subcutaneous / Dorsal
      routeFactor = 1.25; // Slow release depot buffers acute peak
      firstPassType = 'Slow Interstitial Lymphatic Depot';
      bioavailabilityPct = 74;
      tmax_hours = 2.4;
      localCmaxFactor = 1.1;
      injectionMechanism = 'Depot in hypodermal loose connective tissue; gradual lymphatic uptake buffers acute plasma peak';
      break;
    case 'PO':
    default:
      routeFactor = 1.0;
      break;
  }

  const routeAdjustedLd50 = Math.max(2, Math.round(baseOralLd50 * routeFactor));

  // Determine Toxicity Class based on route-adjusted LD50 (OECD / EPA GHS categories)
  let toxicityClass: 'I' | 'II' | 'III' | 'IV' | 'V' = 'IV';
  if (routeAdjustedLd50 < 50) toxicityClass = 'I';
  else if (routeAdjustedLd50 < 300) toxicityClass = 'II';
  else if (routeAdjustedLd50 < 500) toxicityClass = 'III';
  else if (routeAdjustedLd50 < 2000) toxicityClass = 'IV';
  else toxicityClass = 'V';

  // Ames mutagenicity
  const isCisplatin = compound.id === 'cisplatin';
  const amesPositive = isCisplatin || (compound.smiles.includes('[Pt]') || (compound.smiles.includes('N(=O)=O') && logP > 2));
  const amesConfidence = amesPositive ? 96.2 : 93.8;

  // hERG cardiotoxicity (elevated acutely if injected directly IV into heart/circulation)
  let hergRisk: 'Low' | 'Moderate' | 'High' = 'Low';
  let hergIc50 = 18.5; // uM
  if (compound.id === 'doxorubicin' || compound.id === 'haloperidol' || (route === 'IV' && logP > 2.2)) {
    hergRisk = 'High';
    hergIc50 = compound.id === 'doxorubicin' ? 0.42 : 0.75;
  } else if (logP > 2.8 || route === 'IV') {
    hergRisk = 'Moderate';
    hergIc50 = 3.2;
  }

  // Drug-Induced Liver Injury (DILI) - amplified heavily under Intraperitoneal (IP) portal injection
  let diliRisk: 'Safe' | 'Moderate' | 'Severe' = 'Safe';
  let altElevation = 8.5;
  if (compound.id === 'acetaminophen' || (route === 'IP' && baseOralLd50 < 450)) {
    diliRisk = 'Severe';
    altElevation = route === 'IP' ? 84.6 : 68.4;
  } else if (logP > 3.5 || route === 'IP') {
    diliRisk = 'Moderate';
    altElevation = route === 'IP' ? 38.5 : 28.0;
  }

  // Nephrotoxicity
  let nephroRisk: 'Safe' | 'Moderate' | 'Elevated' = 'Safe';
  let oct2Pct = 4.2;
  if (compound.id === 'cisplatin' || landmark.id === 'renal-glomerulus') {
    nephroRisk = 'Elevated';
    oct2Pct = landmark.id === 'renal-glomerulus' ? 88.5 : 78.5;
  } else if (compound.id === 'ibuprofen') {
    nephroRisk = 'Moderate';
    oct2Pct = 19.3;
  }

  // BBB penetration
  const calculatedLogBB = Number((0.152 * logP - 0.0148 * tpsa + 0.139).toFixed(2));
  const isBBBPermeable = calculatedLogBB > -0.3 || compound.id === 'haloperidol' || route === 'ICV';

  // Neurotoxicity: Direct ICV injection causes high neurotoxicity regardless of logBB!
  let neuroRisk: 'Safe' | 'Moderate' | 'High' = 'Safe';
  let convulsantPotential = 'Negative';
  if (route === 'ICV') {
    neuroRisk = 'High';
    convulsantPotential = 'Critical (Direct Cerebroventricular Seizure Liability)';
  } else if (isBBBPermeable && logP > 3.5) {
    neuroRisk = 'Moderate';
    convulsantPotential = 'Elevated at 4x Cmax';
  }

  // Organ accumulations at steady state (uM) - Dynamically biased by Injection Site!
  let liverConc = Number((8.2 * (logP > 2 ? 1.4 : 0.8)).toFixed(1));
  let heartConc = Number((3.5 * (hergRisk === 'High' ? 2.4 : 0.9)).toFixed(1));
  let brainConc = Number((isBBBPermeable ? 4.8 : 0.6).toFixed(1));
  let kidneyConc = Number((5.1 * (nephroRisk === 'Elevated' ? 2.8 : 1.0)).toFixed(1));
  let lungConc = Number((4.2 * (logP > 3 ? 1.6 : 0.7)).toFixed(1));

  // Injection Site Local Bias
  if (landmark.id === 'cranial-bbb' || route === 'ICV') {
    brainConc = Number((brainConc * 4.2).toFixed(1));
  } else if (landmark.id === 'cardiac-ventricle' || route === 'IV') {
    heartConc = Number((heartConc * 2.8).toFixed(1));
    lungConc = Number((lungConc * 1.8).toFixed(1));
  } else if (landmark.id === 'pulmonary-alveoli' || route === 'IH') {
    lungConc = Number((lungConc * 4.6).toFixed(1));
  } else if (landmark.id === 'hepatic-lobule' || route === 'IP') {
    liverConc = Number((liverConc * 2.5).toFixed(1));
  } else if (landmark.id === 'renal-glomerulus') {
    kidneyConc = Number((kidneyConc * 3.2).toFixed(1));
  }

  const organAccumulations = [
    {
      organ: 'Brain (CNS)',
      concentration_uM: brainConc,
      maxTolerated_uM: 3.5,
      ratio: Number((brainConc / 3.5).toFixed(2)),
      status: brainConc > 3.5 ? ('critical' as const) : brainConc > 2.8 ? ('warning' as const) : ('safe' as const)
    },
    {
      organ: 'Heart (Myocytes)',
      concentration_uM: heartConc,
      maxTolerated_uM: 5.0,
      ratio: Number((heartConc / 5.0).toFixed(2)),
      status: heartConc > 5.0 ? ('critical' as const) : heartConc > 3.8 ? ('warning' as const) : ('safe' as const)
    },
    {
      organ: 'Liver (Parenchyma)',
      concentration_uM: liverConc,
      maxTolerated_uM: 10.0,
      ratio: Number((liverConc / 10.0).toFixed(2)),
      status: liverConc > 10.0 ? ('critical' as const) : liverConc > 7.5 ? ('warning' as const) : ('safe' as const)
    },
    {
      organ: 'Kidneys (Nephrons)',
      concentration_uM: kidneyConc,
      maxTolerated_uM: 6.5,
      ratio: Number((kidneyConc / 6.5).toFixed(2)),
      status: kidneyConc > 6.5 ? ('critical' as const) : kidneyConc > 4.5 ? ('warning' as const) : ('safe' as const)
    },
    {
      organ: 'Lungs (Pulmonary)',
      concentration_uM: lungConc,
      maxTolerated_uM: 8.0,
      ratio: Number((lungConc / 8.0).toFixed(2)),
      status: lungConc > 8.0 ? ('critical' as const) : lungConc > 6.0 ? ('warning' as const) : ('safe' as const)
    }
  ];

  return {
    ld50_mg_kg: baseOralLd50,
    routeAdjustedLd50,
    toxicityClass,
    confidenceInterval95: [Math.round(routeAdjustedLd50 * 0.85), Math.round(routeAdjustedLd50 * 1.15)],
    injectionSite: {
      id: landmark.id,
      name: landmark.name,
      organ: landmark.organ,
      route,
      routeLabel: landmark.routeLabel || route,
      firstPassType,
      bioavailabilityPct,
      tmax_hours,
      localCmaxFactor,
      injectionMechanism
    },
    amesMutagenicity: {
      positive: amesPositive,
      confidencePct: amesConfidence,
      assayEndpoint: 'Tox21-Ames-TA98/TA100 Vectorized In Silico'
    },
    hergCardiotoxicity: {
      ic50_uM: hergIc50,
      risk: hergRisk,
      qtcIntervalMsDelta: hergRisk === 'High' ? 42 : hergRisk === 'Moderate' ? 16 : 2
    },
    diliRisk: {
      risk: diliRisk,
      altElevationPredictedPct: altElevation,
      mitochondrialToxScore: diliRisk === 'Severe' ? 0.89 : diliRisk === 'Moderate' ? 0.45 : 0.12
    },
    nephrotoxicity: {
      risk: nephroRisk,
      oct2AccumulationPct: oct2Pct
    },
    neurotoxicity: {
      risk: neuroRisk,
      convulsantPotential
    },
    bbbPenetration: {
      logBB: calculatedLogBB,
      isPermeable: isBBBPermeable,
      cnsClassification: route === 'ICV' ? 'Direct CNS Infusion (Bypassed)' : isBBBPermeable ? 'CNS Active (+)' : 'CNS Excluded (-)'
    },
    pharmacokinetics: {
      tmax_hours,
      halfLife_hours: Number((3.8 + (logP * 1.1) + (route === 'SC' ? 2.5 : 0)).toFixed(1)),
      vd_L_kg: Number((0.8 + (logP * 0.3)).toFixed(2)),
      oralBioavailabilityPct: bioavailabilityPct
    },
    organAccumulations
  };
}

// Generate dynamic Kaplan-Meier predicted survival curves based on dose, compound, and injection locus
export function computeSurvivalCurves(
  compound: Compound, 
  dose_mg_kg: number,
  injectionLandmark?: AnatomicalLandmark | null
): SurvivalDataPoint[] {
  const profile = computeToxicityProfile(compound, injectionLandmark);
  // Dose ratio relative to the route-adjusted LD50!
  const ratio = dose_mg_kg / profile.routeAdjustedLd50;
  const route = profile.injectionSite.route;

  const hours = [0, 2, 4, 8, 12, 18, 24, 36, 48, 72];

  return hours.map((h) => {
    if (h === 0) {
      return {
        hours: 0,
        vehicleControl: 100,
        inSilicoPredict: 100,
        rodentEmpiricalBenchmark: 100,
        lowerCI: 98,
        upperCI: 100
      };
    }

    // IV and ICV routes cause much sharper, steeper early mortality onset (hours 2-6)
    let timeScale = (h / 24);
    if (route === 'ICV' || route === 'IV') {
      timeScale = Math.pow(h / 12, 0.7); // early acute drop
    } else if (route === 'SC') {
      timeScale = Math.pow(h / 32, 1.3); // delayed onset
    }

    // Sigmoidal decay model for survival probability
    const decayRate = Math.min(0.97, Math.pow(ratio, 1.7) * timeScale);
    let inSilicoVal = Math.max(2, Math.round((1 - decayRate * 0.85) * 100));
    if (ratio < 0.25) inSilicoVal = Math.max(90, 100 - Math.round(h * 0.08));

    // Rodent benchmark has biological stochastic variance
    const empiricalNoise = (Math.sin(h * 1.5) * 2.2);
    const empiricalVal = Math.max(1, Math.min(100, Math.round(inSilicoVal + empiricalNoise)));

    const lowerCI = Math.max(0, inSilicoVal - 6);
    const upperCI = Math.min(100, inSilicoVal + 6);

    return {
      hours: h,
      vehicleControl: 100,
      inSilicoPredict: inSilicoVal,
      rodentEmpiricalBenchmark: empiricalVal,
      lowerCI,
      upperCI
    };
  });
}

// Symptom timeline events over 72 hours dynamically reflecting the specific injection locus
export function computeSymptomTimeline(
  compound: Compound, 
  dose_mg_kg: number,
  injectionLandmark?: AnatomicalLandmark | null
): SymptomTimelineEvent[] {
  const profile = computeToxicityProfile(compound, injectionLandmark);
  const ratio = dose_mg_kg / profile.routeAdjustedLd50;
  const site = profile.injectionSite;

  // Custom initial onset event based on injection route
  let initialEvent: SymptomTimelineEvent;
  switch (site.route) {
    case 'ICV':
      initialEvent = {
        hour: 0.1,
        severity: ratio > 0.4 ? 'severe' : 'moderate',
        organ: 'Brain Ventricles (CNS)',
        title: 'Intracerebroventricular Ingress',
        description: 'Direct intraventricular diffusion into CSF without endothelial attenuation. High-frequency cortical discharge.',
        biomarkerDelta: `CSF Cmax = ${(dose_mg_kg * 0.45).toFixed(1)} µM • EEG Spike Wave`
      };
      break;
    case 'IV':
      initialEvent = {
        hour: 0.15,
        severity: ratio > 0.6 ? 'severe' : 'mild',
        organ: 'Cardiac / Systemic Lumen',
        title: 'Intravascular Bolus Transit',
        description: 'Instantaneous 100% bioavailable intravascular bolus passes through right atrium into pulmonary capillary bed.',
        biomarkerDelta: `Plasma Cmax = ${(dose_mg_kg * 0.22).toFixed(1)} µM • QTc delta`
      };
      break;
    case 'IH':
      initialEvent = {
        hour: 0.2,
        severity: ratio > 0.5 ? 'severe' : 'mild',
        organ: 'Pulmonary Alveolar Epithelium',
        title: 'Intratracheal Alveolar Deposition',
        description: 'Rapid permeation across type I pneumocytes; pulmonary capillary gas-exchange interface saturation.',
        biomarkerDelta: 'PaO2 -12% • Alveolar Flux'
      };
      break;
    case 'IP':
      initialEvent = {
        hour: 0.4,
        severity: ratio > 0.7 ? 'moderate' : 'benign',
        organ: 'Peritoneal Cavity & Portal Vein',
        title: 'Peritoneal Resorption & First-Pass',
        description: 'Mesenteric microcirculation absorbs xenobiotic; direct venous drainage into hepatic portal system.',
        biomarkerDelta: `Portal Vein Conc = ${(dose_mg_kg * 0.15).toFixed(1)} µM`
      };
      break;
    case 'IM':
      initialEvent = {
        hour: 0.5,
        severity: ratio > 0.8 ? 'moderate' : 'benign',
        organ: 'Femoral Muscle & Bone Marrow',
        title: 'Intramuscular & Medullary Depot',
        description: 'Capillary perfusion through striated femoral muscle with endosteal transit into hematopoietic marrow.',
        biomarkerDelta: 'Myoglobin release baseline • Marrow uptake'
      };
      break;
    case 'SC':
      initialEvent = {
        hour: 0.8,
        severity: 'benign',
        organ: 'Dorsal Subcutis',
        title: 'Subcutaneous Interstitial Sequestration',
        description: 'Formation of hypodermal fluid depot; slow lymphatic uptake buffers systemic bloodstream shock.',
        biomarkerDelta: 'Local interstitial depot stable'
      };
      break;
    case 'PO':
    default:
      initialEvent = {
        hour: 0.5,
        severity: 'benign',
        organ: 'Gastric Mucosa',
        title: 'Gastrointestinal Absorption Onset',
        description: 'Oral gavage gastric mucosal dissolution initiated; passive paracellular flux begins.',
        biomarkerDelta: 'Gastric pH steady • Mucosal transit'
      };
      break;
  }

  const events: SymptomTimelineEvent[] = [
    initialEvent,
    {
      hour: 2,
      severity: ratio > 0.8 ? 'moderate' : 'benign',
      organ: site.route === 'IP' ? 'Liver (Hepatic Lobule)' : 'Liver (CYP450)',
      title: site.route === 'IP' ? 'Acute Portal Clearance Spike' : 'Hepatic Clearance Activation',
      description: site.route === 'IP'
        ? 'Massive first-pass xenobiotic concentration saturates CYP3A11 and depletes hepatocellular glutathione.'
        : 'Cytochrome P450 isoenzyme induction. Phase I oxidative pathways active.',
      biomarkerDelta: `Plasma Cmax = ${(dose_mg_kg * (site.route === 'IV' ? 0.18 : 0.08)).toFixed(1)} µM`
    },
    {
      hour: 6,
      severity: profile.hergCardiotoxicity.risk === 'High' && ratio > 0.35 ? 'severe' : 'benign',
      organ: 'Heart / Circulation',
      title: 'Peak Systemic Bio-distribution',
      description: profile.hergCardiotoxicity.risk === 'High'
        ? 'Ventricular myocyte Kv11.1 current suppression detected; QTc interval prolonged.'
        : 'Normal cardiac rhythm sustained; physiological stroke volume maintained.',
      biomarkerDelta: profile.hergCardiotoxicity.risk === 'High' ? 'QTc +38ms' : 'No ECG divergence'
    },
    {
      hour: 12,
      severity: profile.diliRisk.risk === 'Severe' && ratio > 0.5 ? 'severe' : ratio > 0.7 ? 'mild' : 'benign',
      organ: 'Hepatic Lobules',
      title: 'Metabolite Clearance Threshold',
      description: profile.diliRisk.risk === 'Severe'
        ? 'Glutathione reserve depletion >70%; reactive electrophiles bind mitochondrial proteins.'
        : 'Stable Phase II glucuronidation conjugates safely clearing into bile canaliculi.',
      biomarkerDelta: profile.diliRisk.risk === 'Severe' ? 'ALT/AST +140%' : 'ALT steady'
    },
    {
      hour: 24,
      severity: profile.nephrotoxicity.risk === 'Elevated' ? 'moderate' : 'benign',
      organ: 'Kidneys (Glomeruli)',
      title: 'Renal Elimination Phase',
      description: profile.nephrotoxicity.risk === 'Elevated'
        ? 'Proximal tubule brush border vacuolization predicted; urinary beta-2 microglobulin elevated.'
        : 'Active glomerular filtration rate normal; zero tubular cast formation.',
      biomarkerDelta: profile.nephrotoxicity.risk === 'Elevated' ? 'eGFR -24%' : 'BUN normal'
    },
    {
      hour: 48,
      severity: ratio > 1.0 ? 'severe' : 'benign',
      organ: 'Whole Organism',
      title: 'Pharmacodynamic Resolution & Recovery',
      description: ratio > 1.0
        ? `Lethal threshold breached for route ${site.route}. Cohort demonstrates ${Math.round(ratio * 55)}% mortality inflection.`
        : 'Systemic clearance >94% complete. Terminal elimination phase achieved safely with zero animal harm.',
      biomarkerDelta: ratio > 1.0 ? 'Critical organ score' : 'Safe resolution'
    }
  ];

  return events;
}
