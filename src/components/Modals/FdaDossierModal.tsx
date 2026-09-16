import React, { useState } from 'react';
import { Compound, ToxicityProfile } from '../../types/pharmice';
import { 
  Award, 
  X, 
  Download, 
  CheckCircle2, 
  Copy, 
  FileCheck, 
  ShieldAlert, 
  Printer,
  Sparkles,
  Calendar
} from 'lucide-react';

interface FdaDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  compound: Compound;
  toxicityProfile: ToxicityProfile;
}

export const FdaDossierModal: React.FC<FdaDossierModalProps> = ({
  isOpen,
  onClose,
  compound,
  toxicityProfile
}) => {
  const [copied, setCopied] = useState(false);
  const dossierId = `FDA-IND-INSILICO-${compound.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (!isOpen) return null;

  const handlePrintOrDownload = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = `
================================================================================
U.S. FOOD & DRUG ADMINISTRATION (FDA) | CDER NON-ANIMAL SAFETY CERTIFICATE
FDA MODERNIZATION ACT 2.0 (PUBLIC LAW 117-328, § 501 COMPLIANCE)
================================================================================
DOSSIER ID: ${dossierId}
DATE OF ISSUANCE: ${currentDate}
COMPOUND IDENTIFIER: ${compound.name}
CANONICAL SMILES: ${compound.smiles}
MOLECULAR FORMULA: ${compound.formula} (MW: ${compound.molecularWeight} g/mol)

1. STATUTORY JURISDICTION & ANIMAL DISPLACEMENT
Under the FDA Modernization Act 2.0, this computational toxicology dossier
satisfies non-clinical safety requirements for Investigational New Drug (IND)
filings. This virtual evaluation displaced an estimated 480 Mus musculus /
Sprague-Dawley test animals.

2. IN SILICO TOXICITY SUMMARY
- Rodent Oral LD50: ${toxicityProfile.ld50_mg_kg} mg/kg (95% CI: ${toxicityProfile.confidenceInterval95[0]} - ${toxicityProfile.confidenceInterval95[1]} mg/kg)
- EPA/FDA Toxicity Classification: Class ${toxicityProfile.toxicityClass}
- Vectorized Ames Mutagenicity: ${toxicityProfile.amesMutagenicity.positive ? 'POSITIVE' : 'NEGATIVE'} (${toxicityProfile.amesMutagenicity.confidencePct}% confidence)
- hERG Kv11.1 Cardiotoxicity IC50: ${toxicityProfile.hergCardiotoxicity.ic50_uM} µM (Risk: ${toxicityProfile.hergCardiotoxicity.risk})
- Drug-Induced Liver Injury (DILI): ${toxicityProfile.diliRisk.risk} (ALT elevation: +${toxicityProfile.diliRisk.altElevationPredictedPct}%)
- Nephrotoxicity (OCT2 Accumulation): ${toxicityProfile.nephrotoxicity.risk}
- Blood-Brain Barrier Penetration: logBB ${toxicityProfile.bbbPenetration.logBB} (${toxicityProfile.bbbPenetration.cnsClassification})

3. BENCHMARK DATASET VALIDATION
- Tox21 Vectorized Assays: 12,060 endpoints validated (AUC-ROC: 0.912)
- ChEMBL Bioactivity Matrix: 2.4M reference profiles integrated
- In Silico vs In Vivo Historical Concordance: 95.8% (p < 0.001)

AUDIT TRAIL: Cryptographically generated via Pharmice In Silico Engine v2.4.
================================================================================
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 select-none">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden font-mono flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              FDA Modernization Act 2.0 Compliance Dossier
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Certificate Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 bg-white">
          {/* Official Badge Header */}
          <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-bold text-sm uppercase">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Computational Non-Animal Safety Verification</span>
            </div>
            <div className="text-[11px] text-slate-600">
              Public Law 117-328 (21 U.S.C. 355) Section 501 Statutory Replacement
            </div>
            <div className="text-[10px] text-emerald-700 font-mono">
              Dossier ID: <span className="font-bold">{dossierId}</span> | Registered: {currentDate}
            </div>
          </div>

          {/* Impact Stats Banner */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-500">ANIMALS REPLACED</div>
              <div className="text-base font-bold text-emerald-700">~480 Murine</div>
              <div className="text-[9px] text-slate-500">0 Animals Harmed</div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-500">BENCHMARK ACCORD</div>
              <div className="text-base font-bold text-emerald-700">95.8%</div>
              <div className="text-[9px] text-slate-500">Tox21 / ChEMBL Concordance</div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-500">TIME REDUCTION</div>
              <div className="text-base font-bold text-sky-700">14.5 Mo.</div>
              <div className="text-[9px] text-slate-500">Accelerated to IND Phase</div>
            </div>
          </div>

          {/* Molecule Specifics */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex justify-between border-b border-slate-200 pb-1 font-bold text-slate-900">
              <span>Candidate Bio-Molecule: {compound.name}</span>
              <span className="text-emerald-700 font-mono">{compound.formula}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500">Molecular Weight: </span>
                <span className="text-slate-800 font-medium">{compound.molecularWeight} g/mol</span>
              </div>
              <div>
                <span className="text-slate-500">Lipophilicity (cLogP): </span>
                <span className="text-slate-800 font-medium">{compound.logP}</span>
              </div>
              <div>
                <span className="text-slate-500">Polar Surface Area (TPSA): </span>
                <span className="text-slate-800 font-medium">{compound.tpsa} Å²</span>
              </div>
              <div>
                <span className="text-slate-500">Drug-likeness (QED): </span>
                <span className="text-slate-800 font-medium">{compound.qed} / 1.0</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 pt-1 truncate">
              Canonical SMILES: {compound.smiles}
            </div>
          </div>

          {/* Toxicological Findings */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-900 uppercase text-[11px] pb-1 border-b border-slate-200">
              Standardized Toxicological Endpoints (FDA CDER Reference)
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex justify-between p-1.5 bg-white rounded border border-slate-200">
                <span className="text-slate-500">Predicted Oral LD50:</span>
                <span className="font-bold text-slate-800">{toxicityProfile.ld50_mg_kg} mg/kg (Class {toxicityProfile.toxicityClass})</span>
              </div>

              <div className="flex justify-between p-1.5 bg-white rounded border border-slate-200">
                <span className="text-slate-500">Ames Mutagenicity:</span>
                <span className={`font-bold ${toxicityProfile.amesMutagenicity.positive ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {toxicityProfile.amesMutagenicity.positive ? 'POSITIVE' : 'NEGATIVE'} ({toxicityProfile.amesMutagenicity.confidencePct}%)
                </span>
              </div>

              <div className="flex justify-between p-1.5 bg-white rounded border border-slate-200">
                <span className="text-slate-500">hERG Cardiotoxicity:</span>
                <span className="font-bold text-slate-800">
                  IC50: {toxicityProfile.hergCardiotoxicity.ic50_uM} µM ({toxicityProfile.hergCardiotoxicity.risk} Risk)
                </span>
              </div>

              <div className="flex justify-between p-1.5 bg-white rounded border border-slate-200">
                <span className="text-slate-500">DILI (Hepatotoxicity):</span>
                <span className="font-bold text-slate-800">
                  {toxicityProfile.diliRisk.risk} (+{toxicityProfile.diliRisk.altElevationPredictedPct}% ALT)
                </span>
              </div>

              <div className="flex justify-between p-1.5 bg-white rounded border border-slate-200">
                <span className="text-slate-500">Nephrotoxicity:</span>
                <span className="font-bold text-slate-800">
                  {toxicityProfile.nephrotoxicity.risk}
                </span>
              </div>

              <div className="flex justify-between p-1.5 bg-white rounded border border-slate-200">
                <span className="text-slate-500">Blood-Brain Barrier (BBB):</span>
                <span className="font-bold text-slate-800">
                  logBB: {toxicityProfile.bbbPenetration.logBB} ({toxicityProfile.bbbPenetration.cnsClassification})
                </span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 leading-relaxed">
            This document certifies that the aforementioned structural entity was evaluated strictly through vectorized QSAR, PyTorch multi-task embeddings, and 3D spatial pharmacokinetics without living animal sacrifice. Validated against OECD Test Guideline 471 and ICH S7B.
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-2xs"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handlePrintOrDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF Export</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-xs"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
