import React from 'react';
import { 
  Printer, Share2, Heart, X, Pin, Clock, AlertTriangle, 
  Building, CheckCircle2 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClickSound, playUpvoteSound } from '../utils/sound';

export default function NoticeDetailModal({ item, onClose, onLike, isLiked }) {
  if (!item) return null;

  const handlePrint = () => {
    playClickSound();
    window.print();
  };

  const handleCopy = () => {
    playClickSound();
    const text = `[GEH Official Bulletin]\nTitle: ${item.title}\nBranch: ${item.branch}\nPriority: ${item.priority}\nPublished: ${item.date_published}\n\n${item.description}\n\nIssued by: ${item.publisher_name}\nGovernment Engineering Hassan`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      alert('📋 Notice contents copied to clipboard!');
    }
  };

  const handleLike = (e) => {
    if (!isLiked) {
      playUpvoteSound();
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        origin: { x, y },
        particleCount: 45,
        spread: 70
      });
    } else {
      playClickSound();
    }
    if (onLike) {
      onLike(item.id);
    }
  };

  const isExpired = () => {
    if (item.is_permanent) return false;
    if (!item.date_expiring) return false;
    const today = new Date().toISOString().split('T')[0];
    return item.date_expiring < today;
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 overflow-y-auto">
      <div className="w-full max-w-3xl win-bevel-outset bg-[#c0c0c0] p-1 shadow-2xl my-6">
        {/* Modal Window Title Bar */}
        <div className="win-titlebar text-xs font-mono">
          <div className="flex items-center space-x-2">
            <Building size={14} className="text-yellow-300" />
            <span className="font-bold">OFFICIAL BULLETIN VIEWER - [REF: GEH/NOT/{item.id}]</span>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="win-btn px-2 py-0.5 bg-[#c0c0c0] text-red-700 font-bold leading-none hover:bg-red-600 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>

        {/* Modal Window Toolbar */}
        <div className="bg-[#dfdfdf] px-3 py-1.5 border-b border-gray-400 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="win-btn px-2.5 py-1 bg-white flex items-center gap-1 hover:bg-gray-100"
            >
              <Printer size={13} />
              <span>Print Circular</span>
            </button>

            <button
              onClick={handleCopy}
              className="win-btn px-2.5 py-1 bg-white flex items-center gap-1 hover:bg-gray-100"
            >
              <Share2 size={13} />
              <span>Copy Notice Text</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleLike}
              className={`win-btn px-3 py-1 flex items-center gap-1.5 font-bold ${
                isLiked ? 'bg-rose-100 text-rose-700 border-rose-500 win-bevel-pressed' : 'bg-white text-gray-800'
              }`}
            >
              <Heart size={14} className={isLiked ? 'fill-rose-600 text-rose-600' : 'text-gray-500'} />
              <span>Upvote ({item.likes_count})</span>
            </button>
          </div>
        </div>

        {/* Modal Body / Official College Letterhead Style */}
        <div className="p-6 md:p-8 bg-white border-t border-b border-gray-400 font-mono print:p-0">
          {/* Institutional Letterhead Header */}
          <div className="border-b-2 border-black pb-4 mb-4 text-center">
            <div className="text-[11px] font-bold tracking-widest text-gray-700 uppercase">
              Government of Karnataka | Directorate of Technical Education
            </div>
            <h2 className="text-xl md:text-2xl font-black text-[#000080] uppercase tracking-wide my-1">
              Government Engineering Hassan
            </h2>
            <div className="text-xs text-gray-600">
              B.M. Road, Hassan, Karnataka - 573201 | Phone: 08172-240444 | www.geh.ac.in
            </div>
          </div>

          {/* Reference and Dates Bar */}
          <div className="flex flex-wrap justify-between items-center text-xs border-b border-dashed border-gray-300 pb-3 mb-4">
            <div>
              <span className="text-gray-600">REF NO:</span> <b className="text-black">GEH/ANNOUNCE/2026/{item.id}</b>
            </div>
            <div>
              <span className="text-gray-600">DATE ISSUED:</span> <b className="text-black">{item.date_published}</b>
            </div>
          </div>

          {/* Badges / Classification */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-blue-900 text-white px-2.5 py-1 text-xs font-bold border border-black">
              DEPARTMENT: {item.branch === 'General' ? 'ALL BRANCHES (GENERAL)' : `${item.branch} BRANCH`}
            </span>

            <span className={`px-2.5 py-1 text-xs font-bold border border-black ${
              item.priority === 'Urgent'
                ? 'bg-red-600 text-white'
                : item.priority === 'High'
                ? 'bg-amber-400 text-black'
                : item.priority === 'Medium'
                ? 'bg-blue-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}>
              PRIORITY: {item.priority.toUpperCase()}
            </span>

            {item.is_permanent ? (
              <span className="bg-purple-100 text-purple-900 border border-purple-400 px-2.5 py-1 text-xs font-bold flex items-center gap-1">
                <Pin size={12} />
                PERMANENT CAMPUS NOTICE
              </span>
            ) : item.date_expiring ? (
              <span className={`px-2.5 py-1 text-xs border flex items-center gap-1 font-bold ${
                isExpired() ? 'bg-red-100 text-red-900 border-red-500' : 'bg-yellow-100 text-yellow-900 border-yellow-500'
              }`}>
                <Clock size={12} />
                EXPIRATION: {item.date_expiring} {isExpired() && '(EXPIRED)'}
              </span>
            ) : null}

            <span className="bg-gray-100 text-gray-800 border border-gray-400 px-2 py-1 text-xs">
              CATEGORY: {item.category || 'General Notice'}
            </span>
          </div>

          {/* Notice Title */}
          <div className="my-5">
            <h1 className="text-lg md:text-xl font-black text-black uppercase underline decoration-2 underline-offset-4 leading-snug">
              {item.title}
            </h1>
          </div>

          {/* Notice Detailed Content */}
          <div className="text-xs md:text-sm text-gray-900 leading-relaxed whitespace-pre-line space-y-3 p-4 bg-gray-50 border border-gray-300 font-mono">
            {item.description}
          </div>

          {/* Signatory / Authority Seal Box */}
          <div className="mt-8 pt-6 border-t border-gray-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-xs text-gray-500">
              <div>Authenticity Verification: Verified Digital Copy</div>
              <div>Student Community Priority Upvotes: <b>{item.likes_count}</b></div>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold text-gray-900 uppercase">
                {item.publisher_name}
              </div>
              <div className="text-[11px] text-gray-600">
                Government Engineering Hassan
              </div>
              <div className="text-[10px] text-gray-400 italic mt-1">
                [Digitally Endorsed by College Administration]
              </div>
            </div>
          </div>
        </div>

        {/* Modal Window Footer */}
        <div className="p-3 bg-[#dfdfdf] flex items-center justify-between border-t border-gray-400 text-xs font-mono">
          <span className="text-gray-600">Government Engineering Hassan Campus Information System</span>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="win-btn px-4 py-1.5 bg-white font-bold text-gray-800 hover:bg-gray-100"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
