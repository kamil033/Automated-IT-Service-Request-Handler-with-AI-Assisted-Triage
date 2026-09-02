import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Calendar, 
  Download, 
  Layers, 
  Filter,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { IncidentRecord } from '../types';

interface ReportsViewProps {
  incidents: IncidentRecord[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ incidents }) => {
  const [timeframe, setTimeframe] = useState<'today' | '7days' | '30days'>('7days');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Compute stats from current incidents pool
  const totalVolume = incidents.length + 138; // Include historic volume
  const openCount = incidents.filter((i) => i.state !== 'Resolved' && i.state !== 'Closed').length;
  const p1Count = incidents.filter((i) => i.priority === 1).length;
  const avgResolutionHours = 2.8;
  const slaCompliance = 98.4;
  const aiAccuracy = 96.2;

  // Category breakdown calculation
  const categoryCounts: Record<string, number> = {
    Network: 28,
    Security: 19,
    Hardware: 34,
    'Cloud & DB': 26,
    Software: 45,
    'Inquiry / Help': 18,
  };

  // Adjust slightly with current dynamic records
  incidents.forEach((inc) => {
    if (categoryCounts[inc.category] !== undefined) {
      categoryCounts[inc.category]++;
    }
  });

  const totalCatSum = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  const categoryColors: Record<string, string> = {
    Network: '#06b6d4', // cyan-500
    Security: '#f43f5e', // rose-500
    Hardware: '#f59e0b', // amber-500
    'Cloud & DB': '#8b5cf6', // purple-500
    Software: '#10b981', // emerald-500
    'Inquiry / Help': '#64748b', // slate-500
  };

  // Group MTTR comparison
  const groupMttr = [
    { group: 'SecOps Response', mttr: 1.2, target: 2.0, color: 'bg-rose-500' },
    { group: 'Network Infra', mttr: 2.4, target: 4.0, color: 'bg-cyan-500' },
    { group: 'Cloud Platform & DB', mttr: 3.1, target: 8.0, color: 'bg-purple-500' },
    { group: 'Hardware Asset', mttr: 5.6, target: 8.0, color: 'bg-amber-500' },
    { group: 'Service Desk Tier 1', mttr: 4.2, target: 24.0, color: 'bg-emerald-500' },
  ];

  // Daily volume time-series
  const dailyData = [
    { day: 'Mon', count: 24 },
    { day: 'Tue', count: 32 },
    { day: 'Wed', count: 29 },
    { day: 'Thu', count: 41 },
    { day: 'Fri', count: 38 },
    { day: 'Sat', count: 12 },
    { day: 'Sun', count: 9 },
  ];

  const maxDaily = Math.max(...dailyData.map((d) => d.count));

  // Compute Donut SVG parameters
  let cumulativeAngle = 0;
  const donutSlices = Object.entries(categoryCounts).map(([cat, count]) => {
    const fraction = count / totalCatSum;
    const angle = fraction * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    return {
      category: cat,
      count,
      percentage: Math.round(fraction * 100),
      color: categoryColors[cat] || '#64748b',
      startAngle,
      angle,
    };
  });

  return (
    <div className="space-y-5">
      {/* Top Banner & Timeframe Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-slate-100">
                  IT Service Operations & Triage Analytics Dashboard
                </h1>
                <span className="text-[10px] font-mono font-bold bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
                  sys_report
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Executive ITIL metrics: Request volume, MTTR resolution time, SLA compliance, and category distribution
              </p>
            </div>
          </div>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-md border border-slate-800 text-xs">
          <button
            onClick={() => setTimeframe('today')}
            className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
              timeframe === 'today' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeframe('7days')}
            className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
              timeframe === '7days' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeframe('30days')}
            className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
              timeframe === '30days' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* KPI Cards (6 Scorecards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Volume */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Requests
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-slate-100">{totalVolume}</span>
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3 h-3" />
              <span>+14%</span>
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block">Across all channels</span>
        </div>

        {/* Open Backlog */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Active Backlog
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-blue-400">{openCount}</span>
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center">
              <ArrowDownRight className="w-3 h-3" />
              <span>-6%</span>
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block">In Progress / New</span>
        </div>

        {/* Mean Time to Resolve */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Avg MTTR
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-emerald-400">{avgResolutionHours}h</span>
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center">
              <ArrowDownRight className="w-3 h-3" />
              <span>-22%</span>
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block">Target: &lt; 4.0 hours</span>
        </div>

        {/* AI Triage Accuracy */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            AI Triage Accuracy
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-purple-400">{aiAccuracy}%</span>
            <span className="text-[11px] font-semibold text-purple-300 flex items-center">
              <Sparkles className="w-3 h-3" />
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block">Zero re-routing hops</span>
        </div>

        {/* SLA Compliance */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            SLA Met Rate
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-cyan-400">{slaCompliance}%</span>
            <span className="text-[11px] font-semibold text-emerald-400">99.1%</span>
          </div>
          <span className="text-[10px] text-slate-400 block">Contractual task_sla</span>
        </div>

        {/* P1 Critical Count */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            P1 Major Incidents
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-rose-400">{p1Count}</span>
            <span className="text-[11px] font-semibold text-rose-400">Active</span>
          </div>
          <span className="text-[10px] text-slate-400 block">Immediate On-Call</span>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Chart 1: Category Breakdown (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Category Breakdown Donut
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">Total: {totalCatSum} tickets</span>
          </div>

          {/* SVG Donut Visual */}
          <div className="flex flex-col sm:flex-row items-center justify-around gap-4 pt-2">
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {donutSlices.map((slice, i) => {
                  const circumference = 2 * Math.PI * 36;
                  const strokeDash = (slice.percentage / 100) * circumference;
                  const strokeOffset = (slice.startAngle / 360) * circumference;

                  return (
                    <circle
                      key={i}
                      cx="50"
                      cy="50"
                      r="36"
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth="16"
                      strokeDasharray={`${strokeDash} ${circumference}`}
                      strokeDashoffset={-strokeOffset}
                      className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                      onMouseEnter={() => setHoveredCategory(slice.category)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    />
                  );
                })}
              </svg>
              {/* Inner Hole Label */}
              <div className="absolute text-center select-none">
                <span className="text-xs text-slate-400 block">Largest</span>
                <span className="text-sm font-bold text-slate-100">Software</span>
                <span className="text-[10px] text-emerald-400">26%</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-1.5 w-full text-xs">
              {donutSlices.map((slice, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredCategory(slice.category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`flex items-center justify-between p-1.5 rounded transition-colors ${
                    hoveredCategory === slice.category ? 'bg-slate-800' : ''
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="text-slate-300 font-medium">{slice.category}</span>
                  </div>
                  <div className="flex items-center space-x-2 font-mono">
                    <span className="text-slate-400">{slice.count}</span>
                    <span className="text-slate-200 font-semibold w-8 text-right">
                      {slice.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 2: Request Volume Over Time (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Daily Request Volume Intake (sys_history)
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">Past 7 Operational Days</span>
          </div>

          {/* Bar / Column Chart */}
          <div className="pt-4">
            <div className="h-44 flex items-end justify-between gap-3 px-2 border-b border-slate-800 pb-2">
              {dailyData.map((item, idx) => {
                const heightPercent = Math.round((item.count / maxDaily) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <span className="text-[10px] font-mono text-slate-400 group-hover:text-cyan-300 transition-colors">
                      {item.count}
                    </span>
                    <div className="w-full bg-slate-800 rounded-t h-32 flex items-end overflow-hidden">
                      <div
                        className="w-full bg-cyan-500/80 group-hover:bg-cyan-400 rounded-t transition-all duration-300"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 px-1">
              <span>Intake Source: Self-Service Portal (58%)</span>
              <span>Inbound Email / API: (42%)</span>
            </div>
          </div>
        </div>

        {/* Chart 3: Resolution Time (MTTR) by Assignment Group (Full Width) */}
        <div className="lg:col-span-12 bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Mean Time to Resolution (MTTR) vs. SLA Targets by Assignment Group
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">All teams operating within contractual SLA bounds</span>
          </div>

          <div className="space-y-3.5 pt-1">
            {groupMttr.map((item, idx) => {
              const maxScale = 24;
              const actualWidth = Math.round((item.mttr / maxScale) * 100);
              const targetWidth = Math.round((item.target / maxScale) * 100);

              return (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{item.group}</span>
                    <div className="flex items-center space-x-3 font-mono text-[11px]">
                      <span className="text-emerald-400 font-bold">
                        Actual: {item.mttr} hrs
                      </span>
                      <span className="text-slate-400">
                        Target: {item.target} hrs
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full bg-slate-950 rounded-full h-3 relative overflow-hidden border border-slate-800">
                    {/* Actual MTTR */}
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-500`}
                      style={{ width: `${actualWidth}%` }}
                    />
                    {/* Target Marker */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-rose-400 z-10"
                      style={{ left: `${targetWidth}%` }}
                      title={`Contractual SLA Target: ${item.target}h`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
