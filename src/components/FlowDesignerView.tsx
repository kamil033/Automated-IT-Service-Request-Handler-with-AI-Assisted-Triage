import React, { useState } from 'react';
import { 
  Play, 
  Workflow, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  ArrowDown, 
  Layers, 
  Bot, 
  AlertTriangle, 
  Mail, 
  ShieldCheck, 
  Cpu, 
  ChevronRight, 
  Eye, 
  Terminal,
  FileSpreadsheet
} from 'lucide-react';
import { FlowStep, IncidentRecord, FlowExecutionRecord } from '../types';
import { FLOW_STEPS } from '../data/mockData';

interface FlowDesignerViewProps {
  incidents: IncidentRecord[];
}

export const FlowDesignerView: React.FC<FlowDesignerViewProps> = ({ incidents }) => {
  const [selectedStep, setSelectedStep] = useState<FlowStep>(FLOW_STEPS[1]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidents[0]?.sys_id || '');
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [testExecutionResult, setTestExecutionResult] = useState<FlowExecutionRecord | null>(null);

  const handleRunFlowTest = () => {
    const targetInc = incidents.find((i) => i.sys_id === selectedIncidentId) || incidents[0];
    if (!targetInc) return;

    setIsRunningTest(true);
    setActiveStepIndex(0);
    setTestExecutionResult(null);

    // Simulate step-by-step animated execution
    const totalSteps = FLOW_STEPS.length;
    let currentIdx = 0;

    const interval = setInterval(() => {
      currentIdx++;
      if (currentIdx < totalSteps) {
        setActiveStepIndex(currentIdx);
      } else {
        clearInterval(interval);
        setIsRunningTest(false);
        setActiveStepIndex(-1);

        // Generate execution context record
        const execRecord: FlowExecutionRecord = {
          id: `ctx_${Date.now().toString().slice(-6)}`,
          incidentNumber: targetInc.number,
          startedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          durationMs: 342,
          status: 'SUCCESS',
          stepsExecuted: FLOW_STEPS.map((step) => ({
            stepId: step.id,
            stepTitle: step.title,
            status: 'SUCCESS',
            durationMs: Math.floor(15 + Math.random() * 45),
            inputSummary: `Incident [${targetInc.number}] category=[${targetInc.category}] caller=[${targetInc.caller_name}]`,
            outputSummary: `Evaluated priority [P${targetInc.priority}], target group [${targetInc.assignment_group}], SLA [${targetInc.sla_hours_target}h]`,
          })),
        };
        setTestExecutionResult(execRecord);
      }
    }, 400);
  };

  const getStepIcon = (type: FlowStep['type']) => {
    switch (type) {
      case 'trigger':
        return Layers;
      case 'ai_action':
        return Bot;
      case 'decision':
        return Cpu;
      case 'assignment':
        return CheckCircle2;
      case 'sla':
        return Clock;
      case 'notification':
        return Mail;
      default:
        return Workflow;
    }
  };

  return (
    <div className="space-y-5">
      {/* Flow Designer Top Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-md border border-cyan-500/30">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-slate-100">
                  Automated Incident & Request Triage Flow
                </h1>
                <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
                  sys_hub_flow
                </span>
                <span className="text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                  Published
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Scope: <code className="text-slate-300">sn_it_triage</code> | Trigger Table: <code className="text-slate-300">incident</code>
              </p>
            </div>
          </div>
        </div>

        {/* Test Simulator Controls */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-700 px-2.5 py-1.5 rounded-md text-xs">
            <span className="text-slate-400">Test Record:</span>
            <select
              value={selectedIncidentId}
              onChange={(e) => setSelectedIncidentId(e.target.value)}
              className="bg-transparent text-slate-200 font-mono font-semibold focus:outline-none cursor-pointer"
            >
              {incidents.map((inc) => (
                <option key={inc.sys_id} value={inc.sys_id} className="bg-slate-900 text-slate-200">
                  {inc.number} - {inc.category} (P{inc.priority})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRunFlowTest}
            disabled={isRunningTest}
            className="flex items-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 active:scale-95 text-white font-semibold text-xs px-3.5 py-2 rounded-md shadow-sm transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{isRunningTest ? 'Executing Flow...' : 'Test Flow'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Flow Canvas on Left + Step Details/Execution Trace on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Visual Flow Canvas (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Visual Flow Logic Canvas</span>
              </span>
              <span className="text-[11px] text-slate-400">
                {FLOW_STEPS.length} sequential execution stages
              </span>
            </div>

            {/* Steps Sequence */}
            <div className="space-y-2 relative">
              {FLOW_STEPS.map((step, idx) => {
                const Icon = getStepIcon(step.type);
                const isSelected = selectedStep.id === step.id;
                const isCurrentExecution = isRunningTest && activeStepIndex === idx;

                return (
                  <React.Fragment key={step.id}>
                    <div
                      onClick={() => setSelectedStep(step)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start space-x-3 relative ${
                        isCurrentExecution
                          ? 'bg-cyan-950/80 border-cyan-400 ring-2 ring-cyan-500/40 animate-pulse'
                          : isSelected
                          ? 'bg-slate-800 border-cyan-500/70 shadow-md'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      {/* Step Number Circle */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isCurrentExecution
                            ? 'bg-cyan-500 text-slate-950'
                            : isSelected
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {step.stepNumber}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3
                            className={`text-xs font-semibold truncate ${
                              isSelected ? 'text-cyan-300' : 'text-slate-200'
                            }`}
                          >
                            {step.title}
                          </h3>
                          <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            {step.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                          {step.summary}
                        </p>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 self-center" />
                    </div>

                    {/* Connector Arrow */}
                    {idx < FLOW_STEPS.length - 1 && (
                      <div className="flex justify-center py-0.5">
                        <ArrowDown className="w-3.5 h-3.5 text-slate-700" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step Inspector & Execution Trace (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Step Inspector Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-2.5">
              <Eye className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Step Configuration Inspector
              </h2>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-100">{selectedStep.title}</span>
                <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300">
                  Step {selectedStep.stepNumber}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2 bg-slate-950 p-2.5 rounded border border-slate-800 leading-relaxed">
                {selectedStep.summary}
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Data Pill Mapping & Execution Engine
              </label>
              <div className="bg-slate-950 font-mono text-[11px] text-cyan-300 p-2.5 rounded border border-slate-800 whitespace-pre-wrap">
                {selectedStep.technicalDetails}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Execution Mode:</span>
                <span className="text-slate-300 font-mono">Asynchronous (GlideFlow)</span>
              </div>
              <div className="flex justify-between">
                <span>Execution Engine:</span>
                <span className="text-slate-300 font-mono">FlowEngineV2</span>
              </div>
              <div className="flex justify-between">
                <span>Error Handling:</span>
                <span className="text-slate-300 font-mono">Catch & Route to Tier 1 Triage</span>
              </div>
            </div>
          </div>

          {/* Test Execution Output Record */}
          {testExecutionResult && (
            <div className="bg-slate-900 border border-emerald-500/40 rounded-lg p-4 shadow-sm space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-300">
                    Flow Execution Context Record [{testExecutionResult.id}]
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  {testExecutionResult.durationMs}ms
                </span>
              </div>

              <div className="text-xs text-slate-300">
                <span>Executed against: </span>
                <strong className="text-emerald-400 font-mono">
                  {testExecutionResult.incidentNumber}
                </strong>
                <span className="text-slate-500 text-[11px] ml-2 font-mono">
                  ({testExecutionResult.startedAt})
                </span>
              </div>

              {/* Execution Steps Trace */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {testExecutionResult.stepsExecuted.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">
                        {idx + 1}. {step.stepTitle}
                      </span>
                      <span className="text-emerald-400 font-mono text-[10px]">
                        {step.durationMs}ms
                      </span>
                    </div>
                    <div className="text-slate-400 font-mono text-[10px]">
                      &gt; {step.outputSummary}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
