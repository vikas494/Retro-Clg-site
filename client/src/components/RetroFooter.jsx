import React, { useState } from 'react';
import { Shield, Sparkles, HelpCircle, HardDrive } from 'lucide-react';
import { playClickSound } from '../utils/sound';

export default function RetroFooter({ onOpenAbout, activePortal, setActivePortal }) {
  const [startMenuOpen, setStartMenuOpen] = useState(false);

  const toggleStartMenu = () => {
    playClickSound();
    setStartMenuOpen(!startMenuOpen);
  };

  return (
    <footer className="mt-8 space-y-3 font-mono">
      {/* 90s Web Badges & Retro Footer Section */}
      <div className="win-bevel-outset p-3 text-center bg-[#c0c0c0] text-xs">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          {/* Visitor Counter */}
          <div className="win-bevel-inset bg-black text-green-400 px-3 py-1 font-mono font-bold text-xs tracking-widest flex items-center gap-1.5">
            <span className="text-[10px] text-gray-400">VISITOR #</span>
            <span className="bg-green-950 px-1 border border-green-700">0</span>
            <span className="bg-green-950 px-1 border border-green-700">0</span>
            <span className="bg-green-950 px-1 border border-green-700">4</span>
            <span className="bg-green-950 px-1 border border-green-700">8</span>
            <span className="bg-green-950 px-1 border border-green-700">2</span>
            <span className="bg-green-950 px-1 border border-green-700">9</span>
          </div>

          {/* Retro Web Badges */}
          <div className="win-bevel-outset bg-blue-900 text-white px-2 py-0.5 text-[10px] font-bold border border-black flex items-center gap-1">
            <span>🌐 NETSCAPE NAVIGATOR 4.0</span>
          </div>

          <div className="win-bevel-outset bg-amber-400 text-black px-2 py-0.5 text-[10px] font-bold border border-black flex items-center gap-1">
            <span>⚠️ 800 x 600 OPTIMIZED</span>
          </div>

          <div className="win-bevel-outset bg-purple-900 text-white px-2 py-0.5 text-[10px] font-bold border border-black flex items-center gap-1">
            <span>💾 TAILWIND CSS RETRO</span>
          </div>
        </div>

        <p className="text-[11px] text-gray-800">
          Government Engineering Hassan (GEH) • Affiliated to Visvesvaraya Technological University (VTU)
        </p>
        <p className="text-[10px] text-gray-600 mt-1">
          B.M. Road, Hassan - 573201, Karnataka, India | Developed by Vikas Malali | All Rights Reserved © 1995-2026
        </p>
      </div>

      {/* Retro Windows 95 Taskbar */}
      <div className="relative">
        {/* Start Menu Popup */}
        {startMenuOpen && (
          <div className="absolute bottom-10 left-0 w-64 win-bevel-outset bg-[#c0c0c0] shadow-2xl z-50 p-1 flex">
            {/* Blue Side Banner */}
            <div className="w-8 bg-gradient-to-t from-blue-900 via-blue-700 to-sky-500 flex items-end justify-center py-4">
              <span className="transform -rotate-90 text-white font-black text-xs tracking-widest whitespace-nowrap">
                GEH 95
              </span>
            </div>

            {/* Menu Items */}
            <div className="flex-1 p-1 space-y-1 text-xs font-mono text-black">
              <button
                onClick={() => {
                  playClickSound();
                  setActivePortal('student');
                  setStartMenuOpen(false);
                }}
                className={`w-full text-left px-2 py-1.5 flex items-center space-x-2 hover:bg-blue-800 hover:text-white ${
                  activePortal === 'student' ? 'bg-blue-100 font-bold' : ''
                }`}
              >
                <span>🎓</span>
                <span>Student Portal</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setActivePortal('admin');
                  setStartMenuOpen(false);
                }}
                className={`w-full text-left px-2 py-1.5 flex items-center space-x-2 hover:bg-blue-800 hover:text-white ${
                  activePortal === 'admin' ? 'bg-blue-100 font-bold' : ''
                }`}
              >
                <span>🛡️</span>
                <span>Administration Portal</span>
              </button>

              <div className="border-t border-gray-400 my-1"></div>

              <button
                onClick={() => {
                  playClickSound();
                  onOpenAbout();
                  setStartMenuOpen(false);
                }}
                className="w-full text-left px-2 py-1.5 flex items-center space-x-2 hover:bg-blue-800 hover:text-white"
              >
                <HelpCircle size={14} />
                <span>About GEH Portal...</span>
              </button>
            </div>
          </div>
        )}

        {/* Taskbar Bar */}
        <div className="win-bevel-outset bg-[#c0c0c0] p-1 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleStartMenu}
              className={`win-btn px-3 py-1 flex items-center space-x-1.5 text-xs font-mono font-bold ${
                startMenuOpen ? 'win-bevel-pressed bg-[#dfdfdf]' : 'bg-[#c0c0c0]'
              }`}
            >
              <div className="w-3.5 h-3.5 bg-gradient-to-br from-red-500 via-yellow-400 to-blue-500 border border-black flex items-center justify-center text-[7px] text-white font-black">
                G
              </div>
              <span>Start</span>
            </button>

            {/* Active window tab on taskbar */}
            <div className="win-bevel-pressed bg-[#dfdfdf] px-3 py-1 text-xs font-mono font-bold text-blue-900 flex items-center space-x-1.5">
              <span>🏛️</span>
              <span className="truncate max-w-[150px] sm:max-w-xs">
                {activePortal === 'student' ? 'Student Announcements' : 'Admin Console'}
              </span>
            </div>
          </div>

          {/* System Tray */}
          <div className="win-bevel-inset bg-[#dfdfdf] px-2.5 py-1 text-xs font-mono text-gray-800 flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-green-600 animate-pulse" title="Connected to GEH Server"></span>
            <span className="text-[11px] hidden sm:inline">56.6 Kbps</span>
            <span className="text-gray-400">|</span>
            <span className="font-bold">Hassan, KA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
