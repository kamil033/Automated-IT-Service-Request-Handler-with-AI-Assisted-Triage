import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  HelpCircle,
  Layers,
  Cpu,
  Workflow
} from 'lucide-react';
import { AITriageResult, IncidentRecord } from '../types';

interface AITriageViewProps {
  onInsertIncident: (incident: IncidentRecord) => void;
  geminiConnected: boolean;
}

const SAMPLE_PROMPTS = [
  {
    title: 'Phishing / Ransomware Threat',
    shortDescription: 'Received spoofed CEO email with macro-enabled Excel attachment',
    description: 'Endpoint security pop-up blocked suspicious PowerShell script trying to read memory keys.',
    caller: 'Jessica Pearson',
  },
  {
    title: 'Data Center BGP Flap Outage',
    shortDescription: 'Core router interface flapping every 4 minutes causing packet drop',
    description: 'BGP sessions resetting between Dallas and Frankfurt gateways. International branch offices affected.',
    caller: 'David Loo (VIP)',
  },
  {
    title: 'Hardware Thermal Hazard',
    shortDescription: 'Laptop charging brick sparking and laptop chassis burning hot',
    description: 'Developer unplugged workstation immediately after noticing smoke and melted plastic near power port.',
    caller: 'Kenji Sato',
  },
  {
    title: 'Database Connection Pool Exhaustion',
    shortDescription: 'PostgreSQL RDS cluster returning fatal: remaining connection slots are reserved',
    description: 'E-commerce checkout service throwing HTTP 500 error for all customers.',
    caller: 'DevOps Lead',
  },
  {
    title: 'Standard Slack Enterprise Channel Access',
    shortDescription: 'Requesting permission to join private #m-and-a-deal-room Slack channel',
    description: 'Project manager joining audit committee requires channel access approved by legal.',
    caller: 'Marcus Vance',
  },
];

export const AITriageView: React.FC<AITriageViewProps> = ({ onInsertIncident, geminiConnected }) => {
  const [caller, setCaller] = useState('David Loo');
  const [shortDescription, setShortDescription] = useState(
    'Global VPN connection drops immediately upon login'
  );
  const [description, setDescription] = useState(
    'Multiple users across Singapore branch cannot connect to Cisco AnyConnect firewall. Error: Gateway timeout 504.'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<AITriageResult | null>(null);
  const [createdIncidentNumber, setCreatedIncidentNumber] = useState<string | null>(null);

  const handleRunTriage = async () => {
    if (!shortDescription.trim()) return;
    setIsLoading(true);
    setCreatedIncidentNumber(null);

    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shortDescription,
          description,
          caller,
        }),
      });
      const data: AITriageResult = await res.json();
      setTriageResult(data);
    } catch (err) {
      console.error('Triage failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateIncidentFromTriage = () => {
    if (!triageResult) return;

    const newIncNumber = `INC00${Math.floor(10070 + Math.random() * 800)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const slaHours = triageResult.priority === 1 ? 4 : triageResult.priority === 2 ? 8 : 24;

    const newInc: IncidentRecord = {
      sys_id: `sys_inc_${Date.now()}`,
      number: newIncNumber,
      short_description: shortDescription,
      description: description,
      caller_name: caller,
      caller_email: `${caller.toLowerCase().replace(/\s+/g, '.')}@corp.com`,
      caller_vip: caller.includes('VIP'),
      category: triageResult.category,
      subcategory: triageResult.subcategory,
      urgency: triageResult.urgency,
      impact: triageResult.impact,
      priority: triageResult.priority,
      state: 'New',
      assignment_group: triageResult.assignmentGroup,
      assigned_to: 'Unassigned',
      opened_at: nowStr,
      sla_hours_target: slaHours,
      sla_elapsed_hours: 0,
      sla_breached: false,
      ai_triage: triageResult,
      work_notes: [
        {
          id: `wn_${Date.now()}`,
          timestamp: nowStr,
          author: 'Now Assist AI Agent',
          authorRole: 'ai',
          note: `Agentic triage processed ticket. Category: [${triageResult.category}], Priority: [P${triageResult.priority}], Target Group: [${triageResult.assignmentGroup}]. Action: ${triageResult.autoAction}`,
          type: 'ai',
        },
      ],
    };

    onInsertIncident(newInc);
    setCreatedIncidentNumber(newIncNumber);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/30">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-100">
                Now Assist Agentic Triage & Classifier
              </h1>
              <span className="text-[10px] font-mono font-bold bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800">
                sn_now_assist
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Natural Language IT Request Classifier powered by{' '}
              <span className="text-purple-300 font-semibold">
                {geminiConnected ? 'Google Gemini 3.8 Flash' : 'ServiceNow Rule Matrix'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-md">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Real-Time Triage Engine Active</span>
        </div>
      </div>

      {/* Main Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Input & Test Scenarios (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Input Request Payload</span>
            </h2>

            {/* Quick Scenario Fill */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Load Representative Test Scenario:
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {SAMPLE_PROMPTS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setShortDescription(sample.shortDescription);
                      setDescription(sample.description);
                      setCaller(sample.caller);
                      setTriageResult(null);
                      setCreatedIncidentNumber(null);
                    }}
                    className="text-left px-3 py-2 rounded border border-slate-800 bg-slate-950/70 hover:bg-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span className="font-medium text-slate-200">{sample.title}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>

            {/* Caller */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Requester / Caller
              </label>
              <input
                type="text"
                value={caller}
                onChange={(e) => setCaller(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Short Description
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Detailed Description */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Detailed Symptoms & Logs
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            {/* Run Button */}
            <button
              onClick={handleRunTriage}
              disabled={isLoading || !shortDescription}
              className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs py-2.5 rounded-md shadow-sm transition-all cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{isLoading ? 'Now Assist Agent Analyzing...' : 'Execute AI Triage Analysis'}</span>
            </button>
          </div>
        </div>

        {/* Right: Triage Decision & Agentic Reasoning (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          {triageResult ? (
            <div className="bg-slate-900 border border-purple-500/40 rounded-lg p-5 shadow-sm space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                <div className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-purple-400" />
                  <h2 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                    Agentic Triage Decision Matrix
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                  Engine: {triageResult.isAiPowered ? 'Gemini 3.8 Flash' : 'ServiceNow Rule Matrix'}
                </span>
              </div>

              {/* Top Summary Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Category</span>
                  <span className="text-xs font-bold text-slate-200 mt-0.5 block">{triageResult.category}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Priority</span>
                  <span className={`text-xs font-bold mt-0.5 block ${
                    triageResult.priority === 1 ? 'text-rose-400' : triageResult.priority === 2 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    P{triageResult.priority} ({triageResult.priority === 1 ? 'Critical' : triageResult.priority === 2 ? 'High' : 'Moderate'})
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Urgency / Impact</span>
                  <span className="text-xs font-bold text-slate-200 mt-0.5 block">
                    U{triageResult.urgency} / I{triageResult.impact}
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Confidence</span>
                  <span className="text-xs font-bold text-purple-400 mt-0.5 block">
                    {Math.round(triageResult.confidence * 100)}%
                  </span>
                </div>
              </div>

              {/* Assignment Routing Destination */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">Target Assignment Group</span>
                  <span className="text-sm font-bold text-emerald-400">{triageResult.assignmentGroup}</span>
                </div>
                <span className="text-xs bg-emerald-950 text-emerald-300 px-2.5 py-1 rounded border border-emerald-800 font-mono">
                  sys_user_group
                </span>
              </div>

              {/* Technical Reasoning */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Agentic Reasoning & Technical Assessment:
                </label>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  {triageResult.reasoning}
                </div>
              </div>

              {/* Remediation & Automated Action */}
              <div className="space-y-2 text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-cyan-400 font-semibold block text-[11px] uppercase tracking-wider">
                    Recommended Fix / KB Article:
                  </span>
                  <p className="text-slate-300 mt-1">{triageResult.suggestedFix}</p>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-emerald-400 font-semibold block text-[11px] uppercase tracking-wider">
                    Automated Action Triggered:
                  </span>
                  <p className="text-slate-300 mt-1">{triageResult.autoAction}</p>
                </div>
              </div>

              {/* Insert Incident Action */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                {createdIncidentNumber ? (
                  <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Created incident {createdIncidentNumber} in ServiceNow table!</span>
                  </div>
                ) : (
                  <button
                    onClick={handleCreateIncidentFromTriage}
                    className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded-md shadow-sm transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Commit Triaged Record to [incident] Table</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center text-slate-400 shadow-sm">
              <Bot className="w-8 h-8 mx-auto mb-3 text-purple-400/60" />
              <h3 className="text-sm font-semibold text-slate-200">
                Now Assist AI Triage Agent Standing By
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Select a test scenario on the left or type a custom request description and click{' '}
                <strong className="text-purple-300">Execute AI Triage Analysis</strong> to test the
                agentic classification engine.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
