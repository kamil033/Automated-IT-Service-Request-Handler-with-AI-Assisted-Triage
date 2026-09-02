import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  User, 
  ShieldAlert, 
  MessageSquare, 
  RefreshCw, 
  X, 
  Star,
  Check,
  Building2,
  Share2
} from 'lucide-react';
import { IncidentRecord, IncidentState, UserRoleProfile, WorkNote } from '../types';

interface IncidentListProps {
  incidents: IncidentRecord[];
  onUpdateIncident: (updated: IncidentRecord) => void;
  currentUser: UserRoleProfile;
  onOpenNewTicket: () => void;
}

export const IncidentList: React.FC<IncidentListProps> = ({
  incidents,
  onUpdateIncident,
  currentUser,
  onOpenNewTicket,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [selectedIncident, setSelectedIncident] = useState<IncidentRecord | null>(null);
  const [newWorkNote, setNewWorkNote] = useState('');
  const [isRetriaging, setIsRetriaging] = useState(false);

  // Filter incidents
  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.short_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.caller_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.assignment_group.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || inc.category === categoryFilter;
    const matchesPriority = priorityFilter === 'ALL' || inc.priority.toString() === priorityFilter;

    return matchesSearch && matchesCategory && matchesPriority;
  });

  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 1:
        return 'bg-rose-950/80 text-rose-300 border-rose-800/80';
      case 2:
        return 'bg-amber-950/80 text-amber-300 border-amber-800/80';
      case 3:
        return 'bg-blue-950/80 text-blue-300 border-blue-800/80';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getStateBadge = (state: IncidentState) => {
    switch (state) {
      case 'New':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800';
      case 'In Progress':
        return 'bg-blue-950/60 text-blue-300 border-blue-800';
      case 'On Hold':
        return 'bg-amber-950/60 text-amber-300 border-amber-800';
      case 'Resolved':
        return 'bg-purple-950/60 text-purple-300 border-purple-800';
      case 'Closed':
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const handleAddWorkNote = () => {
    if (!selectedIncident || !newWorkNote.trim()) return;

    const note: WorkNote = {
      id: `wn_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      author: currentUser.name,
      authorRole: currentUser.role,
      note: newWorkNote,
      type: 'work_note',
    };

    const updated: IncidentRecord = {
      ...selectedIncident,
      work_notes: [note, ...selectedIncident.work_notes],
    };

    onUpdateIncident(updated);
    setSelectedIncident(updated);
    setNewWorkNote('');
  };

  const handleResolveIncident = () => {
    if (!selectedIncident) return;
    if (!currentUser.permissions.canResolveIncident) {
      alert(`ACL Denied: Role [${currentUser.role}] does not have write access to resolve incidents.`);
      return;
    }

    const note: WorkNote = {
      id: `wn_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      author: currentUser.name,
      authorRole: currentUser.role,
      note: `Incident set to Resolved by ${currentUser.name}. SLA marked as Met.`,
      type: 'system',
    };

    const updated: IncidentRecord = {
      ...selectedIncident,
      state: 'Resolved',
      resolved_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      work_notes: [note, ...selectedIncident.work_notes],
    };

    onUpdateIncident(updated);
    setSelectedIncident(updated);
  };

  const handleReTriageAI = async () => {
    if (!selectedIncident) return;
    setIsRetriaging(true);

    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shortDescription: selectedIncident.short_description,
          description: selectedIncident.description,
          caller: selectedIncident.caller_name,
        }),
      });
      const triage = await res.json();

      const note: WorkNote = {
        id: `wn_${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        author: 'Now Assist AI Agent',
        authorRole: 'ai',
        note: `Manual re-triage requested by ${currentUser.name}. AI Reasoning: ${triage.reasoning} (Confidence: ${Math.round(triage.confidence * 100)}%)`,
        type: 'ai',
      };

      const updated: IncidentRecord = {
        ...selectedIncident,
        category: triage.category,
        subcategory: triage.subcategory,
        urgency: triage.urgency,
        impact: triage.impact,
        priority: triage.priority,
        assignment_group: triage.assignmentGroup,
        ai_triage: triage,
        work_notes: [note, ...selectedIncident.work_notes],
      };

      onUpdateIncident(updated);
      setSelectedIncident(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRetriaging(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* ServiceNow Breadcrumb & Filter Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Breadcrumb Path */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-slate-400">Incident</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
            Active = true
          </span>
          <span className="text-slate-400 hidden sm:inline">^ Order by Priority ASC</span>
          <span className="text-slate-500 text-[11px]">({filteredIncidents.length} records)</span>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search number, caller, summary..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 w-52 sm:w-64"
            />
          </div>

          {/* Category Selector */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="Network">Network</option>
            <option value="Security">Security</option>
            <option value="Hardware">Hardware</option>
            <option value="Cloud & DB">Cloud & DB</option>
            <option value="Software">Software</option>
            <option value="Inquiry / Help">Inquiry / Help</option>
          </select>

          {/* Priority Selector */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="1">P1 - Critical</option>
            <option value="2">P2 - High</option>
            <option value="3">P3 - Moderate</option>
            <option value="4">P4 - Low</option>
          </select>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Number</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">State</th>
                <th className="py-3 px-4">Short Description</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Caller</th>
                <th className="py-3 px-3">Assignment Group</th>
                <th className="py-3 px-3">SLA Status</th>
                <th className="py-3 px-3 text-right">AI Triage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-500" />
                    <p className="font-medium text-sm">No incidents match the active filter criteria.</p>
                    <button
                      onClick={onOpenNewTicket}
                      className="mt-3 text-emerald-400 hover:text-emerald-300 font-medium underline text-xs cursor-pointer"
                    >
                      Create a new test request
                    </button>
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((inc) => {
                  const slaPercent = Math.min(
                    100,
                    Math.round((inc.sla_elapsed_hours / inc.sla_hours_target) * 100)
                  );
                  return (
                    <tr
                      key={inc.sys_id}
                      onClick={() => setSelectedIncident(inc)}
                      className="hover:bg-slate-800/60 transition-colors cursor-pointer group"
                    >
                      {/* Number */}
                      <td className="py-3 px-4 font-mono font-semibold text-emerald-400 group-hover:underline">
                        {inc.number}
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${getPriorityBadge(
                            inc.priority
                          )}`}
                        >
                          {inc.priority} - {inc.priority === 1 ? 'Critical' : inc.priority === 2 ? 'High' : inc.priority === 3 ? 'Mod' : 'Low'}
                        </span>
                      </td>

                      {/* State */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${getStateBadge(
                            inc.state
                          )}`}
                        >
                          {inc.state}
                        </span>
                      </td>

                      {/* Short Description */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-center space-x-1.5">
                          {inc.caller_vip && (
                            <Star
                              className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0"
                              title="VIP Requester"
                            />
                          )}
                          <span className="text-slate-200 font-medium truncate">
                            {inc.short_description}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 text-slate-300">{inc.category}</td>

                      {/* Caller */}
                      <td className="py-3 px-3 text-slate-300">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3 text-slate-500" />
                          <span>{inc.caller_name}</span>
                        </div>
                      </td>

                      {/* Assignment Group */}
                      <td className="py-3 px-3 text-slate-300">
                        <span className="bg-slate-800/80 px-2 py-0.5 rounded text-[11px] text-slate-300 border border-slate-700">
                          {inc.assignment_group}
                        </span>
                      </td>

                      {/* SLA */}
                      <td className="py-3 px-3 w-36">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span>{inc.sla_hours_target}h SLA</span>
                            <span
                              className={
                                slaPercent > 80 ? 'text-rose-400 font-bold' : 'text-slate-400'
                              }
                            >
                              {slaPercent}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                slaPercent > 85
                                  ? 'bg-rose-500'
                                  : slaPercent > 50
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${slaPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* AI Triage Confidence */}
                      <td className="py-3 px-3 text-right">
                        {inc.ai_triage ? (
                          <span className="inline-flex items-center space-x-1 text-[11px] text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/60 font-medium">
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            <span>{Math.round(inc.ai_triage.confidence * 100)}%</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Manual</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Form View Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Form Top Banner */}
            <div className="px-6 py-3.5 bg-slate-800/95 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-base font-bold text-emerald-400">
                  {selectedIncident.number}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold border ${getPriorityBadge(
                    selectedIncident.priority
                  )}`}
                >
                  Priority {selectedIncident.priority}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium border ${getStateBadge(
                    selectedIncident.state
                  )}`}
                >
                  {selectedIncident.state}
                </span>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleReTriageAI}
                  disabled={isRetriaging}
                  className="flex items-center space-x-1.5 bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-200 text-xs px-2.5 py-1 rounded transition-colors cursor-pointer"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 text-purple-400 ${isRetriaging ? 'animate-spin' : ''}`}
                  />
                  <span>Re-Triage with AI</span>
                </button>

                {selectedIncident.state !== 'Resolved' && (
                  <button
                    onClick={handleResolveIncident}
                    className="flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded shadow-sm transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Resolve</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedIncident(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form Fields Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Standard 2-Column ITIL Form Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-slate-950/60 p-4 rounded-lg border border-slate-800">
                {/* Column 1 */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Caller
                    </label>
                    <div className="flex items-center space-x-2 text-xs text-slate-200 font-medium">
                      <span>{selectedIncident.caller_name}</span>
                      {selectedIncident.caller_vip && (
                        <span className="bg-amber-950 text-amber-300 text-[10px] px-1.5 py-0.2 rounded border border-amber-800 font-bold">
                          VIP
                        </span>
                      )}
                      <span className="text-slate-500 font-normal">({selectedIncident.caller_email})</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={selectedIncident.category}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Subcategory
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={selectedIncident.subcategory}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Urgency
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={`Level ${selectedIncident.urgency}`}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Impact
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={`Level ${selectedIncident.impact}`}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Priority
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={`P${selectedIncident.priority}`}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Assignment Group
                    </label>
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-semibold text-emerald-300">
                        {selectedIncident.assignment_group}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Assigned To
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={selectedIncident.assigned_to}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Contractual SLA Target
                      </label>
                      <div className="flex items-center space-x-1.5 text-xs text-slate-300 pt-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{selectedIncident.sla_hours_target} Hours (task_sla)</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Opened At
                      </label>
                      <div className="text-xs text-slate-400 pt-1 font-mono">
                        {selectedIncident.opened_at}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Short & Detailed Description */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Short Description
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={selectedIncident.short_description}
                    className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs font-medium text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Technical Symptoms & Description
                  </label>
                  <div className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs text-slate-300 whitespace-pre-wrap">
                    {selectedIncident.description}
                  </div>
                </div>
              </div>

              {/* Now Assist AI Triage Reasoning Card */}
              {selectedIncident.ai_triage && (
                <div className="bg-purple-950/20 border border-purple-500/30 rounded-lg p-4 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-semibold text-purple-300">
                        Now Assist Agentic Triage Record [sys_ai_triage]
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                      Confidence: {Math.round(selectedIncident.ai_triage.confidence * 100)}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">
                    <strong className="text-purple-300">AI Classification Reasoning:</strong>{' '}
                    {selectedIncident.ai_triage.reasoning}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                      <strong className="text-cyan-400 block text-[11px] uppercase tracking-wider">
                        Suggested Resolution / Playbook:
                      </strong>
                      <span className="text-slate-300">{selectedIncident.ai_triage.suggestedFix}</span>
                    </div>
                    <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                      <strong className="text-emerald-400 block text-[11px] uppercase tracking-wider">
                        Automated Flow Triggered:
                      </strong>
                      <span className="text-slate-300">{selectedIncident.ai_triage.autoAction}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Work Notes / Activity Stream */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                      Activity Stream & Work Notes (sys_journal_field)
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {selectedIncident.work_notes.length} log entries
                  </span>
                </div>

                {/* Add Work Note Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter fulfiller work notes (internal only)..."
                    value={newWorkNote}
                    onChange={(e) => setNewWorkNote(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddWorkNote();
                    }}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleAddWorkNote}
                    disabled={!newWorkNote.trim()}
                    className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs px-4 py-2 rounded-md font-semibold transition-colors cursor-pointer"
                  >
                    Post Note
                  </button>
                </div>

                {/* Stream Items */}
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {selectedIncident.work_notes.map((note) => (
                    <div
                      key={note.id}
                      className={`p-3 rounded-lg border text-xs space-y-1 ${
                        note.type === 'ai'
                          ? 'bg-purple-950/20 border-purple-800/40 text-purple-200'
                          : note.type === 'system'
                          ? 'bg-slate-950/80 border-slate-800 text-slate-300'
                          : 'bg-slate-900 border-slate-700 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-semibold text-slate-200">{note.author}</span>
                          <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-400">
                            {note.authorRole}
                          </span>
                        </div>
                        <span className="font-mono text-[10px]">{note.timestamp}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{note.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
