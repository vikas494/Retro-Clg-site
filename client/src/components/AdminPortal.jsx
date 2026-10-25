import React, { useState } from 'react';
import { 
  Lock, Key, ShieldCheck, Plus, Trash2, Edit3, LogOut, 
  BarChart3, CheckCircle, AlertCircle, Eye, Calendar, Pin
} from 'lucide-react';
import { playClickSound, playLoginSound, playErrorSound } from '../utils/sound';

export default function AdminPortal({
  admin,
  onLogin,
  onLogout,
  announcements,
  stats,
  onCreateNotice,
  onUpdateNotice,
  onDeleteNotice,
  onOpenDetail
}) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal / Form state for Post or Edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    branch: 'General',
    priority: 'High',
    date_published: new Date().toISOString().split('T')[0],
    date_expiring: '',
    is_permanent: false,
    publisher_name: '',
    category: 'Circular'
  });
  const [formError, setFormError] = useState('');

  const branches = ['General', 'EC', 'AI&ML', 'CIVIL', 'Mech', 'css'];
  const priorities = ['Urgent', 'High', 'Medium', 'Low'];
  const categories = ['Circular', 'Exam', 'Placement', 'Academic', 'Event', 'Workshop', 'Sports'];

  const handleLoginFormSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);
    playClickSound();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        playLoginSound();
        onLogin(data.token, data.admin);
      } else {
        playErrorSound();
        setLoginError(data.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      playErrorSound();
      setLoginError('Cannot connect to authentication service. Is the server running?');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    playClickSound();
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      branch: 'General',
      priority: 'High',
      date_published: new Date().toISOString().split('T')[0],
      date_expiring: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      is_permanent: false,
      publisher_name: admin ? `${admin.name} (${admin.department})` : 'Office of Administration',
      category: 'Circular'
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const openEditModal = (item) => {
    playClickSound();
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      branch: item.branch,
      priority: item.priority,
      date_published: item.date_published,
      date_expiring: item.date_expiring || '',
      is_permanent: Boolean(item.is_permanent),
      publisher_name: item.publisher_name,
      category: item.category || 'Circular'
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    playClickSound();

    if (!formData.title.trim()) {
      setFormError('Announcement title is required.');
      return;
    }
    if (!formData.description.trim()) {
      setFormError('Announcement description is required.');
      return;
    }
    if (!formData.is_permanent && !formData.date_expiring) {
      setFormError('Please specify an expiration date or mark as Permanent Notification.');
      return;
    }

    try {
      if (editingItem) {
        await onUpdateNotice(editingItem.id, formData);
      } else {
        await onCreateNotice(formData);
      }
      setIsFormOpen(false);
      setEditingItem(null);
    } catch (err) {
      setFormError(err.message || 'Error saving announcement');
    }
  };

  const handleDelete = async (id, title) => {
    playClickSound();
    const confirmed = window.confirm(
      `[CONFIRMATION]\nAre you sure you want to permanently delete this announcement?\n\n"${title}"`
    );
    if (confirmed) {
      await onDeleteNotice(id);
    }
  };

  // -------------------------------------------------------------
  // VIEW 1: AUTHENTICATION LOGIN DIALOG (IF NOT LOGGED IN)
  // -------------------------------------------------------------
  if (!admin) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-full max-w-md win-bevel-outset bg-[#c0c0c0] p-1 shadow-2xl">
          {/* Windows Logon Titlebar */}
          <div className="win-titlebar text-xs font-mono">
            <div className="flex items-center space-x-1.5">
              <Lock size={13} className="text-yellow-300" />
              <span>GEH Administration - Secure Logon</span>
            </div>
            <span className="text-[10px] text-gray-300">SECURE SHELL</span>
          </div>

          <div className="p-4 bg-[#dfdfdf] border-t border-b border-gray-400">
            <div className="flex items-center space-x-3 mb-4 p-2 bg-blue-900 text-white win-bevel-inset">
              <Key size={28} className="text-yellow-400 shrink-0" />
              <div>
                <h3 className="font-bold font-mono text-sm">System Access Control</h3>
                <p className="text-[11px] font-mono text-blue-200">
                  Government Engineering Hassan Administration Console
                </p>
              </div>
            </div>

            {loginError && (
              <div className="win-bevel-inset bg-red-100 border border-red-500 text-red-800 p-2 text-xs font-mono mb-3 flex items-start gap-1.5">
                <AlertCircle size={15} className="shrink-0 text-red-600 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginFormSubmit} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-gray-800 font-bold mb-1">
                  Administrator Username:
                </label>
                <div className="win-bevel-inset bg-white p-1">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full text-xs font-mono px-1 py-0.5 focus:outline-none"
                    placeholder="Enter admin username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-800 font-bold mb-1">
                  Password:
                </label>
                <div className="win-bevel-inset bg-white p-1">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs font-mono px-1 py-0.5 focus:outline-none"
                    placeholder="Enter admin password"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUsername('admin');
                    setPassword('admin123');
                    playClickSound();
                  }}
                  className="win-btn text-[11px] px-2 py-1 bg-yellow-100 text-yellow-900 font-bold border border-yellow-500"
                >
                  ⚡ Autofill Default Admin
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="win-btn win-btn-accent px-5 py-1.5 text-xs font-bold font-mono flex items-center gap-1.5"
                >
                  <Lock size={12} />
                  <span>{isSubmitting ? 'Verifying...' : 'LOGON'}</span>
                </button>
              </div>
            </form>

            <div className="mt-4 pt-3 border-t border-gray-400 text-[10px] font-mono text-gray-600 text-center">
              Notice: Unauthorized access to Government Engineering Hassan networks is strictly audited and logged.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: AUTHENTICATED ADMINISTRATION DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Admin Status & Actions Header */}
      <div className="win-bevel-outset p-3">
        <div className="win-titlebar text-xs font-mono mb-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck size={14} className="text-green-300" />
            <span>ADMINISTRATOR CONSOLE | {admin.name} ({admin.department})</span>
          </div>
          <span className="text-[11px] bg-green-700 px-1.5 py-0.2 text-white">ONLINE</span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-[#dfdfdf] p-2 border border-gray-400">
          <div>
            <div className="text-xs font-mono font-bold text-gray-900">
              Welcome, <span className="text-blue-900">{admin.name}</span>
            </div>
            <div className="text-[11px] font-mono text-gray-600">
              User: <b className="text-black">{admin.username}</b> | Access Level: <b className="text-black uppercase">{admin.role}</b>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openCreateModal}
              className="win-btn win-btn-accent px-3 py-1.5 text-xs font-mono font-bold flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Post New Notice</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                onLogout();
              }}
              className="win-btn px-3 py-1.5 text-xs font-mono text-red-700 font-bold bg-white flex items-center gap-1 hover:bg-red-50"
            >
              <LogOut size={13} />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Dashboard Statistics Overview */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 mt-3 font-mono text-xs">
            <div className="win-bevel-inset bg-white p-2 text-center">
              <div className="text-gray-500 text-[10px]">TOTAL POSTED</div>
              <div className="text-lg font-bold text-blue-900">{stats.total}</div>
            </div>
            <div className="win-bevel-inset bg-white p-2 text-center">
              <div className="text-gray-500 text-[10px]">ACTIVE NOTICES</div>
              <div className="text-lg font-bold text-green-700">{stats.active}</div>
            </div>
            <div className="win-bevel-inset bg-white p-2 text-center">
              <div className="text-gray-500 text-[10px]">STUDENT LIKES</div>
              <div className="text-lg font-bold text-rose-600">❤️ {stats.totalLikes}</div>
            </div>
            <div className="win-bevel-inset bg-white p-2 text-center">
              <div className="text-gray-500 text-[10px]">EC NOTICES</div>
              <div className="text-lg font-bold text-purple-700">
                {stats.branchCounts?.find(b => b.branch === 'EC')?.count || 0}
              </div>
            </div>
            <div className="win-bevel-inset bg-white p-2 text-center">
              <div className="text-gray-500 text-[10px]">AI&ML NOTICES</div>
              <div className="text-lg font-bold text-indigo-700">
                {stats.branchCounts?.find(b => b.branch === 'AI&ML')?.count || 0}
              </div>
            </div>
            <div className="win-bevel-inset bg-white p-2 text-center">
              <div className="text-gray-500 text-[10px]">CS / MECH / CIVIL</div>
              <div className="text-lg font-bold text-amber-700">
                {(stats.branchCounts?.find(b => b.branch === 'css')?.count || 0) +
                 (stats.branchCounts?.find(b => b.branch === 'Mech')?.count || 0) +
                 (stats.branchCounts?.find(b => b.branch === 'CIVIL')?.count || 0)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Announcements Management Table */}
      <div className="win-bevel-outset p-3">
        <div className="win-titlebar text-xs font-mono mb-2">
          <span>📋 ALL COLLEGE ANNOUNCEMENTS &amp; BULLETINS MANAGEMENT</span>
          <span className="text-[11px] text-yellow-300">TOTAL: {announcements.length}</span>
        </div>

        <div className="overflow-x-auto win-bevel-inset bg-white">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-[#dfdfdf] border-b border-gray-400 text-gray-800">
                <th className="p-2 border-r border-gray-300">ID</th>
                <th className="p-2 border-r border-gray-300">Branch</th>
                <th className="p-2 border-r border-gray-300">Title & Description</th>
                <th className="p-2 border-r border-gray-300">Priority</th>
                <th className="p-2 border-r border-gray-300">Timeline / Expiry</th>
                <th className="p-2 border-r border-gray-300 text-center">Student Upvotes</th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((item) => {
                return (
                  <tr key={item.id} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                    <td className="p-2 border-r border-gray-200 font-bold text-gray-600">
                      #{item.id}
                    </td>
                    <td className="p-2 border-r border-gray-200">
                      <span className="bg-blue-100 text-blue-900 border border-blue-400 px-1.5 py-0.5 text-[11px] font-bold">
                        {item.branch}
                      </span>
                    </td>
                    <td className="p-2 border-r border-gray-200 max-w-xs">
                      <div className="font-bold text-blue-950 truncate">{item.title}</div>
                      <div className="text-[11px] text-gray-600 truncate">{item.description}</div>
                      <div className="text-[10px] text-gray-500">By: {item.publisher_name}</div>
                    </td>
                    <td className="p-2 border-r border-gray-200">
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold border border-black ${
                        item.priority === 'Urgent'
                          ? 'bg-red-600 text-white'
                          : item.priority === 'High'
                          ? 'bg-amber-400 text-black'
                          : item.priority === 'Medium'
                          ? 'bg-blue-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="p-2 border-r border-gray-200 text-[11px]">
                      <div>Pub: {item.date_published}</div>
                      {item.is_permanent ? (
                        <div className="text-purple-700 font-bold flex items-center gap-0.5">
                          <Pin size={10} /> Permanent
                        </div>
                      ) : (
                        <div className="text-gray-700">Exp: {item.date_expiring || 'N/A'}</div>
                      )}
                    </td>
                    <td className="p-2 border-r border-gray-200 text-center font-bold text-rose-600">
                      ❤️ {item.likes_count}
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => onOpenDetail(item)}
                          title="Preview notice"
                          className="win-btn p-1 bg-white hover:bg-gray-100"
                        >
                          <Eye size={12} className="text-blue-800" />
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          title="Edit announcement"
                          className="win-btn p-1 bg-white hover:bg-gray-100"
                        >
                          <Edit3 size={12} className="text-amber-700" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          title="Delete announcement"
                          className="win-btn p-1 bg-white hover:bg-red-100"
                        >
                          <Trash2 size={12} className="text-red-700" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* MODAL: POST / EDIT ANNOUNCEMENT DIALOG                      */}
      {/* ----------------------------------------------------------- */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 overflow-y-auto">
          <div className="w-full max-w-2xl win-bevel-outset bg-[#c0c0c0] p-1 shadow-2xl my-8">
            <div className="win-titlebar text-xs font-mono">
              <span>{editingItem ? '✏️ EDIT ANNOUNCEMENT' : '➕ PUBLISH NEW COLLEGE ANNOUNCEMENT'}</span>
              <button
                onClick={() => {
                  playClickSound();
                  setIsFormOpen(false);
                }}
                className="win-btn px-1.5 py-0.2 bg-[#c0c0c0] text-red-700 font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-4 bg-[#dfdfdf] border-t border-b border-gray-400 max-h-[85vh] overflow-y-auto">
              {formError && (
                <div className="win-bevel-inset bg-red-100 border border-red-500 text-red-800 p-2 text-xs font-mono mb-3">
                  ⚠️ {formError}
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-3 font-mono text-xs">
                {/* Title */}
                <div>
                  <label className="block text-gray-900 font-bold mb-1">
                    Announcement Title: *
                  </label>
                  <div className="win-bevel-inset bg-white p-1">
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. VTU Examination Timetable / Hackathon 2026 Announcement"
                      className="w-full text-xs font-mono px-1 py-1 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gray-900 font-bold mb-1">
                    Announcement Full Description & Instructions: *
                  </label>
                  <div className="win-bevel-inset bg-white p-1">
                    <textarea
                      rows={4}
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detailed content, guidelines, eligibility, submission link, venue details..."
                      className="w-full text-xs font-mono px-1 py-1 focus:outline-none resize-y"
                    />
                  </div>
                </div>

                {/* Branch and Priority Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Branch Selection */}
                  <div>
                    <label className="block text-gray-900 font-bold mb-1">
                      Target Branch: *
                    </label>
                    <div className="win-bevel-inset bg-white p-1">
                      <select
                        value={formData.branch}
                        onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                        className="w-full text-xs font-mono bg-transparent focus:outline-none cursor-pointer"
                      >
                        {branches.map(b => (
                          <option key={b} value={b}>
                            {b === 'General' ? 'General (Visible to all students)' : `${b} Branch`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Priority Selection */}
                  <div>
                    <label className="block text-gray-900 font-bold mb-1">
                      Publisher Priority: *
                    </label>
                    <div className="win-bevel-inset bg-white p-1">
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full text-xs font-mono bg-transparent focus:outline-none cursor-pointer font-bold"
                      >
                        {priorities.map(p => (
                          <option key={p} value={p}>{p} Priority</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Category & Publisher designation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-900 font-bold mb-1">
                      Category Tag:
                    </label>
                    <div className="win-bevel-inset bg-white p-1">
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full text-xs font-mono bg-transparent focus:outline-none cursor-pointer"
                      >
                        {categories.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-900 font-bold mb-1">
                      Publisher / Issuing Authority:
                    </label>
                    <div className="win-bevel-inset bg-white p-1">
                      <input
                        type="text"
                        value={formData.publisher_name}
                        onChange={(e) => setFormData({ ...formData, publisher_name: e.target.value })}
                        placeholder="e.g. Office of the Principal, HOD EC"
                        className="w-full text-xs font-mono px-1 py-1 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Date Published, Expiry & Permanent Checkbox */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-gray-900 font-bold mb-1">
                      Date Published:
                    </label>
                    <div className="win-bevel-inset bg-white p-1">
                      <input
                        type="date"
                        value={formData.date_published}
                        onChange={(e) => setFormData({ ...formData, date_published: e.target.value })}
                        className="w-full text-xs font-mono px-1 py-0.5 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-900 font-bold mb-1">
                      Date Expiring:
                    </label>
                    <div className={`win-bevel-inset p-1 ${formData.is_permanent ? 'bg-gray-200' : 'bg-white'}`}>
                      <input
                        type="date"
                        disabled={formData.is_permanent}
                        value={formData.date_expiring}
                        onChange={(e) => setFormData({ ...formData, date_expiring: e.target.value })}
                        className="w-full text-xs font-mono px-1 py-0.5 focus:outline-none disabled:bg-gray-200 disabled:text-gray-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Permanent Notification Checkbox (Indefinite announcements with no expiry date) */}
                <div className="pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer bg-white p-2 win-bevel-inset">
                    <input
                      type="checkbox"
                      checked={formData.is_permanent}
                      onChange={(e) => {
                        playClickSound();
                        setFormData({
                          ...formData,
                          is_permanent: e.target.checked,
                          date_expiring: e.target.checked ? '' : formData.date_expiring
                        });
                      }}
                      className="accent-purple-700 w-4 h-4"
                    />
                    <div>
                      <span className="font-bold text-gray-900">Mark as Permanent Notification</span>
                      <p className="text-[10px] text-gray-600">
                        Permanent notices never expire automatically (e.g. anti-ragging policies, college bylaws, library portal).
                      </p>
                    </div>
                  </label>
                </div>

                {/* Action buttons */}
                <div className="pt-4 flex items-center justify-end space-x-2 border-t border-gray-400">
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setIsFormOpen(false);
                    }}
                    className="win-btn px-4 py-1.5 text-xs font-mono font-bold bg-white text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="win-btn win-btn-accent px-6 py-1.5 text-xs font-mono font-bold flex items-center gap-1.5"
                  >
                    <CheckCircle size={13} />
                    <span>{editingItem ? 'Update Announcement' : 'Publish Announcement'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
