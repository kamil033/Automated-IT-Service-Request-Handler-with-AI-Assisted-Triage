export type UrgencyLevel = 1 | 2 | 3; // 1-High, 2-Medium, 3-Low
export type ImpactLevel = 1 | 2 | 3; // 1-High, 2-Medium, 3-Low
export type PriorityLevel = 1 | 2 | 3 | 4; // 1-Critical, 2-High, 3-Moderate, 4-Low

export type IncidentState = 'New' | 'In Progress' | 'On Hold' | 'Resolved' | 'Closed';

export interface WorkNote {
  id: string;
  timestamp: string;
  author: string;
  authorRole: string;
  note: string;
  type: 'system' | 'work_note' | 'ai' | 'atf';
}

export interface AITriageResult {
  category: string;
  subcategory: string;
  urgency: UrgencyLevel;
  impact: ImpactLevel;
  priority: PriorityLevel;
  assignmentGroup: string;
  confidence: number;
  reasoning: string;
  sentiment: string;
  suggestedFix: string;
  autoAction: string;
  isAiPowered: boolean;
  model?: string;
}

export interface IncidentRecord {
  sys_id: string;
  number: string;
  short_description: string;
  description: string;
  caller_name: string;
  caller_email: string;
  caller_vip: boolean;
  category: string;
  subcategory: string;
  urgency: UrgencyLevel;
  impact: ImpactLevel;
  priority: PriorityLevel;
  state: IncidentState;
  assignment_group: string;
  assigned_to: string;
  opened_at: string;
  resolved_at?: string;
  sla_hours_target: number;
  sla_elapsed_hours: number;
  sla_breached: boolean;
  ai_triage?: AITriageResult;
  work_notes: WorkNote[];
  flow_execution_id?: string;
}

export interface FlowStep {
  id: string;
  stepNumber: number;
  title: string;
  type: 'trigger' | 'ai_action' | 'decision' | 'assignment' | 'sla' | 'notification' | 'automation';
  summary: string;
  status: 'active' | 'draft';
  technicalDetails: string;
}

export interface FlowExecutionStepLog {
  stepId: string;
  stepTitle: string;
  status: 'SUCCESS' | 'SKIPPED' | 'FAILED';
  durationMs: number;
  inputSummary: string;
  outputSummary: string;
}

export interface FlowExecutionRecord {
  id: string;
  incidentNumber: string;
  startedAt: string;
  durationMs: number;
  status: 'SUCCESS' | 'RUNNING' | 'FAILED';
  stepsExecuted: FlowExecutionStepLog[];
}

export interface ATFStep {
  stepNumber: number;
  name: string;
  actionType: 'Create Record' | 'Execute Flow' | 'Validate Field' | 'Validate SLA' | 'Evaluate ACL';
  targetField?: string;
  expectedValue?: string;
  details: string;
}

export interface ATFTestCase {
  id: string;
  testNumber: string;
  name: string;
  description: string;
  table: string;
  sampleInput: {
    caller: string;
    short_description: string;
    description: string;
    vip?: boolean;
  };
  steps: ATFStep[];
  lastRunStatus: 'Passed' | 'Failed' | 'Not Run' | 'Running';
  lastRunTime?: string;
  durationMs?: number;
  logs: string[];
}

export interface UserRoleProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'itil' | 'approver_user' | 'requester';
  avatar: string;
  department: string;
  permissions: {
    canModifyPriority: boolean;
    canReassignGroup: boolean;
    canResolveIncident: boolean;
    canRunATF: boolean;
    canEditFlow: boolean;
    canAccessCSADoc: boolean;
  };
}
