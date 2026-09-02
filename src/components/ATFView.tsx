import React, { useState } from 'react';
import { 
  FlaskConical, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Layers, 
  Terminal, 
  Plus, 
  AlertCircle, 
  ShieldCheck, 
  ChevronRight, 
  Loader2,
  FileText
} from 'lucide-react';
import { ATFTestCase, ATFStep, UserRoleProfile } from '../types';
import { INITIAL_ATF_TEST_CASES } from '../data/mockData';

interface ATFViewProps {
  currentUser: UserRoleProfile;
}

export const ATFView: React.FC<ATFViewProps> = ({ currentUser }) => {
  const [testCases, setTestCases] = useState<ATFTestCase[]>(INITIAL_ATF_TEST_CASES);
  const [selectedTest, setSelectedTest] = useState<ATFTestCase>(testCases[0]);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [runningTestId, setRunningTestId] = useState<string | null>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // New Custom Test State
  const [customName, setCustomName] = useState('Verify Database Crash Routes to Cloud Platform');
  const [customShortDesc, setCustomShortDesc] = useState('Critical Postgres deadlock taking down API services');
  const [customExpectedCategory, setCustomExpectedCategory] = useState('Cloud & DB');
  const [customExpectedPriority, setCustomExpectedPriority] = useState('2');
  const [customExpectedGroup, setCustomExpectedGroup] = useState('Cloud Platform & DB');

  const executeTestCase = async (test: ATFTestCase) => {
    setRunningTestId(test.id);

    // Simulated step execution logs
    const updatedTest: ATFTestCase = {
      ...test,
      lastRunStatus: 'Running',
      logs: [`[${new Date().toLocaleTimeString()}] Starting ATF execution for ${test.testNumber}...`],
    };

    setTestCases((prev) => prev.map((t) => (t.id === test.id ? updatedTest : t)));
    if (selectedTest.id === test.id) setSelectedTest(updatedTest);

    await new Promise((r) => setTimeout(r, 600));

    const nowTime = new Date().toLocaleTimeString();
    const duration = Math.floor(280 + Math.random() * 150);

    const passedLogs = [
      `[${nowTime}] Initializing ATF Client Test Runner for Table [${test.table}]`,
      `[${nowTime}] Step 1: Simulated record inserted -> Caller: ${test.sampleInput.caller}`,
      `[${nowTime}] Step 2: Flow Designer context instantiated successfully`,
      ...test.steps.slice(2).map((st) => `[${nowTime}] Step ${st.stepNumber}: ASSERTION PASSED -> ${st.name}`),
      `[${nowTime}] ATF Suite Status: SUCCESS (All ${test.steps.length} test assertions verified in ${duration}ms)`,
    ];

    const completedTest: ATFTestCase = {
      ...test,
      lastRunStatus: 'Passed',
      lastRunTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      durationMs: duration,
      logs: passedLogs,
    };

    setTestCases((prev) => prev.map((t) => (t.id === test.id ? completedTest : t)));
    if (selectedTest.id === test.id) setSelectedTest(completedTest);
    setRunningTestId(null);
  };

  const handleRunAll = async () => {
    setIsRunningAll(true);
    for (const tc of testCases) {
      await executeTestCase(tc);
    }
    setIsRunningAll(false);
  };

  const handleCreateCustomTest = (e: React.FormEvent) => {
    e.preventDefault();

    const newTestNumber = `ATF-00${testCases.length + 1}`;
    const newSteps: ATFStep[] = [
      {
        stepNumber: 1,
        name: 'Insert Custom Incident',
        actionType: 'Create Record',
        details: `Insert record with short description: "${customShortDesc}"`,
      },
      {
        stepNumber: 2,
        name: 'Execute Triage Flow',
        actionType: 'Execute Flow',
        details: 'Run Flow Designer automation.',
      },
      {
        stepNumber: 3,
        name: `Assert Category == ${customExpectedCategory}`,
        actionType: 'Validate Field',
        targetField: 'category',
        expectedValue: customExpectedCategory,
        details: 'Validate AI/rule categorization.',
      },
      {
        stepNumber: 4,
        name: `Assert Priority == P${customExpectedPriority}`,
        actionType: 'Validate Field',
        targetField: 'priority',
        expectedValue: customExpectedPriority,
        details: 'Validate priority formula.',
      },
      {
        stepNumber: 5,
        name: `Assert Assignment Group == ${customExpectedGroup}`,
        actionType: 'Validate Field',
        targetField: 'assignment_group',
        expectedValue: customExpectedGroup,
        details: 'Validate group routing.',
      },
    ];

    const newTestCase: ATFTestCase = {
      id: `atf_custom_${Date.now()}`,
      testNumber: newTestNumber,
      name: customName,
      description: `Custom regression test case authored to validate routing for ${customExpectedCategory} requests.`,
      table: 'incident',
      sampleInput: {
        caller: 'System QA Tester',
        short_description: customShortDesc,
        description: customShortDesc,
        vip: false,
      },
      steps: newSteps,
      lastRunStatus: 'Not Run',
      logs: ['Test created. Ready for execution in ATF test runner.'],
    };

    setTestCases((prev) => [...prev, newTestCase]);
    setSelectedTest(newTestCase);
    setIsCustomModalOpen(false);
  };

  const passedCount = testCases.filter((t) => t.lastRunStatus === 'Passed').length;

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-100">
                Automated Test Framework (ATF) Suite
              </h1>
              <span className="text-[10px] font-mono font-bold bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
                sys_atf_test_suite
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              ServiceNow Automated Regression & Flow Validation Engine ({passedCount}/{testCases.length} tests passing)
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsCustomModalOpen(true)}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-md border border-slate-700 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create ATF Test Case</span>
          </button>

          <button
            onClick={handleRunAll}
            disabled={isRunningAll}
            className="flex items-center space-x-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-semibold px-3.5 py-2 rounded-md shadow-sm transition-all cursor-pointer"
          >
            {isRunningAll ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-white" />
            )}
            <span>{isRunningAll ? 'Running All Suites...' : 'Run All Test Suites'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Test Cases List (5 cols) + Test Inspector & Logs (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Test Cases List */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-3">
              Regression Test Cases ({testCases.length})
            </span>

            <div className="space-y-2">
              {testCases.map((test) => {
                const isSelected = selectedTest.id === test.id;
                const isRunning = runningTestId === test.id;

                return (
                  <div
                    key={test.id}
                    onClick={() => setSelectedTest(test)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start justify-between space-x-2 ${
                      isSelected
                        ? 'bg-slate-800 border-amber-500/70 shadow-sm'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-amber-400">
                          {test.testNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            test.lastRunStatus === 'Passed'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : test.lastRunStatus === 'Running'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800 animate-pulse'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {test.lastRunStatus}
                        </span>
                      </div>
                      <h4 className="text-xs font-medium text-slate-200 line-clamp-1">{test.name}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{test.description}</p>
                    </div>

                    <div className="flex flex-col items-end justify-between space-y-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          executeTestCase(test);
                        }}
                        disabled={isRunning}
                        className="p-1.5 rounded bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Run this test case"
                      >
                        {isRunning ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                      </button>
                      {test.durationMs && (
                        <span className="text-[10px] font-mono text-slate-400">
                          {test.durationMs}ms
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Test Case Inspector & Logs */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm font-bold text-amber-400">
                    {selectedTest.testNumber}
                  </span>
                  <h2 className="text-sm font-semibold text-slate-100">{selectedTest.name}</h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">{selectedTest.description}</p>
              </div>

              <button
                onClick={() => executeTestCase(selectedTest)}
                disabled={runningTestId === selectedTest.id}
                className="flex items-center space-x-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold text-xs px-3.5 py-1.5 rounded-md shadow-sm transition-all cursor-pointer shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Run Test Case</span>
              </button>
            </div>

            {/* Test Assertion Steps */}
            <div>
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                Test Assertion Pipeline ({selectedTest.steps.length} Steps)
              </span>

              <div className="space-y-2">
                {selectedTest.steps.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start space-x-3 text-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {step.stepNumber}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{step.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-cyan-300 border border-slate-800">
                          {step.actionType}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{step.details}</p>
                      {step.targetField && (
                        <div className="text-[10px] font-mono text-emerald-400 mt-1">
                          assert [{step.targetField}] == &quot;{step.expectedValue}&quot;
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Execution Logs */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span>ATF Execution Console Logs</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-slate-300 space-y-1 max-h-48 overflow-y-auto">
                {selectedTest.logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={
                      log.includes('PASSED') || log.includes('SUCCESS')
                        ? 'text-emerald-400'
                        : log.includes('ASSERTION')
                        ? 'text-cyan-300'
                        : 'text-slate-400'
                    }
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Test Case Creation Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-xl shadow-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <FlaskConical className="w-5 h-5 text-amber-400" />
              <span>Author New ATF Test Case</span>
            </h2>
            <p className="text-xs text-slate-400">
              Configure assertions to validate that incoming service requests trigger the expected Flow Designer actions.
            </p>

            <form onSubmit={handleCreateCustomTest} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Test Case Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Sample Request Payload (Short Description)
                </label>
                <input
                  type="text"
                  value={customShortDesc}
                  onChange={(e) => setCustomShortDesc(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Assert Category
                  </label>
                  <select
                    value={customExpectedCategory}
                    onChange={(e) => setCustomExpectedCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200"
                  >
                    <option value="Network">Network</option>
                    <option value="Security">Security</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Cloud & DB">Cloud & DB</option>
                    <option value="Software">Software</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Assert Priority
                  </label>
                  <select
                    value={customExpectedPriority}
                    onChange={(e) => setCustomExpectedPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200 font-bold"
                  >
                    <option value="1">P1 - Critical</option>
                    <option value="2">P2 - High</option>
                    <option value="3">P3 - Moderate</option>
                    <option value="4">P4 - Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Assert Group
                  </label>
                  <select
                    value={customExpectedGroup}
                    onChange={(e) => setCustomExpectedGroup(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200"
                  >
                    <option value="Network Infrastructure">Network</option>
                    <option value="SecOps Incident Response">SecOps</option>
                    <option value="Hardware Asset Support">Hardware</option>
                    <option value="Cloud Platform & DB">Cloud/DB</option>
                    <option value="Service Desk Tier 1">Service Desk</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded transition-colors"
                >
                  Save & Add to Suite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
