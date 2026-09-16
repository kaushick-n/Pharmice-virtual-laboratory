import React from 'react';
import { RolloutPhase } from '../../types/pharmice';
import { 
  Database, 
  ShieldCheck, 
  Lock, 
  Globe, 
  Users, 
  Building2, 
  Cpu, 
  Layers, 
  X, 
  CheckCircle2, 
  ArrowRight,
  Server
} from 'lucide-react';

interface RolloutStrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePhase: RolloutPhase;
  onSelectPhase: (phase: RolloutPhase) => void;
}

export const RolloutStrategyModal: React.FC<RolloutStrategyModalProps> = ({
  isOpen,
  onClose,
  activePhase,
  onSelectPhase
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 select-none">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden font-mono">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Sequenced Market & Rollout Architecture (FDA Modernization Act 2.0)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5">
          <p className="text-xs text-slate-600 leading-relaxed">
            Pharmice operates on a bifurcated market adoption pipeline, advancing computational toxicology from public academic benchmarks to multi-tenant encrypted biopharma federated learning:
          </p>

          {/* Phase 1 vs Phase 2 Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PHASE 1 CARD */}
            <div
              onClick={() => onSelectPhase('phase1_open')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                activePhase === 'phase1_open'
                  ? 'bg-emerald-50/60 border-emerald-500 shadow-sm ring-1 ring-emerald-500/50'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-800 uppercase">
                    PHASE 1 (Current Scope)
                  </span>
                </div>
                {activePhase === 'phase1_open' ? (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                    ACTIVE ENVIRONMENT
                  </span>
                ) : (
                  <button className="text-[10px] text-slate-500 hover:text-slate-900">
                    Switch
                  </button>
                )}
              </div>

              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Public Data Engine (Tox21, ChEMBL)
              </h3>
              <p className="text-[11px] text-slate-500 mb-3">
                Open Access for Academia, Students & Early Biotechs
              </p>

              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>12,060 vectorized Tox21 assay endpoints for Ames mutagenicity & nuclear receptors.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>2.4M ChEMBL compound bioactivities for target binding & hERG cross-reactivity.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>1.42M PubChem structural embeddings indexable via HNSW cosine similarity.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Unrestricted zero-cost access establishing reproducible benchmark validation.</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500">
                <span>License: Open Science CC-BY</span>
                <span className="text-emerald-700 font-bold">Status: Production Ready</span>
              </div>
            </div>

            {/* PHASE 2 CARD */}
            <div
              onClick={() => onSelectPhase('phase2_enterprise')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                activePhase === 'phase2_enterprise'
                  ? 'bg-blue-50/60 border-blue-500 shadow-sm ring-1 ring-blue-500/50'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-blue-800 uppercase">
                    PHASE 2 (Future Roadmap)
                  </span>
                </div>
                {activePhase === 'phase2_enterprise' ? (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold border border-blue-300">
                    ACTIVE ENVIRONMENT
                  </span>
                ) : (
                  <button className="text-[10px] text-slate-500 hover:text-slate-900">
                    Switch
                  </button>
                )}
              </div>

              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Gated Enterprise & Institutional IP
              </h3>
              <p className="text-[11px] text-slate-500 mb-3">
                Proprietary Partner Lab Integration & Federated Learning
              </p>

              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <Lock className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                  <span>Encrypted multi-tenant vector storage (Qdrant Enclave) protecting proprietary leads.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Cpu className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                  <span>Federated gradient updates allow training on secret pharma wet-lab data without exposing molecules.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                  <span>Enterprise Role-Based Access Control (RBAC) and cryptographically sealed audit trails.</span>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                  <span>Automated 21 CFR Part 11 electronic signature compliance for FDA IND submissions.</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500">
                <span>Governance: Zero-Trust Enclave</span>
                <span className="text-blue-700 font-bold">Roadmap: Phase 2 Pilot</span>
              </div>
            </div>
          </div>

          {/* System Architecture Diagram */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Pipeline Transition Matrix:</span>
            <div className="flex items-center justify-center gap-3 mt-2 text-slate-800 flex-wrap">
              <span className="px-2.5 py-1 rounded bg-white border border-slate-200 font-medium">
                Public Tox21 / ChEMBL Vectors
              </span>
              <ArrowRight className="w-4 h-4 text-emerald-600" />
              <span className="px-2.5 py-1 rounded bg-white border border-slate-200 font-medium">
                Baseline In Silico Benchmark Models
              </span>
              <ArrowRight className="w-4 h-4 text-blue-600" />
              <span className="px-2.5 py-1 rounded bg-white border border-slate-200 font-medium">
                Federated Partner Lab Fine-Tuning
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-4 py-2.5 bg-slate-50 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-xs"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
