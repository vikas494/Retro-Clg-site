import React from 'react';
import { HelpCircle, CheckCircle, Database, Shield, Radio, Sparkles } from 'lucide-react';
import { playClickSound } from '../utils/sound';

export default function AboutModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 overflow-y-auto">
      <div className="w-full max-w-lg win-bevel-outset bg-[#c0c0c0] p-1 shadow-2xl my-6">
        <div className="win-titlebar text-xs font-mono">
          <div className="flex items-center space-x-1.5">
            <HelpCircle size={14} className="text-yellow-300" />
            <span>About Government Engineering Hassan Portal</span>
          </div>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="win-btn px-1.5 py-0.2 bg-[#c0c0c0] text-red-700 font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-4 bg-[#dfdfdf] border-t border-b border-gray-400 font-mono text-xs space-y-3">
          <div className="p-3 bg-white win-bevel-inset flex items-start space-x-3">
            <div className="w-10 h-10 bg-blue-900 text-yellow-300 font-black flex items-center justify-center text-sm border border-black shrink-0">
              GEH
            </div>
            <div>
              <h4 className="font-bold text-sm text-blue-900">Government Engineering Hassan</h4>
              <p className="text-[11px] text-gray-600">
                Official Campus Notification & Bulletin System v1.99
              </p>
            </div>
          </div>

          <div className="space-y-1.5 text-gray-800">
            <p className="font-bold text-black">🎯 Project Architecture & Highlights:</p>
            <ul className="list-disc pl-5 space-y-1 text-[11px]">
              <li><b>Frontend:</b> React + Vite with Tailwind CSS retro 90s design system, authentic Windows bevels, CRT scanlines, and Web Audio synthesizers.</li>
              <li><b>Backend:</b> Node.js + Express with modular REST endpoints.</li>
              <li><b>Database:</b> SQLite (`better-sqlite3`) with schema, audit trails, and documented SQL queries (`server/queries.sql`).</li>
              <li><b>Supported Branches:</b> EC, AI&ML, CIVIL, Mech, css, and General.</li>
              <li><b>Dual Portal:</b> Instant open access for students; token-authenticated access for administrators.</li>
              <li><b>Student Upvotes:</b> Real-time like counts that dynamically boost notice priority across campus.</li>
              <li><b>Branch Sorting:</b> Multi-criteria sorting according to academic branches, priorities, and popularity.</li>
            </ul>
          </div>

          <div className="p-2 bg-blue-50 border border-blue-300 text-[11px] text-blue-950 win-bevel-inset">
            <b>👨‍💻 Developer:</b>
            <div className="mt-0.5 font-bold text-blue-900">Vikas Malali</div>
          </div>

          <div className="p-2.5 bg-yellow-50 border border-yellow-400 text-[11px] text-yellow-950 win-bevel-inset">
            <b>🔑 Default Admin Credentials:</b>
            <div className="mt-0.5">Username: <code className="bg-yellow-200 px-1 py-0.5 font-bold">admin</code></div>
            <div>Password: <code className="bg-yellow-200 px-1 py-0.5 font-bold">admin123</code></div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="win-btn win-btn-accent px-5 py-1.5 text-xs font-bold font-mono"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
