/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { IncidentList } from './components/IncidentList';
import { FlowDesignerView } from './components/FlowDesignerView';
import { AITriageView } from './components/AITriageView';
import { ATFView } from './components/ATFView';
import { ReportsView } from './components/ReportsView';
import { CSADocsView } from './components/CSADocsView';
import { NewTicketModal } from './components/NewTicketModal';
import { IncidentRecord, UserRoleProfile } from './types';
import { INITIAL_INCIDENTS, USER_PROFILES } from './data/mockData';
import { CheckCircle2, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'incidents' | 'flow' | 'ai' | 'atf' | 'reports' | 'csa'>('incidents');
  const [incidents, setIncidents] = useState<IncidentRecord[]>(INITIAL_INCIDENTS);
  const [currentUser, setCurrentUser] = useState<UserRoleProfile>(USER_PROFILES[0]);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [geminiConnected, setGeminiConnected] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Probe backend health to verify Gemini integration status
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.geminiConfigured) {
          setGeminiConnected(true);
        }
      })
      .catch((err) => {
        console.warn('API health check error:', err);
      });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleInsertIncident = (newIncident: IncidentRecord) => {
    setIncidents((prev) => [newIncident, ...prev]);
    showToast(`Record ${newIncident.number} inserted. Flow Designer executed successfully.`);
    setActiveTab('incidents');
  };

  const handleUpdateIncident = (updated: IncidentRecord) => {
    setIncidents((prev) => prev.map((inc) => (inc.sys_id === updated.sys_id ? updated : inc)));
    showToast(`Record ${updated.number} updated.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* ServiceNow Polaris Navigation & System Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        allUsers={USER_PROFILES}
        onOpenNewTicket={() => setIsNewTicketOpen(true)}
        geminiConnected={geminiConnected}
        incidentCount={incidents.length}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'incidents' && (
          <IncidentList
            incidents={incidents}
            onUpdateIncident={handleUpdateIncident}
            currentUser={currentUser}
            onOpenNewTicket={() => setIsNewTicketOpen(true)}
          />
        )}

        {activeTab === 'flow' && <FlowDesignerView incidents={incidents} />}

        {activeTab === 'ai' && (
          <AITriageView
            onInsertIncident={handleInsertIncident}
            geminiConnected={geminiConnected}
          />
        )}

        {activeTab === 'atf' && <ATFView currentUser={currentUser} />}

        {activeTab === 'reports' && <ReportsView incidents={incidents} />}

        {activeTab === 'csa' && <CSADocsView />}
      </main>

      {/* Footer System Bar */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-3 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-slate-300">ServiceNow Instance dev108422</span>
            <span>&bull;</span>
            <span>Scope: sn_it_triage</span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] text-slate-400">
            <span>Now Assist AI v2.4</span>
            <span>&bull;</span>
            <span>ATF Runner v2026.2</span>
            <span>&bull;</span>
            <span>Flow Designer Active</span>
          </div>
        </div>
      </footer>

      {/* Create Ticket Modal */}
      <NewTicketModal
        isOpen={isNewTicketOpen}
        onClose={() => setIsNewTicketOpen(false)}
        onSubmit={handleInsertIncident}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 bg-slate-900 border border-emerald-500/50 text-slate-100 text-xs px-4 py-2.5 rounded-lg shadow-xl animate-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
