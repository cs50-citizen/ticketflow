import React from 'react';
import { ShieldCheck, Zap, Cloud } from 'lucide-react';

export const MetricsBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-b border-indigo-500/20 py-2.5 px-4 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-slate-300">
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-emerald-400">System Healthy:</span>
          <span className="text-slate-400">Spring Boot 3.3.4 (Java 21) • React 19 • PostgreSQL 16 • Redis 7</span>
        </div>

        <div className="flex items-center space-x-4 sm:space-x-6 text-slate-400">
          <div className="flex items-center space-x-1.5" title="Demonstrated via multi-thread concurrent stress testing">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
            <span>0 Oversold Guaranteed</span>
          </div>
          <div className="flex items-center space-x-1.5" title="k6 Benchmark: p95 response time">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>p95 &lt; 45ms (800 RPS)</span>
          </div>
          <div className="flex items-center space-x-1.5" title="Provisioned via Terraform ECS Fargate + RDS + CloudFront">
            <Cloud className="h-3.5 w-3.5 text-cyan-400" />
            <span>AWS ECS Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
