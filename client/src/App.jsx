import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import StudentPortal from './components/StudentPortal';
import AdminPortal from './components/AdminPortal';
import NoticeDetailModal from './components/NoticeDetailModal';
import AboutModal from './components/AboutModal';
import RetroFooter from './components/RetroFooter';

export default function App() {
  const [activePortal, setActivePortal] = useState('student'); // 'student' or 'admin'
  const [theme, setTheme] = useState('win95'); // 'win95', 'cyberpunk', 'matrix', 'hotdog'
  const [crtEffect, setCrtEffect] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);

  // Announcements & Data
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // Filters & Sorting state: search by title, branch/priority filters, and branch-based sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [sortOption, setSortOption] = useState('branch'); // default: sort according to branch!
  const [includeExpired, setIncludeExpired] = useState(true);

  // Modals
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Admin Auth State
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('geh_admin_token') || null);
  const [admin, setAdmin] = useState(null);

  // Fetch Announcements from Backend API
  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchTerm,
        branch: selectedBranch,
        priority: selectedPriority,
        sort: sortOption,
        includeExpired: includeExpired.toString()
      });

      const res = await fetch(`/api/notifications?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch announcements from GEH server');
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedBranch, selectedPriority, sortOption, includeExpired]);

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Check existing admin session
  useEffect(() => {
    if (adminToken) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${adminToken}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setAdmin(data.admin);
          } else {
            localStorage.removeItem('geh_admin_token');
            setAdminToken(null);
            setAdmin(null);
          }
        })
        .catch(() => {
          setAdmin(null);
        });
    }
  }, [adminToken]);

  // Load announcements whenever query parameters change
  useEffect(() => {
    fetchAnnouncements();
    fetchStats();
  }, [fetchAnnouncements]);

  // Local liked map for current client device
  const [likedMap, setLikedMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('geh_liked_posts') || '{}');
    } catch {
      return {};
    }
  });

  // Upvote / Like Notice (Student Action - Toggles upvote on and off)
  const handleLike = async (id) => {
    try {
      const clientId = localStorage.getItem('geh_client_id') || `client_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('geh_client_id', clientId);

      const res = await fetch(`/api/notifications/${id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId })
      });
      const data = await res.json();
      if (data.success) {
        // Update item in local list
        setAnnouncements(prev => prev.map(item => {
          if (item.id === id) {
            return { ...item, likes_count: data.likesCount };
          }
          return item;
        }));

        if (selectedNotice && selectedNotice.id === id) {
          setSelectedNotice(prev => ({ ...prev, likes_count: data.likesCount }));
        }

        setLikedMap(prev => {
          const next = { ...prev };
          if (data.liked) {
            next[id] = true;
          } else {
            delete next[id];
          }
          localStorage.setItem('geh_liked_posts', JSON.stringify(next));
          return next;
        });

        fetchStats();
        return { success: true, liked: data.liked, likesCount: data.likesCount };
      }
    } catch (err) {
      console.error('Failed to record upvote:', err);
    }
    return { success: false };
  };

  // Admin Login
  const handleLogin = (token, adminData) => {
    setAdminToken(token);
    setAdmin(adminData);
    localStorage.setItem('geh_admin_token', token);
  };

  // Admin Logout
  const handleLogout = () => {
    setAdminToken(null);
    setAdmin(null);
    localStorage.removeItem('geh_admin_token');
  };

  // Admin Create Notice
  const handleCreateNotice = async (formData) => {
    const res = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to create announcement');
    }
    fetchAnnouncements();
    fetchStats();
    return data.data;
  };

  // Admin Update Notice
  const handleUpdateNotice = async (id, formData) => {
    const res = await fetch(`/api/notifications/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to update announcement');
    }
    fetchAnnouncements();
    fetchStats();
    return data.data;
  };

  // Admin Delete Notice
  const handleDeleteNotice = async (id) => {
    const res = await fetch(`/api/notifications/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete announcement');
    }
    fetchAnnouncements();
    fetchStats();
  };

  return (
    <div className={`min-h-screen p-2 md:p-6 transition-colors duration-200 ${crtEffect ? 'crt' : ''}`}>
      <div className="max-w-6xl mx-auto">
        {/* Retro Header with Title, Dual Navigation & Controls */}
        <Header
          activePortal={activePortal}
          setActivePortal={setActivePortal}
          theme={theme}
          setTheme={setTheme}
          crtEffect={crtEffect}
          setCrtEffect={setCrtEffect}
          soundMuted={soundMuted}
          setSoundMuted={setSoundMuted}
          announcements={announcements}
        />

        {/* Main Content Area: Student Portal or Administration Portal */}
        <main>
          {activePortal === 'student' ? (
            <StudentPortal
              announcements={announcements}
              loading={loading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedBranch={selectedBranch}
              setSelectedBranch={setSelectedBranch}
              selectedPriority={selectedPriority}
              setSelectedPriority={setSelectedPriority}
              sortOption={sortOption}
              setSortOption={setSortOption}
              includeExpired={includeExpired}
              setIncludeExpired={setIncludeExpired}
              likedMap={likedMap}
              onLike={handleLike}
              onOpenDetail={(item) => setSelectedNotice(item)}
              onRefresh={fetchAnnouncements}
            />
          ) : (
            <AdminPortal
              admin={admin}
              onLogin={handleLogin}
              onLogout={handleLogout}
              announcements={announcements}
              stats={stats}
              onCreateNotice={handleCreateNotice}
              onUpdateNotice={handleUpdateNotice}
              onDeleteNotice={handleDeleteNotice}
              onOpenDetail={(item) => setSelectedNotice(item)}
            />
          )}
        </main>

        {/* Retro Footer with Windows 95 taskbar and about button */}
        <RetroFooter
          onOpenAbout={() => setIsAboutOpen(true)}
          activePortal={activePortal}
          setActivePortal={setActivePortal}
        />

        {/* Notice Full Letterhead Detail Modal */}
        {selectedNotice && (
          <NoticeDetailModal
            item={selectedNotice}
            onClose={() => setSelectedNotice(null)}
            onLike={handleLike}
            isLiked={Boolean(likedMap[selectedNotice.id])}
          />
        )}

        {/* About Dialog Modal */}
        {isAboutOpen && (
          <AboutModal onClose={() => setIsAboutOpen(false)} />
        )}
      </div>
    </div>
  );
}
