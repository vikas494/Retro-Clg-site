import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'geh_announcements.db');
const db = new Database(DB_PATH);

// Enable foreign keys and WAL mode for high performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  // 1. Create Admins Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      department TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Create Notifications Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      branch TEXT NOT NULL, -- 'General', 'EC', 'AI&ML', 'CIVIL', 'Mech', 'css'
      priority TEXT NOT NULL, -- 'Urgent', 'High', 'Medium', 'Low'
      priority_weight INTEGER NOT NULL, -- 4=Urgent, 3=High, 2=Medium, 1=Low
      date_published TEXT NOT NULL,
      date_expiring TEXT,
      is_permanent INTEGER DEFAULT 0,
      likes_count INTEGER DEFAULT 0,
      publisher_name TEXT NOT NULL,
      category TEXT DEFAULT 'Announcement',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Create Notification Likes Audit Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notification_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      notification_id INTEGER NOT NULL,
      client_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(notification_id, client_id),
      FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE
    );
  `);

  // Create Indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_notifications_branch ON notifications(branch);
    CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority_weight);
    CREATE INDEX IF NOT EXISTS idx_notifications_date_pub ON notifications(date_published);
    CREATE INDEX IF NOT EXISTS idx_notifications_likes ON notifications(likes_count);
  `);

  seedDefaultAdmin();
  seedInitialNotifications();
}

function seedDefaultAdmin() {
  const existingAdmin = db.prepare('SELECT id FROM admins WHERE username = ?').get('admin');
  if (!existingAdmin) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('admin123', salt);
    const insertAdmin = db.prepare(`
      INSERT INTO admins (username, password_hash, name, department, role)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertAdmin.run(
      'admin',
      passwordHash,
      'Dean of Academic Affairs',
      'Administration',
      'superadmin'
    );
    console.log('[Database] Default admin seeded: username "admin", password "admin123"');
  }
}

function getPriorityWeight(priority) {
  switch (priority?.toLowerCase()) {
    case 'urgent': return 4;
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 2;
  }
}

function seedInitialNotifications() {
  const count = db.prepare('SELECT COUNT(*) as count FROM notifications').get().count;
  if (count > 0) return;

  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const expiredDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const initialData = [
    {
      title: 'VTU Semester End Theory Examination Timetable Release (Nov/Dec 2026)',
      description: 'The final theory examination timetable for 3rd, 5th, and 7th semester B.E. programs has been officially announced. Students must review hall ticket verification guidelines and clear pending library dues immediately.',
      branch: 'General',
      priority: 'Urgent',
      date_published: today,
      date_expiring: nextMonth,
      is_permanent: 0,
      likes_count: 58,
      publisher_name: 'Office of the Controller of Examinations',
      category: 'Exam'
    },
    {
      title: 'GEH CodeFest & 24-Hour AI/ML Hackathon 2026 Registration',
      description: 'The Department of AI&ML invites teams across all engineering colleges for "InnovateHassan 2026". Cash prizes up to ₹75,000! Problem statements cover Generative AI, Edge Computing, and Smart Agriculture.',
      branch: 'AI&ML',
      priority: 'High',
      date_published: today,
      date_expiring: nextWeek,
      is_permanent: 0,
      likes_count: 84,
      publisher_name: 'HOD - Department of AI&ML',
      category: 'Event'
    },
    {
      title: 'Campus Recruitment Drive: Tier-1 Tech Solutions for CS & EC',
      description: 'Eligibility criteria: 7.0 CGPA throughout with no standing backlogs. Online coding assessments will be conducted in Computer Lab 3 & 4. All registered candidates must bring updated resumes and college ID cards.',
      branch: 'css',
      priority: 'Urgent',
      date_published: today,
      date_expiring: nextWeek,
      is_permanent: 0,
      likes_count: 92,
      publisher_name: 'Training & Placement Cell',
      category: 'Placement'
    },
    {
      title: 'Hands-on Workshop: VLSI Design & FPGA Implementation by Texas Instruments',
      description: 'Department of Electronics & Communication organises a 3-day certified industrial bootcamp on Cadence EDA tools and FPGA hardware interfacing. Limited to 60 seats on first-come-first-serve basis.',
      branch: 'EC',
      priority: 'High',
      date_published: today,
      date_expiring: nextMonth,
      is_permanent: 0,
      likes_count: 43,
      publisher_name: 'Prof. K. Venkatesh, HOD EC',
      category: 'Academic'
    },
    {
      title: 'Total Station & Advanced Surveying Camp for 5th Sem Civil Engineers',
      description: 'Mandatory 10-day field surveying camp near Hemavathi Reservoir basin. Students must submit parent consent forms and gear checklist to the department coordinator before Friday.',
      branch: 'CIVIL',
      priority: 'Medium',
      date_published: today,
      date_expiring: nextMonth,
      is_permanent: 0,
      likes_count: 31,
      publisher_name: 'Civil Engineering Faculty Council',
      category: 'Academic'
    },
    {
      title: 'Formula Student & SAE India: Baja Racing Team Recruitment 2026',
      description: 'The Mechanical Engineering department invites passionate students to design and fabricate an all-terrain electric buggy. Open to students passionate about CAD/CAM, powertrain, dynamics, and suspension.',
      branch: 'Mech',
      priority: 'High',
      date_published: today,
      date_expiring: nextMonth,
      is_permanent: 0,
      likes_count: 67,
      publisher_name: 'SAE Collegiate Club / Dept of Mech',
      category: 'Event'
    },
    {
      title: 'Government Engineering Hassan - Code of Conduct & Anti-Ragging Policy',
      description: 'Permanent institutional circular regarding zero tolerance for ragging on campus or hostels. National Anti-Ragging Helpline: 1800-180-5522. Security patrols active 24/7.',
      branch: 'General',
      priority: 'Urgent',
      date_published: '2026-01-10',
      date_expiring: null,
      is_permanent: 1,
      likes_count: 110,
      publisher_name: 'Principal, GEC Hassan',
      category: 'Circular'
    },
    {
      title: 'National Digital Library (NDLI) & IEEE Xplore Digital Access Login Credentials',
      description: 'All enrolled students can now access international journals, e-books, and conference papers free of cost using their registered GEH student roll number email accounts.',
      branch: 'General',
      priority: 'Low',
      date_published: '2026-02-01',
      date_expiring: null,
      is_permanent: 1,
      likes_count: 76,
      publisher_name: 'Chief Librarian, Central Library',
      category: 'Circular'
    },
    {
      title: 'Open Source Linux & Kernel Contributor Meetup',
      description: 'Weekly hands-on session on Git, Linux Kernel modules, and contributing to CNCF open-source projects. Bring your laptops configured with dual-boot Ubuntu or Fedora.',
      branch: 'css',
      priority: 'Medium',
      date_published: today,
      date_expiring: nextMonth,
      is_permanent: 0,
      likes_count: 39,
      publisher_name: 'GEH FOSS Club',
      category: 'Workshop'
    },
    {
      title: 'Notice: Renewal of Post-Matric & State Scholarship Portal (SSP) Applications',
      description: 'Last date for submission of scholarship verification documents at the administrative block. Incomplete applications will not be forwarded to the social welfare department.',
      branch: 'General',
      priority: 'High',
      date_published: today,
      date_expiring: nextWeek,
      is_permanent: 0,
      likes_count: 88,
      publisher_name: 'Scholarship Section, Admin Block',
      category: 'Circular'
    }
  ];

  const insert = db.prepare(`
    INSERT INTO notifications (
      title, description, branch, priority, priority_weight,
      date_published, date_expiring, is_permanent, likes_count,
      publisher_name, category
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction((items) => {
    for (const item of items) {
      insert.run(
        item.title,
        item.description,
        item.branch,
        item.priority,
        getPriorityWeight(item.priority),
        item.date_published,
        item.date_expiring,
        item.is_permanent,
        item.likes_count,
        item.publisher_name,
        item.category
      );
    }
  });

  transaction(initialData);
  console.log('[Database] Seeded 10 authentic announcements for Government Engineering Hassan');
}

// ----------------- QUERY API -----------------

export function getNotifications({
  search = '',
  branch = '',
  priority = '',
  sort = 'newest',
  includeExpired = 'true'
} = {}) {
  let conditions = [];
  let params = [];

  // Expiration condition
  if (includeExpired === 'false' || includeExpired === false) {
    const today = new Date().toISOString().split('T')[0];
    conditions.push(`(is_permanent = 1 OR date_expiring IS NULL OR date_expiring >= ?)`);
    params.push(today);
  }

  // Branch filter
  if (branch && branch !== 'All') {
    conditions.push(`(branch = ? OR branch = 'General')`);
    params.push(branch);
  }

  // Priority filter
  if (priority && priority !== 'All') {
    conditions.push(`priority = ?`);
    params.push(priority);
  }

  // Search filter
  if (search && search.trim() !== '') {
    const term = `%${search.trim()}%`;
    conditions.push(`(title LIKE ? OR description LIKE ? OR publisher_name LIKE ?)`);
    params.push(term, term, term);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Sorting
  let orderBy = 'date_published DESC, id DESC';
  switch (sort) {
    case 'branch':
      // Sort according to predetermined branch sequence
      orderBy = `
        CASE branch
          WHEN 'General' THEN 1
          WHEN 'EC' THEN 2
          WHEN 'AI&ML' THEN 3
          WHEN 'CIVIL' THEN 4
          WHEN 'Mech' THEN 5
          WHEN 'css' THEN 6
          ELSE 7
        END ASC, date_published DESC
      `;
      break;
    case 'likes':
      orderBy = 'likes_count DESC, priority_weight DESC, date_published DESC';
      break;
    case 'priority':
      orderBy = 'priority_weight DESC, likes_count DESC, date_published DESC';
      break;
    case 'oldest':
      orderBy = 'date_published ASC, id ASC';
      break;
    case 'newest':
    default:
      orderBy = 'date_published DESC, priority_weight DESC, id DESC';
      break;
  }

  const query = `
    SELECT * FROM notifications
    ${whereClause}
    ORDER BY ${orderBy}
  `;

  return db.prepare(query).all(...params);
}

export function getNotificationById(id) {
  return db.prepare('SELECT * FROM notifications WHERE id = ?').get(id);
}

export function createNotification(data) {
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
  } = data;

  const priority_weight = getPriorityWeight(priority);
  const today = new Date().toISOString().split('T')[0];

  const stmt = db.prepare(`
    INSERT INTO notifications (
      title, description, branch, priority, priority_weight,
      date_published, date_expiring, is_permanent, likes_count,
      publisher_name, category
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
  `);

  const info = stmt.run(
    title,
    description,
    branch || 'General',
    priority || 'Medium',
    priority_weight,
    date_published || today,
    is_permanent ? null : (date_expiring || null),
    is_permanent ? 1 : 0,
    publisher_name || 'Administration',
    category || 'Announcement'
  );

  return getNotificationById(info.lastInsertRowid);
}

export function updateNotification(id, data) {
  const current = getNotificationById(id);
  if (!current) return null;

  const {
    title = current.title,
    description = current.description,
    branch = current.branch,
    priority = current.priority,
    date_published = current.date_published,
    date_expiring = current.date_expiring,
    is_permanent = current.is_permanent,
    publisher_name = current.publisher_name,
    category = current.category
  } = data;

  const priority_weight = getPriorityWeight(priority);

  const stmt = db.prepare(`
    UPDATE notifications
    SET title = ?, description = ?, branch = ?, priority = ?, priority_weight = ?,
        date_published = ?, date_expiring = ?, is_permanent = ?, publisher_name = ?,
        category = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(
    title,
    description,
    branch,
    priority,
    priority_weight,
    date_published,
    is_permanent ? null : date_expiring,
    is_permanent ? 1 : 0,
    publisher_name,
    category,
    id
  );

  return getNotificationById(id);
}

export function deleteNotification(id) {
  const stmt = db.prepare('DELETE FROM notifications WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

export function likeNotification(notificationId, clientId) {
  const checkAudit = db.prepare(`
    SELECT id FROM notification_likes WHERE notification_id = ? AND client_id = ?
  `);

  const deleteAudit = db.prepare(`
    DELETE FROM notification_likes WHERE notification_id = ? AND client_id = ?
  `);

  const insertAudit = db.prepare(`
    INSERT OR IGNORE INTO notification_likes (notification_id, client_id)
    VALUES (?, ?)
  `);

  const decrementCount = db.prepare(`
    UPDATE notifications
    SET likes_count = MAX(0, likes_count - 1)
    WHERE id = ?
  `);

  const incrementCount = db.prepare(`
    UPDATE notifications
    SET likes_count = likes_count + 1
    WHERE id = ?
  `);

  const getUpdated = db.prepare('SELECT likes_count FROM notifications WHERE id = ?');

  const tx = db.transaction(() => {
    const existing = checkAudit.get(notificationId, clientId);
    if (existing) {
      // Already upvoted by this student -> remove upvote and decrement count
      deleteAudit.run(notificationId, clientId);
      decrementCount.run(notificationId);
      const res = getUpdated.get(notificationId);
      return { success: true, likes_count: res ? res.likes_count : 0, liked: false };
    } else {
      // New upvote -> record like and increment count
      insertAudit.run(notificationId, clientId);
      incrementCount.run(notificationId);
      const res = getUpdated.get(notificationId);
      return { success: true, likes_count: res ? res.likes_count : 0, liked: true };
    }
  });

  return tx();
}

export function getAdminByUsername(username) {
  return db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
}

export function getStats() {
  const today = new Date().toISOString().split('T')[0];

  const total = db.prepare('SELECT COUNT(*) as count FROM notifications').get().count;
  const active = db.prepare(`
    SELECT COUNT(*) as count FROM notifications
    WHERE (is_permanent = 1 OR date_expiring IS NULL OR date_expiring >= ?)
  `).get(today).count;

  const totalLikes = db.prepare('SELECT SUM(likes_count) as total FROM notifications').get().total || 0;

  const branchCounts = db.prepare(`
    SELECT branch, COUNT(*) as count
    FROM notifications
    GROUP BY branch
  `).all();

  const priorityCounts = db.prepare(`
    SELECT priority, COUNT(*) as count
    FROM notifications
    GROUP BY priority
  `).all();

  return {
    total,
    active,
    expired: total - active,
    totalLikes,
    branchCounts,
    priorityCounts
  };
}

export default db;
