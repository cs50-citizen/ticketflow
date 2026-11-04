import React from 'react';
import { X, Server, Database, Cloud, Shield, CheckCircle2, ExternalLink } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition p-1"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">TicketFlow: End-to-End Architecture</h2>
            <p className="text-xs text-slate-400">
              Satisfies JD requirements 1 (Java Microservice) + 2 (React Full-Stack) + 3 (AWS Cloud & DevOps)
            </p>
          </div>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-sm mb-2">
              <Server className="h-4 w-4" />
              <span>1. Java Microservice</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Java 21 LTS + Spring Boot 3.3</li>
              <li>Spring Security 6 (Stateless JWT)</li>
              <li>Zero-Oversell Atomic DB Deduction</li>
              <li>Spring Actuator &amp; Prometheus</li>
              <li>Clean Domain-Driven Design (DDD)</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center space-x-2 text-purple-400 font-semibold text-sm mb-2">
              <Database className="h-4 w-4" />
              <span>2. Modern Full-Stack</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>React 19 + TypeScript + Vite</li>
              <li>Tailwind CSS + Lucide React</li>
              <li>PostgreSQL 16 &amp; Redis 7</li>
              <li>Flyway Database Migrations (V1, V2)</li>
              <li>10-min reservation auto-hold &amp; sweep</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm mb-2">
              <Cloud className="h-4 w-4" />
              <span>3. AWS Cloud &amp; DevOps</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Terraform IaC (VPC, ECS, RDS, S3)</li>
              <li>AWS ECS Fargate Containerization</li>
              <li>GitHub Actions CI/CD Pipeline</li>
              <li>Docker Multi-stage minimal images</li>
              <li>k6 load testing script (800 RPS)</li>
            </ul>
          </div>
        </div>

        {/* Technical Concurrency Highlight */}
        <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 mb-6">
          <div className="flex items-center space-x-2 text-sm font-semibold text-indigo-300 mb-2">
            <Shield className="h-4 w-4 text-indigo-400" />
            <span>Concurrency Engineering: The Zero-Oversell Formula</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            In flash ticketing rush, standard read-then-write creates critical race conditions. TicketFlow enforces atomic conditional updates at the persistence boundary:
          </p>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto">
            UPDATE ticket_tiers SET available_capacity = available_capacity - :qty <br />
            WHERE id = :tierId AND available_capacity &gt;= :qty;
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Verified in BookingConcurrencyTest: 50 simultaneous threads, 10 tickets, 0 oversell, 100% test pass rate.</span>
          </div>
        </div>

        {/* Live Endpoints Quick Access */}
        <div className="border-t border-slate-800 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            <span>Backend running at: </span>
            <code className="bg-slate-800 px-2 py-0.5 rounded text-indigo-300">http://localhost:8080</code>
          </div>
          <div className="flex items-center space-x-3">
            <a
              href="http://localhost:8080/swagger-ui.html"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 font-medium"
            >
              <span>Swagger / OpenAPI UI</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <a
              href="http://localhost:8080/actuator/prometheus"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 font-medium"
            >
              <span>Prometheus Metrics</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
