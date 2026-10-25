import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  initDatabase,
  getNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
  likeNotification,
  getAdminByUsername,
  getStats
} from './database.js';
import {
  comparePassword,
  generateToken,
  authMiddleware
} from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize DB and Seed Data
initDatabase();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ==========================================
// PUBLIC & STUDENT ROUTES (No Auth Required)
// ==========================================

// 1. Get notifications with Search, Branch/Priority filters & Sorting
app.get('/api/notifications', (req, res) => {
  try {
    const { search, branch, priority, sort, includeExpired } = req.query;
    const items = getNotifications({
      search,
      branch,
      priority,
      sort,
      includeExpired: includeExpired === undefined ? 'true' : includeExpired
    });
    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, error: 'Internal server error fetching announcements' });
  }
});

// 2. Get single notification
app.get('/api/notifications/:id', (req, res) => {
  try {
    const item = getNotificationById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Announcement not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    console.error('Error fetching announcement detail:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// 3. Like a notification (Student upvote to increase priority)
app.post('/api/notifications/:id/like', (req, res) => {
  try {
    const notificationId = req.params.id;
    // Client id passed from client (e.g. fingerprint / local storage ID) or IP
    const clientId = req.body.clientId || req.ip || 'anonymous_student';

    const result = likeNotification(notificationId, clientId);
    res.json({
      success: true,
      likesCount: result.likes_count,
      liked: result.liked,
      newlyLiked: result.liked,
      message: result.liked
        ? 'Announcement upvoted successfully! Priority boosted.'
        : 'Upvote removed.'
    });
  } catch (error) {
    console.error('Error upvoting announcement:', error);
    res.status(500).json({ success: false, error: 'Failed to record upvote' });
  }
});

// 4. College & Announcements Overview Stats
app.get('/api/stats', (req, res) => {
  try {
    const stats = getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch statistics' });
  }
});

// ==========================================
// ADMINISTRATION AUTHENTICATION ROUTES
// ==========================================

// 5. Admin Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    const admin = getAdminByUsername(username.trim());
    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. User not found.'
      });
    }

    const isValid = comparePassword(password, admin.password_hash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Incorrect password.'
      });
    }

    const token = generateToken(admin);

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        department: admin.department,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Internal server error during authentication' });
  }
});

// 6. Verify current admin session
app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

// ==========================================
// ADMINISTRATION MANAGEMENT ROUTES (Protected)
// ==========================================

// 7. Post new announcement
app.post('/api/notifications', authMiddleware, (req, res) => {
  try {
    const {
      title,
      description,
      branch,
      priority,
      date_published,
      date_expiring,
      is_permanent,
      publisher_name,
      category
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: 'Title and description are required fields.'
      });
    }

    const validBranches = ['General', 'EC', 'AI&ML', 'CIVIL', 'Mech', 'css'];
    if (branch && !validBranches.includes(branch)) {
      return res.status(400).json({
        success: false,
        error: `Branch must be one of: ${validBranches.join(', ')}`
      });
    }

    const created = createNotification({
      title,
      description,
      branch: branch || 'General',
      priority: priority || 'Medium',
      date_published: date_published || new Date().toISOString().split('T')[0],
      date_expiring,
      is_permanent: Boolean(is_permanent),
      publisher_name: publisher_name || req.admin.name || 'Administration Office',
      category: category || 'Announcement'
    });

    res.status(201).json({
      success: true,
      message: 'Announcement successfully published to GEH notice board!',
      data: created
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ success: false, error: 'Failed to create announcement' });
  }
});

// 8. Update announcement
app.put('/api/notifications/:id', authMiddleware, (req, res) => {
  try {
    const updated = updateNotification(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Announcement not found' });
    }
    res.json({
      success: true,
      message: 'Announcement updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ success: false, error: 'Failed to update announcement' });
  }
});

// 9. Delete announcement
app.delete('/api/notifications/:id', authMiddleware, (req, res) => {
  try {
    const deleted = deleteNotification(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Announcement not found or already deleted' });
    }
    res.json({
      success: true,
      message: 'Announcement removed from notice board'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, error: 'Failed to delete announcement' });
  }
});

// ==========================================
// STATIC FRONTEND SERVING
// ==========================================
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// Fallback SPA routing for Express 5
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, error: 'API route not found' });
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send(`
        <html>
          <body style="font-family: monospace; padding: 2rem; background: #c0c0c0; color: #000;">
            <h2>🏛️ Government Engineering Hassan Announcement Server</h2>
            <p>API Server is running successfully on port ${PORT}!</p>
            <p>Frontend Vite dev server is running on <a href="http://localhost:5173" target="_blank">http://localhost:5173</a>.</p>
            <p>To serve production frontend from this port, run <code>npm run build</code> in the root directory.</p>
          </body>
        </html>
      `);
    }
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🏛️  GEH Announcement Portal Backend Started`);
  console.log(`📍  Server URL: http://localhost:${PORT}`);
  console.log(`🔑  Default Admin: "admin" / "admin123"`);
  console.log(`====================================================`);
});
