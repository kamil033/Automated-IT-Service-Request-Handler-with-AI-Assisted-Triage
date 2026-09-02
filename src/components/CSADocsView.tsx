import React, { useState } from 'react';
import { 
  BookOpen, 
  Database, 
  ShieldCheck, 
  Lock, 
  Users, 
  Workflow, 
  Code2, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  Sparkles, 
  ChevronRight,
  Table,
  FileCheck
} from 'lucide-react';
import { CSA_ADMIN_CONCEPTS } from '../data/mockData';

export const CSADocsView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'tables' | 'roles' | 'acls' | 'flows' | 'evaluator'>('tables');

  // Interactive ACL Evaluation Simulator State
  const [simRole, setSimRole] = useState<'admin' | 'itil' | 'requester'>('requester');
  const [simTable, setSimTable] = useState<'incident' | 'task'>('incident');
  const [simField, setSimField] = useState<'priority' | 'caller_id' | 'short_description'>('priority');
  const [simOperation, setSimOperation] = useState<'read' | 'write'>('write');

  // Evaluate simulated ACL
  const getSimResult = () => {
    if (simOperation === 'read') {
      return {
        granted: true,
        reason: 'Read access granted under public end-user read rule (incident.* / read for caller).',
        tableResult: 'PASS',
        fieldResult: 'PASS',
      };
    }

    // Write operation
    if (simField === 'priority') {
      if (simRole === 'admin' || simRole === 'itil') {
        return {
          granted: true,
          reason: `Write access granted to role [${simRole}] under incident.priority write ACL rule.`,
          tableResult: 'PASS',
          fieldResult: 'PASS',
        };
      }
      return {
        granted: false,
        reason: `Write access DENIED. Requester role cannot edit incident.priority. Priority must be set via Flow Designer Priority Matrix or ITIL agent.`,
        tableResult: 'PASS',
        fieldResult: 'DENIED (Requires itil role)',
      };
    }

    if (simField === 'caller_id') {
      if (simRole === 'admin') {
        return {
          granted: true,
          reason: 'Admin override permitted on caller_id field.',
          tableResult: 'PASS',
          fieldResult: 'PASS',
        };
      }
      return {
        granted: false,
        reason: 'Field is locked to prevent caller spoofing once ticket state is In Progress.',
        tableResult: 'PASS',
        fieldResult: 'DENIED (Locked field ACL)',
      };
    }

    return {
      granted: true,
      reason: `Write access granted for field [${simField}].`,
      tableResult: 'PASS',
      fieldResult: 'PASS',
    };
  };

  const simResult = getSimResult();

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-100">
                ServiceNow Certified System Administrator (CSA) Architecture & Governance
              </h1>
              <span className="text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                CSA Reference
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Authoritative technical specification: Table inheritance schema, Role-Based Access Control (RBAC), ACL evaluation order, and Flow Designer governance
            </p>
          </div>
        </div>

        {/* Sub-nav pills */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-md border border-slate-800 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveSection('tables')}
            className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeSection === 'tables' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tables Schema
          </button>
          <button
            onClick={() => setActiveSection('roles')}
            className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeSection === 'roles' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Roles & RBAC
          </button>
          <button
            onClick={() => setActiveSection('acls')}
            className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeSection === 'acls' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ACL Rules
          </button>
          <button
            onClick={() => setActiveSection('evaluator')}
            className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeSection === 'evaluator' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ACL Simulator
          </button>
          <button
            onClick={() => setActiveSection('flows')}
            className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeSection === 'flows' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Flow vs. Business Rules
          </button>
        </div>
      </div>

      {/* Section 1: Tables Schema & Inheritance */}
      {activeSection === 'tables' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Table Inheritance Diagram */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>ServiceNow Schema Table Inheritance Hierarchy</span>
            </h2>

            {/* Visual Tree */}
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-4">
              {/* Parent Task Node */}
              <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 max-w-md mx-auto text-center space-y-1">
                <span className="text-[10px] font-mono text-emerald-300 uppercase tracking-wider font-bold">
                  Base Parent Table
                </span>
                <h3 className="text-sm font-bold text-white font-mono">Task [task]</h3>
                <p className="text-[11px] text-slate-300">
                  Shared columns: <code>number</code>, <code>priority</code>, <code>state</code>, <code>assignment_group</code>, <code>assigned_to</code>, <code>opened_at</code>
                </p>
              </div>

              {/* Connector */}
              <div className="flex justify-center">
                <div className="w-0.5 h-6 bg-slate-700" />
              </div>

              {/* Extended Child Tables */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-slate-900 border border-cyan-500/40 text-center space-y-1">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Extended Table</span>
                  <h4 className="text-xs font-bold text-slate-100 font-mono">Incident [incident]</h4>
                  <p className="text-[11px] text-slate-400">
                    Adds: <code>caller_id</code>, <code>category</code>, <code>subcategory</code>, <code>urgency</code>, <code>impact</code>
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-purple-500/40 text-center space-y-1">
                  <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">Extended Table</span>
                  <h4 className="text-xs font-bold text-slate-100 font-mono">Requested Item [sc_req_item]</h4>
                  <p className="text-[11px] text-slate-400">
                    Adds: <code>cat_item</code>, <code>stage</code>, <code>request</code>, <code>quantity</code>
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-amber-500/40 text-center space-y-1">
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">Extended Table</span>
                  <h4 className="text-xs font-bold text-slate-100 font-mono">Change Request [change_request]</h4>
                  <p className="text-[11px] text-slate-400">
                    Adds: <code>risk</code>, <code>type</code>, <code>cab_recommendation</code>, <code>backout_plan</code>
                  </p>
                </div>
              </div>
            </div>

            {/* Table Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
              {CSA_ADMIN_CONCEPTS.tables.map((tbl, idx) => (
                <div key={idx} className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-400">{tbl.label}</span>
                    <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400 border border-slate-800">
                      {tbl.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{tbl.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Roles & RBAC */}
      {activeSection === 'roles' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-4 animate-in fade-in">
          <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>ServiceNow Core Role-Based Access Control (RBAC)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {CSA_ADMIN_CONCEPTS.roles.map((r, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-100">{r.label}</span>
                  <span className="text-[10px] font-mono bg-slate-900 text-emerald-400 px-2 py-0.5 rounded border border-slate-800">
                    Role: {r.role}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{r.description}</p>
                <div className="bg-slate-900/90 p-2.5 rounded border border-slate-800 text-[11px] text-slate-300">
                  <strong className="text-emerald-400">Permissions:</strong> {r.privileges}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: ACL Rules & Evaluation Algorithm */}
      {activeSection === 'acls' && (
        <div className="space-y-4 animate-in fade-in">
          {/* ACL Evaluation Order Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-3">
            <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>ServiceNow ACL Evaluation Algorithm (Order of Precedence)</span>
            </h2>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2 text-xs">
              {CSA_ADMIN_CONCEPTS.aclEvaluationOrder.map((step, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Established ACL Rules Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Configured Access Control Lists in this Application Scope
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Rule Name</th>
                    <th className="py-2.5 px-3">Target Scope</th>
                    <th className="py-2.5 px-3">Required Roles</th>
                    <th className="py-2.5 px-3">Condition</th>
                    <th className="py-2.5 px-3">Security Governance Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {CSA_ADMIN_CONCEPTS.acls.map((acl, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">{acl.rule}</td>
                      <td className="py-2.5 px-3 text-slate-300 font-mono text-[11px]">{acl.appliesTo}</td>
                      <td className="py-2.5 px-3 text-slate-300">{acl.role}</td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{acl.condition}</td>
                      <td className="py-2.5 px-3 text-slate-300">{acl.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Section 4: Interactive ACL Simulator */}
      {activeSection === 'evaluator' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Interactive ACL Security Evaluation Engine Simulator
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">Tests real-time ACL evaluation logic</span>
          </div>

          {/* Interactive Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-lg border border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                User Role Context
              </label>
              <select
                value={simRole}
                onChange={(e) => setSimRole(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="admin">System Administrator (admin)</option>
                <option value="itil">ITIL Fulfiller (itil)</option>
                <option value="requester">End-User Requester (snc_internal)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Operation
              </label>
              <select
                value={simOperation}
                onChange={(e) => setSimOperation(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="write">Write (Update field)</option>
                <option value="read">Read (View field)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Table Level
              </label>
              <select
                value={simTable}
                onChange={(e) => setSimTable(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono"
              >
                <option value="incident">incident</option>
                <option value="task">task</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Target Field
              </label>
              <select
                value={simField}
                onChange={(e) => setSimField(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono"
              >
                <option value="priority">priority</option>
                <option value="caller_id">caller_id</option>
                <option value="short_description">short_description</option>
              </select>
            </div>
          </div>

          {/* Evaluator Output */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {simResult.granted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400" />
                )}
                <span
                  className={`text-sm font-bold uppercase tracking-wider ${
                    simResult.granted ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  Access {simResult.granted ? 'GRANTED' : 'DENIED (Security Exception)'}
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Rule: {simTable}.{simField}/{simOperation}
              </span>
            </div>

            <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded border border-slate-800">
              {simResult.reason}
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Step 1: Table ACL ({simTable}.none)</span>
                <span className="text-emerald-400 font-mono font-semibold">{simResult.tableResult}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Step 2: Field ACL ({simTable}.{simField})</span>
                <span
                  className={`font-mono font-semibold ${
                    simResult.fieldResult === 'PASS' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {simResult.fieldResult}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 5: Flow Designer vs Business Rules */}
      {activeSection === 'flows' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-4 animate-in fade-in">
          <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <Workflow className="w-4 h-4 text-emerald-400" />
            <span>Flow Designer vs. Legacy Business Rules Comparison Matrix</span>
          </h2>
          <p className="text-xs text-slate-300">
            Per ServiceNow Certified System Administrator (CSA) best practices, modern workflows should default to{' '}
            <strong className="text-cyan-400">Flow Designer</strong> for maintainability, natural language readability, and native IntegrationHub / AI spoke execution.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Architectural Dimension</th>
                  <th className="py-2.5 px-3 text-cyan-400">Flow Designer (Recommended)</th>
                  <th className="py-2.5 px-3 text-slate-400">Business Rules (GlideRecord Scripts)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {CSA_ADMIN_CONCEPTS.flowVsBusinessRules.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-semibold text-slate-200">{row.aspect}</td>
                    <td className="py-3 px-3 text-cyan-200 bg-cyan-950/20">{row.flowDesigner}</td>
                    <td className="py-3 px-3 text-slate-400">{row.businessRules}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
