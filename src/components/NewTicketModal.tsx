import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  AlertCircle, 
  Clock, 
  ShieldAlert, 
  Wifi, 
  Laptop, 
  Database, 
  FileCode, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { IncidentRecord, AITriageResult, UrgencyLevel, ImpactLevel, PriorityLevel } from '../types';

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (incident: IncidentRecord) => void;
}

const PRESETS = [
  {
    icon: Wifi,
    label: 'Critical Network Outage',
    category: 'Network',
    shortDescription: 'Core Cisco Nexus switch failure in North America data center',
    description: 'BGP routing tables purged. All corporate VoIP phones and cloud gateways disconnected. Production trading floor impacted.',
    callerName: 'Sarah Jenkins (VP Trading)',
    callerEmail: 's.jenkins@trading.corp',
    vip: true,
  },
  {
    icon: ShieldAlert,
    label: 'Malware / Phishing Attack',
    category: 'Security',
    shortDescription: 'Employee downloaded payload from spoofed DHL shipping notification',
    description: 'EDR agent flagged PowerShell credential dumping attempt. User accounts locked out.',
    callerName: 'Alex Mercer',
    callerEmail: 'a.mercer@ops.corp',
    vip: false,
  },
  {
    icon: Laptop,
    label: 'Swollen Battery Safety Risk',
    category: 'Hardware',
    shortDescription: 'MacBook Pro battery visibly expanding with strong chemical smell',
    description: 'Chassis bowing outwards and trackpad cracked from battery pressure. Hardware unsafe to power on.',
    callerName: 'Kenji Sato',
    callerEmail: 'k.sato@eng.corp',
    vip: false,
  },
  {
    icon: Database,
    label: 'Cloud DB Pool Exhaustion',
    category: 'Cloud & DB',
    shortDescription: 'AWS Aurora PostgreSQL primary instance reaching 100% CPU and max connections',
    description: 'API services returning HTTP 504 Gateway Timeout. Query latency spiked above 12 seconds.',
    callerName: 'DevOps On-Call',
    callerEmail: 'devops@infra.corp',
    vip: false,
  },
  {
    icon: FileCode,
    label: 'SaaS Software Access Request',
    category: 'Software',
    shortDescription: 'Need GitHub Enterprise Organization invitation and Copilot license for new hire',
    description: 'Software engineering onboarding starting next Monday. Needs repository read/write permissions.',
    callerName: 'Beth Anglin',
    callerEmail: 'b.anglin@service.corp',
    vip: false,
  },
];

export const NewTicketModal: React.FC<NewTicketModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [callerName, setCallerName] = useState('David Loo');
  const [callerEmail, setCallerEmail] = useState('david.loo@sales.corp');
  const [isVip, setIsVip] = useState(false);
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [isTriaging, setIsTriaging] = useState(false);
  const [aiPreview, setAiPreview] = useState<AITriageResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setCallerName(preset.callerName);
    setCallerEmail(preset.callerEmail);
    setIsVip(preset.vip);
    setShortDescription(preset.shortDescription);
    setDescription(preset.description);
    setAiPreview(null);
  };

  const handleLiveTriage = async () => {
    if (!shortDescription && !description) return;
    setIsTriaging(true);
    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shortDescription,
          description,
          caller: callerName,
        }),
      });
      const data = await res.json();
      setAiPreview(data);
    } catch (err) {
      console.error('Triage failed', err);
    } finally {
      setIsTriaging(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortDescription.trim()) return;

    setIsSubmitting(true);

    let triageResult = aiPreview;
    if (!triageResult) {
      try {
        const res = await fetch('/api/triage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shortDescription,
            description,
            caller: callerName,
          }),
        });
        triageResult = await res.json();
      } catch (err) {
        console.error('Failed to get triage during submit', err);
      }
    }

    const urgency: UrgencyLevel = triageResult ? triageResult.urgency : 3;
    const impact: ImpactLevel = triageResult ? triageResult.impact : 3;
    const priority: PriorityLevel = triageResult ? triageResult.priority : 4;
    const category = triageResult ? triageResult.category : 'Inquiry / Help';
    const subcategory = triageResult ? triageResult.subcategory : 'General Intake';
    const assignmentGroup = triageResult ? triageResult.assignmentGroup : 'Service Desk Tier 1';

    // Contractual SLA calculation
    const slaHours = priority === 1 ? 4 : priority === 2 ? 8 : 24;

    const newIncidentNumber = `INC00${Math.floor(10050 + Math.random() * 900)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newIncident: IncidentRecord = {
      sys_id: `sys_inc_${Date.now()}`,
      number: newIncidentNumber,
      short_description: shortDescription,
      description: description || shortDescription,
      caller_name: callerName,
      caller_email: callerEmail,
      caller_vip: isVip,
      category,
      subcategory,
      urgency,
      impact,
      priority,
      state: 'New',
      assignment_group: assignmentGroup,
      assigned_to: 'Unassigned',
      opened_at: nowStr,
      sla_hours_target: slaHours,
      sla_elapsed_hours: 0,
      sla_breached: false,
      ai_triage: triageResult || undefined,
      work_notes: [
        {
          id: `wn_init_${Date.now()}`,
          timestamp: nowStr,
          author: 'Flow Designer System',
          authorRole: 'system',
          note: `Flow Designer triggered on record insertion. Executed AI Triage and routed to [${assignmentGroup}]. Assigned ${slaHours}-hour contractual SLA.`,
          type: 'system',
        },
        ...(triageResult
          ? [
              {
                id: `wn_ai_${Date.now()}`,
                timestamp: nowStr,
                author: 'Now Assist AI Agent',
                authorRole: 'ai',
                note: `AI Reasoning: ${triageResult.reasoning} | Confidence: ${Math.round(
                  triageResult.confidence * 100
                )}% | Suggested Action: ${triageResult.suggestedFix}`,
                type: 'ai' as const,
              },
            ]
          : []),
      ],
    };

    onSubmit(newIncident);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
              INC
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                Create IT Incident / Service Request
              </h2>
              <p className="text-xs text-slate-400">
                Submits record to table [incident] and launches Flow Designer triage automation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-700/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Fast Scenario Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Quick Test Scenarios (1-Click Fill)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {PRESETS.map((preset, idx) => {
                const Icon = preset.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="text-left p-2.5 rounded-lg border border-slate-800 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-600 transition-all group flex items-start space-x-2.5 cursor-pointer"
                  >
                    <Icon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-medium text-slate-200 group-hover:text-emerald-300">
                        {preset.label}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {preset.category}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Caller Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Caller Name
              </label>
              <input
                type="text"
                value={callerName}
                onChange={(e) => setCallerName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Caller Email
              </label>
              <input
                type="email"
                value={callerEmail}
                onChange={(e) => setCallerEmail(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isVip}
                  onChange={(e) => setIsVip(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-0 w-4 h-4 bg-slate-950"
                />
                <span className="text-xs font-semibold text-amber-300 flex items-center space-x-1">
                  <span>VIP Caller Status</span>
                </span>
              </label>
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Short Description <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., VPN drops connection every 5 minutes on Singapore gateway"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Detailed Description / Technical Symptoms
            </label>
            <textarea
              rows={3}
              placeholder="Provide exact error logs, affected hardware, impact on business..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Live AI Pre-Triage Action Button */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleLiveTriage}
              disabled={isTriaging || !shortDescription}
              className="flex items-center space-x-2 bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 text-xs px-3.5 py-1.5 rounded-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {isTriaging ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              )}
              <span>Preview Now Assist AI Triage</span>
            </button>

            {aiPreview && (
              <span className="text-xs text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>AI Confidence: {Math.round(aiPreview.confidence * 100)}%</span>
              </span>
            )}
          </div>

          {/* AI Pre-Triage Result Box */}
          {aiPreview && (
            <div className="bg-slate-950 border border-purple-500/30 rounded-lg p-4 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-semibold text-purple-300">
                    Now Assist Triage Assessment ({aiPreview.isAiPowered ? 'Gemini 3.8 Flash' : 'Deterministic Rule Engine'})
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  aiPreview.priority === 1
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : aiPreview.priority === 2
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}>
                  Priority {aiPreview.priority} (
                  {aiPreview.priority === 1 ? 'Critical' : aiPreview.priority === 2 ? 'High' : aiPreview.priority === 3 ? 'Moderate' : 'Low'})
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Category</span>
                  <span className="text-slate-200 font-medium">{aiPreview.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Assignment Group</span>
                  <span className="text-emerald-400 font-medium">{aiPreview.assignmentGroup}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Urgency / Impact</span>
                  <span className="text-slate-200 font-medium">U{aiPreview.urgency} / I{aiPreview.impact}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Detected Sentiment</span>
                  <span className="text-slate-200 font-medium">{aiPreview.sentiment}</span>
                </div>
              </div>

              <div className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded border border-slate-800">
                <strong className="text-purple-300">Reasoning:</strong> {aiPreview.reasoning}
              </div>

              <div className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded border border-slate-800 flex items-start space-x-2">
                <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-cyan-300">Automated Action Plan:</strong> {aiPreview.autoAction}
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !shortDescription}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-md shadow-sm transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Submit & Execute Flow</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
