import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Compound, 
  LayerVisibility, 
  RaycastHitData, 
  AnatomicalLandmark,
  RolloutPhase,
  ToxicityProfile
} from './types/pharmice';
import { 
  INITIAL_COMPOUNDS, 
  ANATOMICAL_LANDMARKS, 
  computeToxicityProfile 
} from './data/compounds';
import { RodentAnatomyCanvas } from './components/Anatomy3D/RodentAnatomyCanvas';
import { ChemicalLab } from './components/ChemicalLab/ChemicalLab';
import { ToxicityTelemetry } from './components/PredictiveAI/ToxicityTelemetry';
import { RolloutStrategyModal } from './components/Modals/RolloutStrategyModal';
import { FdaDossierModal } from './components/Modals/FdaDossierModal';
import { 
  Dna, 
  Layers, 
  Activity, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp,
  Sparkles, 
  Award,
  Globe,
  Sliders,
  Maximize2,
  FlaskConical,
  Eye,
  Columns2,
  Play,
  Loader2,
  Syringe,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function App() {
  // State: Current Compound
  const [compounds, setCompounds] = useState<Compound[]>(INITIAL_COMPOUNDS);
  const [selectedCompoundId, setSelectedCompoundId] = useState<string>('pmc-408');

  // Selected compound object
  const currentCompound = useMemo(() => {
    return compounds.find((c) => c.id === selectedCompoundId) || compounds[0];
  }, [compounds, selectedCompoundId]);

  // Selected Anatomical Landmark and Raycasting Hit (Pending Injection Target)
  const [selectedRaycastHit, setSelectedRaycastHit] = useState<RaycastHitData | null>({
    point: ANATOMICAL_LANDMARKS[0].coords3D,
    landmark: ANATOMICAL_LANDMARKS[0],
    distanceToBBB_mm: 0.0,
    distanceToLiver_mm: 36.2,
    estimatedLocalConc_uM: 3.4,
    exposureRatio: 0.8
  });

  // Simulated Landmark (The landmark for which current toxicity profile was actually calculated)
  const [simulatedLandmark, setSimulatedLandmark] = useState<AnatomicalLandmark | null>(ANATOMICAL_LANDMARKS[0]);

  // Simulation execution state
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simNotification, setSimNotification] = useState<string | null>(null);
  const [simTestDose, setSimTestDose] = useState<number>(100);

  // Dynamic Toxicological Profile (Updated on "Run" or compound change)
  const [toxicityProfile, setToxicityProfile] = useState<ToxicityProfile>(() => {
    return computeToxicityProfile(INITIAL_COMPOUNDS[0], ANATOMICAL_LANDMARKS[0]);
  });

  // Check if current 3D targeted site differs from simulated locus
  const isStale = useMemo(() => {
    if (!selectedRaycastHit?.landmark || !simulatedLandmark) return false;
    return selectedRaycastHit.landmark.id !== simulatedLandmark.id;
  }, [selectedRaycastHit, simulatedLandmark]);

  // Handle running the in-silico simulation
  const handleRunSimulation = useCallback(() => {
    const target = selectedRaycastHit?.landmark || simulatedLandmark || ANATOMICAL_LANDMARKS[0];
    setIsSimulating(true);

    // Realistic computation latency for PBPK multi-compartment solver
    setTimeout(() => {
      const nextProfile = computeToxicityProfile(currentCompound, target);
      setToxicityProfile(nextProfile);
      setSimulatedLandmark(target);
      setIsSimulating(false);

      const routeName = target.injectionRoute || 'IV';
      const organName = target.organ || target.name;
      setSimNotification(`Simulated in-silico injection at ${organName} (${routeName}): LD50 adjusted to ${nextProfile.routeAdjustedLd50 || nextProfile.ld50_mg_kg} mg/kg (Class ${nextProfile.toxicityClass})`);
      setTimeout(() => setSimNotification(null), 5000);
    }, 350);
  }, [currentCompound, selectedRaycastHit, simulatedLandmark]);

  // Auto-recalculate if compound chemical structure changes
  useEffect(() => {
    const target = simulatedLandmark || selectedRaycastHit?.landmark || ANATOMICAL_LANDMARKS[0];
    setToxicityProfile(computeToxicityProfile(currentCompound, target));
  }, [currentCompound]);

  // 3D Canvas Layer Visibilities
  const [layers, setLayers] = useState<LayerVisibility>({
    bodySilhouette: true,
    skeletal: true,
    vascular: true,
    nervous: true,
    visceral: true,
    collisionMeshes: true,
    drugParticles: true
  });

  const handleToggleLayer = (layerKey: keyof LayerVisibility) => {
    setLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  // Simulation Timeline State (0h -> 72h)
  const [simulationTimeHours, setSimulationTimeHours] = useState<number>(6);

  // Layout View Switcher: Dedicated 3D, Chem, Workstation, or Toxicology Engine
  const [layoutMode, setLayoutMode] = useState<'split' | 'anatomy_focus' | 'chemistry_focus' | 'toxicology_engine'>('split');

  // Quick peek drawer for toxicology telemetry when in 3D or Chem Lab
  const [isTelemetryDrawerOpen, setIsTelemetryDrawerOpen] = useState(false);

  // Market & Rollout Phase State
  const [activePhase, setActivePhase] = useState<RolloutPhase>('phase1_open');
  const [isRolloutModalOpen, setIsRolloutModalOpen] = useState(false);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);

  // Compound Updates from Pro Synthesis or Vibecoding Mode
  const handleUpdateCompound = (updatedCompound: Compound) => {
    setCompounds((prev) => {
      const idx = prev.findIndex((c) => c.id === updatedCompound.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = updatedCompound;
        return next;
      }
      return [updatedCompound, ...prev];
    });
    setSelectedCompoundId(updatedCompound.id);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#f8fafc] text-slate-800 overflow-hidden font-mono selection:bg-emerald-500 selection:text-white">
      {/* Minimalist Laboratory Navigation Header */}
      <header className="flex items-center justify-between px-3 py-2 bg-white/95 border-b border-slate-200 z-20 shrink-0 select-none backdrop-blur-md shadow-xs">
        {/* Brand & Regulatory Accreditation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600">
              <Dna className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs font-bold tracking-wider text-slate-900 uppercase">
                  PHARMICE <span className="text-emerald-600 font-normal">(IN SILICO)</span>
                </h1>
              </div>
              <p className="text-[10px] text-slate-500 hidden lg:block">
                Virtual Murine Biology & Toxicological Raycasting Platform
              </p>
            </div>
          </div>
        </div>

        {/* Center: Molecule Selector & Primary Workspace Navigation */}
        <div className="flex items-center gap-2">
          {/* Active Molecule Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase hidden sm:inline">LEAD:</span>
            <select
              value={selectedCompoundId}
              onChange={(e) => setSelectedCompoundId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-sky-700 outline-none cursor-pointer max-w-[140px] sm:max-w-none truncate"
            >
              {compounds.map((c) => (
                <option key={c.id} value={c.id} className="bg-white text-slate-800">
                  {c.name} ({c.formula})
                </option>
              ))}
            </select>
          </div>

          {/* Minimalist Segmented Workspace Tabs */}
          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setLayoutMode('split')}
              title="Side-by-side 50/50 Dual Workstation"
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-all ${
                layoutMode === 'split' 
                  ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200/80' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">50/50 SPLIT</span>
            </button>

            <button
              onClick={() => setLayoutMode('anatomy_focus')}
              title="Full 3D Rodent Anatomy Targeting"
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-all ${
                layoutMode === 'anatomy_focus' 
                  ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200/80' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">3D ANATOMY</span>
            </button>

            <button
              onClick={() => setLayoutMode('chemistry_focus')}
              title="Full Chemical Synthesis & NLP Vibecoding"
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-all ${
                layoutMode === 'chemistry_focus' 
                  ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200/80' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CHEM LAB</span>
            </button>

            <button
              onClick={() => setLayoutMode('toxicology_engine')}
              title="Dedicated Full-Screen AI Toxicology Workspace"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all ${
                layoutMode === 'toxicology_engine' 
                  ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200/80' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline font-semibold">TOXICOLOGY ENGINE</span>
              <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                layoutMode === 'toxicology_engine' ? 'bg-rose-100 text-rose-700 font-bold' : 'bg-rose-50 text-rose-600'
              }`}>
                {toxicityProfile.toxicityClass}
              </span>
            </button>
          </div>

          {/* DEDICATED RUN IN-SILICO TRIAL ACTION BUTTON */}
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            title={
              isStale
                ? `Injection site changed to ${selectedRaycastHit?.landmark.organ} (${selectedRaycastHit?.landmark.injectionRoute})! Click to Run.`
                : `Re-run In-Silico trial at ${simulatedLandmark?.organ || 'Systemic'} (${simulatedLandmark?.injectionRoute || 'IV'})`
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shadow-xs active:scale-95 ${
              isSimulating
                ? 'bg-slate-100 text-slate-400 cursor-wait border border-slate-300'
                : isStale
                ? 'bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 text-white ring-2 ring-emerald-500/60 shadow-md shadow-emerald-500/20 animate-pulse hover:brightness-105'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-600'
            }`}
          >
            {isSimulating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>COMPUTING...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>RUN</span>
                <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-white/20 hidden md:inline">
                  {selectedRaycastHit?.landmark ? `${selectedRaycastHit.landmark.organ} (${selectedRaycastHit.landmark.injectionRoute || 'IV'})` : 'IV'}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Right: Rollout Strategy & Regulatory Action */}
        <div className="flex items-center gap-1.5">
          {/* Phase 1 vs Phase 2 Market Trigger */}
          <button
            onClick={() => setIsRolloutModalOpen(true)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs border transition-all ${
              activePhase === 'phase1_open'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                : 'bg-sky-50 border-sky-300 text-sky-700 hover:bg-sky-100'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="font-semibold hidden xl:inline">
              {activePhase === 'phase1_open' ? 'PHASE 1: OPEN ACADEMIC' : 'PHASE 2: GATED ENTERPRISE'}
            </span>
          </button>

          {/* FDA Compliance Dossier Button */}
          <button
            onClick={() => setIsDossierModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
          >
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">FDA Dossier</span>
          </button>
        </div>
      </header>

      {/* Dynamic Simulation Notification Banner */}
      {simNotification && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-3 py-1.5 text-xs text-emerald-900 flex items-center justify-between z-30 transition-all shadow-xs animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-mono">{simNotification}</span>
          </div>
          <button
            onClick={() => setSimNotification(null)}
            className="text-slate-500 hover:text-slate-900 text-xs font-mono px-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Workstation Body */}
      <main className="relative flex-1 flex flex-col min-h-0 overflow-hidden bg-[#f8fafc]">
        {/* MODE A: Dedicated Full-Screen Toxicology Engine */}
        {layoutMode === 'toxicology_engine' ? (
          <div className="flex-1 w-full h-full min-h-0 overflow-hidden">
            <ToxicityTelemetry
              currentCompound={currentCompound}
              toxicityProfile={toxicityProfile}
              selectedRaycastHit={selectedRaycastHit}
              simulationTimeHours={simulationTimeHours}
              onTimeChange={setSimulationTimeHours}
              onOpenDossier={() => setIsDossierModalOpen(true)}
              isFullWorkspace={true}
              onRunSimulation={handleRunSimulation}
              isSimulating={isSimulating}
              isStale={isStale}
              testDose={simTestDose}
              onDoseChange={setSimTestDose}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
            {/* Split / Focused Workstation Viewport */}
            <div className="flex-1 flex min-h-0 overflow-hidden relative">
              {/* 3D Anatomical Targeting System */}
              {(layoutMode === 'split' || layoutMode === 'anatomy_focus') && (
                <div className={`h-full ${layoutMode === 'split' ? 'w-1/2' : 'w-full'} min-w-0 flex flex-col transition-all`}>
                  <RodentAnatomyCanvas
                    currentCompound={currentCompound}
                    selectedLandmark={selectedRaycastHit?.landmark || null}
                    onSelectLandmark={setSelectedRaycastHit}
                    layers={layers}
                    onToggleLayer={handleToggleLayer}
                    simulationTimeHours={simulationTimeHours}
                    simulatedLandmark={simulatedLandmark}
                    onRunSimulation={handleRunSimulation}
                    isSimulating={isSimulating}
                    isStale={isStale}
                  />
                </div>
              )}

              {/* Chemical Laboratory */}
              {(layoutMode === 'split' || layoutMode === 'chemistry_focus') && (
                <div className={`h-full ${layoutMode === 'split' ? 'w-1/2' : 'w-full'} min-w-0 flex flex-col transition-all`}>
                  <ChemicalLab
                    currentCompound={currentCompound}
                    onUpdateCompound={handleUpdateCompound}
                    toxicityProfile={toxicityProfile}
                  />
                </div>
              )}

              {/* Slide-Up Drawer for Quick Toxicology Peek without leaving current screen */}
              {isTelemetryDrawerOpen && (
                <div className="absolute bottom-2 left-2 right-2 sm:left-6 sm:right-6 h-96 z-30 rounded-t-2xl overflow-hidden shadow-2xl border border-slate-300 bg-white/98 backdrop-blur-2xl transition-all animate-in slide-in-from-bottom-4">
                  <ToxicityTelemetry
                    currentCompound={currentCompound}
                    toxicityProfile={toxicityProfile}
                    selectedRaycastHit={selectedRaycastHit}
                    simulationTimeHours={simulationTimeHours}
                    onTimeChange={setSimulationTimeHours}
                    onOpenDossier={() => setIsDossierModalOpen(true)}
                    onClose={() => setIsTelemetryDrawerOpen(false)}
                    onMaximize={() => {
                      setIsTelemetryDrawerOpen(false);
                      setLayoutMode('toxicology_engine');
                    }}
                    isFullWorkspace={false}
                    onRunSimulation={handleRunSimulation}
                    isSimulating={isSimulating}
                    isStale={isStale}
                    testDose={simTestDose}
                    onDoseChange={setSimTestDose}
                  />
                </div>
              )}
            </div>

            {/* Docked Minimalist Toxicology Telemetry Bottom Bar */}
            <div className="w-full bg-white border-t border-slate-200 px-3 py-1.5 flex items-center justify-between z-20 text-slate-800 shrink-0 select-none shadow-xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-mono truncate">
                  <Activity className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-slate-500 font-medium hidden sm:inline">AI Toxicology:</span>
                  <span className="font-bold text-slate-900">
                    LD50 {toxicityProfile.routeAdjustedLd50 || toxicityProfile.ld50_mg_kg} mg/kg
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold shrink-0">
                    Class {toxicityProfile.toxicityClass}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-300 hidden md:inline font-semibold shrink-0">
                    {toxicityProfile.injectionSite?.organ || 'IV'}
                  </span>
                </div>

                {isStale && (
                  <button
                    onClick={handleRunSimulation}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-mono font-bold animate-pulse hover:bg-amber-200 transition-colors shrink-0"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>Run ({selectedRaycastHit?.landmark.organ})</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsTelemetryDrawerOpen(!isTelemetryDrawerOpen)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono transition-colors border ${
                    isTelemetryDrawerOpen
                      ? 'bg-slate-200 border-slate-300 text-slate-900 font-medium'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                  }`}
                >
                  <span>{isTelemetryDrawerOpen ? 'Hide Drawer' : 'Quick Peek'}</span>
                  {isTelemetryDrawerOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                </button>

                <button
                  onClick={() => setLayoutMode('toxicology_engine')}
                  title="Open Dedicated Full Workspace"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-xs font-mono text-emerald-800 transition-colors border border-emerald-300 font-semibold"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Full Engine</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <RolloutStrategyModal
        isOpen={isRolloutModalOpen}
        onClose={() => setIsRolloutModalOpen(false)}
        activePhase={activePhase}
        onSelectPhase={(p) => setActivePhase(p)}
      />

      <FdaDossierModal
        isOpen={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
        compound={currentCompound}
        toxicityProfile={toxicityProfile}
      />
    </div>
  );
}
