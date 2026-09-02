import React from 'react';
import { 
  Workflow, 
  Bot, 
  FlaskConical, 
  BarChart3, 
  BookOpen, 
  ListFilter, 
  Plus, 
  Sparkles, 
  UserCheck, 
  ShieldCheck, 
  Server
} from 'lucide-react';
import { UserRoleProfile } from '../types';

interface HeaderProps {
  activeTab: 'incidents' | 'flow' | 'ai' | 'atf' | 'reports' | 'csa';
  setActiveTab: (tab: 'incidents' | 'flow' | 'ai' | 'atf' | 'reports' | 'csa') => void;
  currentUser: UserRoleProfile;
  onUserChange: (user: UserRoleProfile) => void;
  allUsers: UserRoleProfile[];
  onOpenNewTicket: () => void;
  geminiConnected: boolean;
  incidentCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onUserChange,
  allUsers,
  onOpenNewTicket,
  geminiConnected,
  incidentCount,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-sm select-none">
      {/* Top ServiceNow Global System Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Instance Logo & Metadata */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-emerald-600/20 border border-emerald-500/30 px-2.5 py-1 rounded-md">
            <Server className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="font-mono text-xs font-semibold text-emerald-300">
              dev108422.service-now.com
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400">
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-slate-700">
              Scope: sn_it_triage
            </span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-slate-700">
              Washington DC (v2026.2)
            </span>
          </div>
        </div>

        {/* Right: AI Engine Status + Impersonation + New Ticket CTA */}
        <div className="flex items-center space-x-3">
          {/* AI Status Badge */}
          <div 
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
              geminiConnected 
                ? 'bg-purple-950/40 border-purple-500/40 text-purple-300' 
                : 'bg-blue-950/40 border-blue-500/40 text-blue-300'
            }`}
            title={geminiConnected ? 'Connected to Gemini 3.8 Flash' : 'Using Autonomous Heuristic Classifier'}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">Triage Engine:</span>
            <span className="font-semibold">{geminiConnected ? 'Gemini 3.8 Flash' : 'Rule-Based NLP'}</span>
          </div>

          {/* Impersonate User Dropdown */}
          <div className="flex items-center space-x-1.5 bg-slate-800/90 border border-slate-700 px-2 py-1 rounded-md">
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400 hidden lg:inline">Impersonate:</span>
            <select
              id="impersonate-select"
              value={currentUser.id}
              onChange={(e) => {
                const selected = allUsers.find((u) => u.id === e.target.value);
                if (selected) onUserChange(selected);
              }}
              className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer"
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.id} className="bg-slate-900 text-slate-200">
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
            <span 
              className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                currentUser.role === 'admin' 
                  ? 'bg-rose-900/60 text-rose-300 border border-rose-700/50' 
                  : currentUser.role === 'itil'
                  ? 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {currentUser.role}
            </span>
          </div>

          {/* Create Request / Incident Button */}
          <button
            id="btn-create-request"
            onClick={onOpenNewTicket}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all text-white font-medium text-xs px-3 py-1.5 rounded-md shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Request</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-slate-950/70 border-t border-slate-800/80 px-4">
        <div className="max-w-7xl mx-auto flex items-center space-x-1 overflow-x-auto py-1 text-xs">
          <button
            id="tab-incidents"
            onClick={() => setActiveTab('incidents')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'incidents'
                ? 'bg-slate-800 text-white border-b-2 border-emerald-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ListFilter className="w-4 h-4 text-emerald-400" />
            <span>Service Requests & Incidents</span>
            <span className="bg-slate-700 text-slate-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {incidentCount}
            </span>
          </button>

          <button
            id="tab-flow"
            onClick={() => setActiveTab('flow')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'flow'
                ? 'bg-slate-800 text-white border-b-2 border-cyan-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Workflow className="w-4 h-4 text-cyan-400" />
            <span>Flow Designer</span>
            <span className="bg-cyan-950 text-cyan-300 text-[10px] px-1.5 py-0.2 rounded font-mono border border-cyan-800">
              Active
            </span>
          </button>

          <button
            id="tab-ai"
            onClick={() => setActiveTab('ai')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-slate-800 text-white border-b-2 border-purple-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Bot className="w-4 h-4 text-purple-400" />
            <span>Now Assist AI Triage</span>
          </button>

          <button
            id="tab-atf"
            onClick={() => setActiveTab('atf')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'atf'
                ? 'bg-slate-800 text-white border-b-2 border-amber-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FlaskConical className="w-4 h-4 text-amber-400" />
            <span>Automated Test Framework (ATF)</span>
          </button>

          <button
            id="tab-reports"
            onClick={() => setActiveTab('reports')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-slate-800 text-white border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span>Reports & Dashboards</span>
          </button>

          <button
            id="tab-csa"
            onClick={() => setActiveTab('csa')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'csa'
                ? 'bg-slate-800 text-white border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>CSA Architecture Reference</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
