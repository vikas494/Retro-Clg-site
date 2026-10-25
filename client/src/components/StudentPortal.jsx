import React, { useState } from 'react';
import { 
  Search, Filter, ArrowUpDown, Heart, Calendar, Clock, 
  ExternalLink, Share2, Sparkles, AlertTriangle, CheckCircle, 
  BookOpen, Pin, RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClickSound, playUpvoteSound } from '../utils/sound';

export default function StudentPortal({
  announcements,
  loading,
  searchTerm,
  setSearchTerm,
  selectedBranch,
  setSelectedBranch,
  selectedPriority,
  setSelectedPriority,
  sortOption,
  setSortOption,
  includeExpired,
  likedMap = {},
  onLike,
  onOpenDetail,
  onRefresh
}) {
  const branches = [
    { id: 'All', label: 'All Branches', badge: 'ALL' },
    { id: 'General', label: 'General (All)', badge: 'GEN' },
    { id: 'EC', label: 'Electronics & Comm (EC)', badge: 'EC' },
    { id: 'AI&ML', label: 'Artificial Intel & ML', badge: 'AI&ML' },
    { id: 'CIVIL', label: 'Civil Engineering', badge: 'CIVIL' },
    { id: 'Mech', label: 'Mechanical Engg', badge: 'MECH' },
    { id: 'css', label: 'Computer Science (css)', badge: 'CSS' },
  ];

  const priorities = [
    { id: 'All', label: 'All Priorities', color: 'bg-gray-200 text-gray-800' },
    { id: 'Urgent', label: '🚨 Urgent', color: 'bg-red-600 text-white font-bold' },
    { id: 'High', label: '⚠️ High', color: 'bg-amber-500 text-black font-semibold' },
    { id: 'Medium', label: '📌 Medium', color: 'bg-blue-600 text-white' },
    { id: 'Low', label: 'ℹ️ Low', color: 'bg-emerald-600 text-white' },
  ];

  const handleLikeClick = async (e, item) => {
    e.stopPropagation();
    const isCurrentlyLiked = Boolean(likedMap[item.id]);

    if (!isCurrentlyLiked) {
      playUpvoteSound();
      // Trigger retro confetti near button only when upvoting
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        origin: { x, y },
        particleCount: 35,
        spread: 60,
        colors: ['#ffff00', '#ff0000', '#00ff00', '#0000ff', '#ffffff']
      });
    } else {
      // Removing upvote: play subtle click
      playClickSound();
    }

    if (onLike) {
      await onLike(item.id);
    }
  };

  const handleShare = (e, item) => {
    e.stopPropagation();
    playClickSound();
    const shareText = `[GEH Notice] ${item.title} - ${item.branch} Branch (Priority: ${item.priority})`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${shareText}\n${window.location.origin}`);
      alert('📋 Notice bulletin copied to clipboard for sharing!');
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Urgent':
        return <span className="bg-red-600 text-white px-2 py-0.5 text-xs font-bold border border-black animate-blink">🚨 URGENT</span>;
      case 'High':
        return <span className="bg-amber-400 text-black px-2 py-0.5 text-xs font-bold border border-black">⚠️ HIGH PRIORITY</span>;
      case 'Medium':
        return <span className="bg-blue-600 text-white px-2 py-0.5 text-xs font-semibold border border-black">📌 MEDIUM</span>;
      case 'Low':
        return <span className="bg-emerald-600 text-white px-2 py-0.5 text-xs font-semibold border border-black">ℹ️ INFO / LOW</span>;
      default:
        return <span className="bg-gray-400 text-black px-2 py-0.5 text-xs border border-black">{priority}</span>;
    }
  };

  const getBranchBadge = (branch) => {
    const map = {
      General: 'bg-gray-700 text-white',
      EC: 'bg-blue-700 text-white',
      'AI&ML': 'bg-purple-700 text-white',
      CIVIL: 'bg-amber-800 text-white',
      Mech: 'bg-red-700 text-white',
      css: 'bg-emerald-700 text-white'
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-mono font-bold border border-black ${map[branch] || 'bg-black text-white'}`}>
        BRANCH: {branch}
      </span>
    );
  };

  const isExpired = (item) => {
    if (item.is_permanent) return false;
    if (!item.date_expiring) return false;
    const today = new Date().toISOString().split('T')[0];
    return item.date_expiring < today;
  };

  return (
    <div className="space-y-4">
      {/* Search, Filter & Control Toolbar in 90s Inset Window */}
      <div className="win-bevel-outset p-3">
        <div className="win-titlebar text-xs font-mono mb-2">
          <span>🔍 BULLETIN QUERY & EXPLORER (SEARCH / FILTER / SORT)</span>
          <span className="text-[11px] text-yellow-300">STUDENT ACCESS: FREE</span>
        </div>

        {/* Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-3">
          <div className="md:col-span-6 flex items-center win-bevel-inset bg-white px-2 py-1">
            <Search size={16} className="text-gray-500 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search announcements by title, keyword, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs md:text-sm font-mono focus:outline-none bg-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs text-gray-500 hover:text-black font-bold px-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort By Dropdown - Highlights Sorting according to branch as required! */}
          <div className="md:col-span-4 flex items-center win-bevel-inset bg-white px-2 py-1">
            <ArrowUpDown size={16} className="text-gray-600 mr-2 shrink-0" />
            <span className="text-xs font-mono text-gray-600 mr-1 shrink-0">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => {
                playClickSound();
                setSortOption(e.target.value);
              }}
              className="w-full text-xs md:text-sm font-mono font-bold bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="branch">🗂️ Sort according to Branch (General → EC → AI&ML → CIVIL → Mech → css)</option>
              <option value="likes">🔥 Sort by Likes / Popularity (Highest First)</option>
              <option value="priority">🚨 Sort by Priority (Urgent → High → Medium → Low)</option>
              <option value="newest">📅 Sort by Date Published (Newest First)</option>
              <option value="oldest">🕰️ Sort by Date Published (Oldest First)</option>
            </select>
          </div>

          {/* Refresh & Expired Toggle */}
          <div className="md:col-span-2 flex items-center gap-1">
            <button
              onClick={() => {
                playClickSound();
                onRefresh();
              }}
              className="win-btn flex-1 py-1.5 px-2 text-xs font-mono flex items-center justify-center gap-1"
              title="Refresh Bulletin Board"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Branch Filter Tabs */}
        <div className="mb-2">
          <div className="text-[11px] font-mono font-bold text-gray-700 mb-1 flex items-center gap-1">
            <Filter size={12} />
            <span>FILTER BY BRANCH:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {branches.map((b) => {
              const active = selectedBranch === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => {
                    playClickSound();
                    setSelectedBranch(b.id);
                  }}
                  className={`win-btn text-xs font-mono px-2.5 py-1 ${
                    active
                      ? 'bg-blue-900 text-white font-bold win-bevel-pressed'
                      : 'bg-[#dfdfdf] text-black hover:bg-white'
                  }`}
                >
                  <span className="font-bold mr-1">[{b.badge}]</span>
                  <span>{b.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Priority Filter and Expired Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-gray-300">
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[11px] font-mono font-bold text-gray-700 mr-1">PRIORITY:</span>
            {priorities.map((p) => {
              const active = selectedPriority === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    playClickSound();
                    setSelectedPriority(p.id);
                  }}
                  className={`win-btn text-xs font-mono px-2 py-0.5 ${
                    active
                      ? 'bg-black text-white font-bold win-bevel-pressed'
                      : 'bg-[#e0e0e0] text-gray-800'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <label className="flex items-center space-x-1.5 text-xs font-mono cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeExpired}
              onChange={(e) => {
                playClickSound();
                setIncludeExpired(e.target.checked);
              }}
              className="accent-blue-700"
            />
            <span className="text-gray-800">Show Expired / Archived Notices</span>
          </label>
        </div>
      </div>

      {/* Results Header Info Bar */}
      <div className="win-bevel-inset bg-white p-2 text-xs font-mono flex items-center justify-between">
        <div>
          Showing <span className="font-bold text-blue-900">{announcements.length}</span> announcement(s)
          {selectedBranch !== 'All' && <span> for branch: <b className="text-red-700">{selectedBranch}</b></span>}
          {selectedPriority !== 'All' && <span> with priority: <b>{selectedPriority}</b></span>}
        </div>
        <div className="text-gray-600 text-[11px]">
          Tip: Click ❤️ UPVOTE to boost campus notice priority!
        </div>
      </div>

      {/* Empty State */}
      {announcements.length === 0 && !loading && (
        <div className="win-bevel-outset p-8 text-center bg-[#dfdfdf]">
          <div className="max-w-md mx-auto space-y-3 font-mono">
            <div className="text-4xl">📂</div>
            <h3 className="text-base font-bold text-gray-900 uppercase">
              No matching bulletins found
            </h3>
            <p className="text-xs text-gray-600">
              There are no announcements currently matching your search query or branch filter criteria.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedBranch('All');
                setSelectedPriority('All');
                setIncludeExpired(true);
              }}
              className="win-btn px-4 py-2 text-xs font-bold text-blue-900 bg-white"
            >
              Reset Filters & Show All
            </button>
          </div>
        </div>
      )}

      {/* Announcement Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {announcements.map((item) => {
          const expired = isExpired(item);
          const hasLiked = likedMap[item.id];

          return (
            <div
              key={item.id}
              onClick={() => onOpenDetail(item)}
              className={`win-bevel-outset flex flex-col justify-between transition-all duration-150 cursor-pointer hover:shadow-lg ${
                expired ? 'opacity-70 bg-gray-300' : 'bg-[#c0c0c0]'
              }`}
            >
              {/* Window Title Bar */}
              <div className="win-titlebar text-xs font-mono">
                <div className="flex items-center space-x-1.5 truncate">
                  <span className="font-bold">#NOTICE-{item.id}</span>
                  <span>|</span>
                  <span className="truncate">{item.category || 'General'}</span>
                </div>
                <div className="flex items-center space-x-1.5 shrink-0">
                  <span className="text-[11px] font-mono text-yellow-200">
                    {item.date_published}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3 bg-white flex-1 flex flex-col justify-between border-t border-b border-gray-400">
                <div>
                  {/* Badges row */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    {getBranchBadge(item.branch)}
                    {getPriorityBadge(item.priority)}
                    {item.is_permanent ? (
                      <span className="bg-purple-100 text-purple-900 border border-purple-400 px-1.5 py-0.5 text-[11px] font-mono font-bold flex items-center gap-1">
                        <Pin size={11} />
                        PERMANENT NOTICE
                      </span>
                    ) : item.date_expiring ? (
                      <span className={`px-1.5 py-0.5 text-[11px] font-mono border flex items-center gap-1 ${
                        expired
                          ? 'bg-red-100 text-red-900 border-red-500 font-bold'
                          : 'bg-yellow-100 text-yellow-900 border-yellow-500'
                      }`}>
                        <Clock size={11} />
                        {expired ? `EXPIRED on ${item.date_expiring}` : `Expires: ${item.date_expiring}`}
                      </span>
                    ) : null}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold font-mono text-blue-900 leading-snug mb-2 hover:underline">
                    {item.title}
                  </h3>

                  {/* Description Snippet */}
                  <p className="text-xs font-mono text-gray-700 line-clamp-3 leading-relaxed mb-3">
                    {item.description}
                  </p>
                </div>

                {/* Publisher info */}
                <div className="pt-2 border-t border-dashed border-gray-300 text-[11px] font-mono text-gray-600 flex items-center justify-between">
                  <span>Issued By: <b className="text-black">{item.publisher_name}</b></span>
                  <span className="text-blue-700 hover:underline flex items-center gap-0.5">
                    Read more <ExternalLink size={10} />
                  </span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-2 bg-[#dfdfdf] flex items-center justify-between gap-2 border-t border-gray-400">
                {/* UPVOTE / LIKE BUTTON (STUDENTS BOOST PRIORITY) */}
                <button
                  onClick={(e) => handleLikeClick(e, item)}
                  title="Upvote this notice to boost its campus priority!"
                  className={`win-btn px-3 py-1 text-xs font-mono flex items-center gap-1.5 transition-transform active:scale-95 ${
                    hasLiked
                      ? 'bg-rose-100 text-rose-700 border-rose-500 font-bold win-bevel-pressed'
                      : 'bg-white text-gray-800 hover:bg-rose-50'
                  }`}
                >
                  <Heart
                    size={14}
                    className={`transition-colors ${
                      hasLiked ? 'fill-rose-600 text-rose-600 animate-pulse' : 'text-gray-500'
                    }`}
                  />
                  <span>Upvote ({item.likes_count})</span>
                  {hasLiked && <span className="text-[10px] text-rose-600 font-bold">★ BOOSTED</span>}
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => handleShare(e, item)}
                    title="Share notice link"
                    className="win-btn px-2.5 py-1 text-xs font-mono bg-white flex items-center gap-1 hover:bg-gray-100"
                  >
                    <Share2 size={13} />
                    <span className="hidden sm:inline">Share</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDetail(item);
                    }}
                    className="win-btn px-2.5 py-1 text-xs font-mono bg-blue-900 text-white font-bold flex items-center gap-1 hover:bg-blue-800"
                  >
                    <BookOpen size={13} />
                    <span>View</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
