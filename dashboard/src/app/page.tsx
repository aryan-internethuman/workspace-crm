"use client";

import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, AreaChart, Area
} from 'recharts';
import { 
  Users, Activity, DollarSign, Target, 
  AlertTriangle, CheckCircle, Clock, Zap, Bot, Mail, ShieldAlert
} from 'lucide-react';

const revenueData = [
  { name: 'Mon', value: 4000 },
  { name: 'Tue', value: 3000 },
  { name: 'Wed', value: 6000 },
  { name: 'Thu', value: 8000 },
  { name: 'Fri', value: 12000 },
  { name: 'Sat', value: 15000 },
  { name: 'Sun', value: 18000 },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/20 blur-[120px]" />
      </div>

      <div className="relative z-10 p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
              Workspace Founder
            </h1>
            <p className="text-slate-400 mt-1">White Gloves CRM Collaboration Layer</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <Bot className="w-5 h-5 text-indigo-400" />
              <span className="text-sm font-medium">Aanya (Internet Human)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-2" />
            </div>
          </div>
        </header>

        {/* Overview Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            title="Revenue Recovered" 
            value="₹40,000" 
            icon={<DollarSign className="w-5 h-5 text-emerald-400" />} 
            trend="+12%" 
          />
          <MetricCard 
            title="Total Customers" 
            value="1,248" 
            icon={<Users className="w-5 h-5 text-indigo-400" />} 
            trend="+5%" 
          />
          <MetricCard 
            title="Open Escalations" 
            value="12" 
            icon={<AlertTriangle className="w-5 h-5 text-amber-400" />} 
            trend="-2" 
          />
          <MetricCard 
            title="Campaign ROI" 
            value="340%" 
            icon={<Target className="w-5 h-5 text-violet-400" />} 
            trend="+18%" 
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Chart */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl transition-all duration-300 hover:bg-white/[0.07]">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" /> Revenue Recovery Trend
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Internet Human Activity */}
          <div className="p-6 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-indigo-500/40">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-400" /> Aanya's Activity
            </h2>
            <div className="space-y-4">
              <ActivityItem 
                icon={<CheckCircle className="text-emerald-400" />} 
                title="Recovered Cart #9201" 
                time="10 mins ago" 
              />
              <ActivityItem 
                icon={<Mail className="text-violet-400" />} 
                title="Sent Welcome Campaign" 
                time="1 hr ago" 
              />
              <ActivityItem 
                icon={<ShieldAlert className="text-amber-400" />} 
                title="Escalated RTO Risk #110" 
                time="2 hrs ago" 
              />
              <ActivityItem 
                icon={<Clock className="text-indigo-400" />} 
                title="Followed up on #9112" 
                time="4 hrs ago" 
              />
            </div>
            <button className="mt-6 w-full py-2 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 transition border border-indigo-500/30 font-medium text-sm">
              View All Tasks
            </button>
          </div>
        </div>

        {/* Secondary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Health */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
            <h2 className="text-lg font-semibold mb-6">Customer Health</h2>
            <div className="space-y-4">
              <HealthRow label="Active Customers" value="85%" color="bg-emerald-500" />
              <HealthRow label="At Risk Customers" value="10%" color="bg-amber-500" />
              <HealthRow label="Churn Risk" value="5%" color="bg-red-500" />
              <HealthRow label="Repeat Purchase Rate" value="42%" color="bg-indigo-500" />
            </div>
          </div>

          {/* Campaign Performance */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
            <h2 className="text-lg font-semibold mb-6">Campaign Performance</h2>
            <div className="space-y-5">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-slate-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">₹1,24,500</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Conversion Rate</p>
                  <p className="text-2xl font-bold text-emerald-400">12.4%</p>
                </div>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div className="h-full bg-indigo-500 w-[60%]"></div>
                <div className="h-full bg-violet-500 w-[40%]"></div>
              </div>
              <p className="text-xs text-slate-400 flex justify-between">
                <span>WhatsApp (60%)</span>
                <span>Email (40%)</span>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Subcomponents
function MetricCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  const isPositive = trend.startsWith('+');
  return (
    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl hover:bg-white/10 transition group cursor-default">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-lg bg-white/5 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
          {trend}
        </span>
      </div>
      <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}

function ActivityItem({ icon, title, time }: { icon: React.ReactElement<{className?: string}>, title: string, time: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
        {React.cloneElement(icon, { className: "w-4 h-4" })}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-200">{title}</p>
        <p className="text-xs text-slate-400">{time}</p>
      </div>
    </div>
  );
}

function HealthRow({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-32 text-sm text-slate-300">{label}</div>
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: value }}></div>
      </div>
      <div className="w-12 text-right text-sm font-medium">{value}</div>
    </div>
  );
}
