import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Monitor, Shield, GraduationCap, Sparkles, Clock } from 'lucide-react';
import { playClickSound, toggleSound } from '../utils/sound';

export default function Header({
  activePortal,
  setActivePortal,
  theme,
  setTheme,
  crtEffect,
  setCrtEffect,
  soundMuted,
  setSoundMuted,
  announcements = []
}) {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePortalSwitch = (portal) => {
    playClickSound();
    setActivePortal(portal);
  };

  const handleSoundToggle = () => {
    const newState = !soundMuted;
    setSoundMuted(newState);
    toggleSound(!newState);
    if (!newState) {
      playClickSound();
    }
  };

  const handleThemeChange = (newTheme) => {
    playClickSound();
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const urgentNotices = announcements.filter(a => a.priority === 'Urgent');
  const marqueeText = urgentNotices.length > 0
    ? urgentNotices.map(a => `[${a.branch}] ${a.title}`).join('  ★★★  ')
    : 'Welcome to Government Engineering Hassan Notice Board  ★★★  All branches (EC, AI&ML, CIVIL, Mech, css)  ★★★  Check semester schedules and announcements below!';

  return (
    <header className="mb-4">
      {/* Top Windows 95 System Title Bar */}
      <div className="win-bevel-outset p-1 mb-2">
        <div className="win-titlebar text-xs md:text-sm font-mono flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="bg-yellow-400 text-black px-1 font-bold text-xs">GEH.EXE</span>
            <span className="font-bold tracking-wider">Government Engineering Hassan - Bulletin Board v1.99</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 text-xs">
              <Clock size={13} />
              <span>{time}</span>
            </div>
            {/* Win95 Window control buttons */}
            <div className="flex space-x-1">
              <button className="win-btn px-1.5 py-0.5 text-[10px] leading-none bg-[#c0c0c0] text-black">_</button>
              <button className="win-btn px-1.5 py-0.5 text-[10px] leading-none bg-[#c0c0c0] text-black">□</button>
              <button className="win-btn px-1.5 py-0.5 text-[10px] leading-none bg-[#c0c0c0] text-black text-red-700 font-bold">×</button>
            </div>
          </div>
        </div>

        {/* Institution Brand & Hero Section */}
        <div className="p-3 md:p-4 bg-[#dfdfdf] flex flex-col md:flex-row items-center justify-between gap-3 border-t border-b border-gray-400">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 md:w-16 md:h-16 win-bevel-inset flex items-center justify-center bg-white p-1 shrink-0">
              <div className="w-full h-full bg-blue-900 flex flex-col items-center justify-center text-white border border-yellow-400">
                <span className="text-[10px] font-bold text-yellow-300">GEC</span>
                <span className="text-[9px] font-mono leading-none">HASSAN</span>
                <span className="text-[8px] text-green-300">ESTD</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-3xl font-black tracking-tight text-[#000080] uppercase font-mono">
                  Government Engineering Hassan
                </h1>
                <span className="hidden sm:inline-block bg-yellow-300 border border-black px-1.5 py-0.5 text-[10px] font-bold font-mono animate-blink">
                  OFFICIAL
                </span>
              </div>
              <p className="text-xs md:text-sm text-gray-700 font-mono">
                Affiliated to VTU, Belagavi | Approved by AICTE, New Delhi | Hassan, Karnataka - 573201
              </p>
              <div className="flex flex-wrap gap-1 mt-1 text-[11px] font-mono">
                <span className="bg-blue-100 text-blue-900 px-1 border border-blue-400">EC</span>
                <span className="bg-purple-100 text-purple-900 px-1 border border-purple-400">AI&ML</span>
                <span className="bg-amber-100 text-amber-900 px-1 border border-amber-400">CIVIL</span>
                <span className="bg-red-100 text-red-900 px-1 border border-red-400">Mech</span>
                <span className="bg-emerald-100 text-emerald-900 px-1 border border-emerald-400">css</span>
                <span className="bg-gray-200 text-gray-800 px-1 border border-gray-500">General</span>
              </div>
            </div>
          </div>

          {/* Retro Preferences Toolbar */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Theme selector */}
            <div className="flex items-center win-bevel-inset px-2 py-1 bg-white text-xs font-mono">
              <span className="mr-1 text-gray-600">Theme:</span>
              <select
                value={theme}
                onChange={(e) => handleThemeChange(e.target.value)}
                className="bg-transparent text-xs font-mono font-bold focus:outline-none cursor-pointer"
              >
                <option value="win95">Windows 95</option>
                <option value="cyberpunk">Cyber Neon</option>
                <option value="matrix">Matrix CRT</option>
                <option value="hotdog">Hotdog Stand</option>
              </select>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={handleSoundToggle}
              title={soundMuted ? 'Turn Sound ON' : 'Mute Sound'}
              className="win-btn px-2.5 py-1 text-xs flex items-center gap-1 font-mono"
            >
              {soundMuted ? <VolumeX size={14} className="text-red-600" /> : <Volume2 size={14} className="text-green-700" />}
              <span>{soundMuted ? 'Muted' : 'Audio'}</span>
            </button>

            {/* CRT Toggle */}
            <button
              onClick={() => {
                playClickSound();
                setCrtEffect(!crtEffect);
              }}
              title="Toggle CRT Monitor Scanlines"
              className={`win-btn px-2.5 py-1 text-xs flex items-center gap-1 font-mono ${
                crtEffect ? 'bg-green-100 font-bold border-green-700' : ''
              }`}
            >
              <Monitor size={14} />
              <span>CRT {crtEffect ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* 90s News Marquee Ticker */}
        <div className="win-bevel-inset bg-black text-yellow-300 py-1 px-2 overflow-hidden flex items-center font-mono text-xs md:text-sm">
          <span className="bg-red-600 text-white font-bold px-2 py-0.5 text-[11px] shrink-0 mr-2 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-white animate-ping"></span>
            FLASH NEWS
          </span>
          <div className="whitespace-nowrap overflow-hidden w-full">
            <span className="animate-marquee font-bold tracking-wide">
              {marqueeText}
            </span>
          </div>
        </div>

        {/* DUAL PORTAL NAVIGATION BAR */}
        <div className="flex bg-[#c0c0c0] pt-2 px-2 border-b border-gray-400">
          <button
            onClick={() => handlePortalSwitch('student')}
            className={`win-btn px-5 py-2 font-mono text-xs md:text-sm flex items-center gap-2 border-b-0 rounded-t mr-1 ${
              activePortal === 'student'
                ? 'bg-white font-black text-blue-900 border-t-2 border-t-blue-700 relative top-[1px]'
                : 'bg-[#d4d0c8] text-gray-700 hover:bg-white'
            }`}
          >
            <GraduationCap size={16} className="text-blue-600" />
            <span>STUDENT INTERFACE</span>
            <span className="text-[10px] bg-green-200 text-green-900 px-1 border border-green-500 font-normal">
              Direct / No Login
            </span>
          </button>

          <button
            onClick={() => handlePortalSwitch('admin')}
            className={`win-btn px-5 py-2 font-mono text-xs md:text-sm flex items-center gap-2 border-b-0 rounded-t ${
              activePortal === 'admin'
                ? 'bg-white font-black text-red-900 border-t-2 border-t-red-700 relative top-[1px]'
                : 'bg-[#d4d0c8] text-gray-700 hover:bg-white'
            }`}
          >
            <Shield size={16} className="text-red-600" />
            <span>ADMINISTRATION INTERFACE</span>
            <span className="text-[10px] bg-yellow-200 text-yellow-900 px-1 border border-yellow-600 font-normal">
              Logon Required
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
