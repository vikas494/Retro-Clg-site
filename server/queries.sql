-- ====================================================================
-- DATABASE SCHEMA & QUERIES: Government Engineering Hassan (GEH)
-- Announcement & Notification Portal
-- Supported Branches: General, EC, AI&ML, CIVIL, Mech, css
-- ====================================================================

-- 1. ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. NOTIFICATIONS / ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    branch TEXT NOT NULL, -- 'General', 'EC', 'AI&ML', 'CIVIL', 'Mech', 'css'
    priority TEXT NOT NULL, -- 'Urgent', 'High', 'Medium', 'Low'
    priority_weight INTEGER NOT NULL, -- Urgent=4, High=3, Medium=2, Low=1
    date_published TEXT NOT NULL, -- YYYY-MM-DD
    date_expiring TEXT, -- YYYY-MM-DD or NULL
    is_permanent INTEGER DEFAULT 0, -- 1 = permanent (no expiry), 0 = has expiry
    likes_count INTEGER DEFAULT 0, -- Upvotes by students
    publisher_name TEXT NOT NULL, -- e.g., 'Principal Office', 'HOD EC', etc.
    category TEXT DEFAULT 'Announcement', -- 'Circular', 'Exam', 'Placement', 'Sports', 'Event', 'Academic'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. NOTIFICATION LIKES AUDIT TABLE (Prevents duplicate likes per client device)
CREATE TABLE IF NOT EXISTS notification_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    notification_id INTEGER NOT NULL,
    client_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(notification_id, client_id),
    FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE
);

-- ====================================================================
-- INDEXES FOR PERFORMANCE
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_notifications_branch ON notifications(branch);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority_weight);
CREATE INDEX IF NOT EXISTS idx_notifications_date_pub ON notifications(date_published);
CREATE INDEX IF NOT EXISTS idx_notifications_likes ON notifications(likes_count);

-- ====================================================================
-- CORE QUERIES
-- ====================================================================

-- [Admin Authentication] Find admin by username
-- SELECT id, username, password_hash, name, department, role FROM admins WHERE username = ?;

-- [Insert Admin User]
-- INSERT OR IGNORE INTO admins (username, password_hash, name, department, role)
-- VALUES (?, ?, ?, ?, ?);

-- [Fetch Notifications with Search, Filters, and Sorting]
-- Example: Active notifications, filter by branch 'EC', filter by priority 'Urgent', sorted by branch:
/*
SELECT * FROM notifications
WHERE (is_permanent = 1 OR date_expiring IS NULL OR date_expiring >= date('now'))
  AND (title LIKE '%' || ? || '%' OR description LIKE '%' || ? || '%')
  AND (branch = ? OR branch = 'General')
  AND (priority = ?)
ORDER BY branch ASC, priority_weight DESC, date_published DESC;
*/

-- [Sort Options]
-- 1. Sort by Branch:
--    ORDER BY CASE branch WHEN 'General' THEN 1 WHEN 'css' THEN 2 WHEN 'AI&ML' THEN 3 WHEN 'EC' THEN 4 WHEN 'Mech' THEN 5 WHEN 'CIVIL' THEN 6 ELSE 7 END ASC, date_published DESC

-- 2. Sort by Popularity / Likes:
--    ORDER BY likes_count DESC, priority_weight DESC, date_published DESC

-- 3. Sort by Priority:
--    ORDER BY priority_weight DESC, likes_count DESC, date_published DESC

-- 4. Sort by Date Published:
--    ORDER BY date_published DESC

-- [Toggle Like Count Atomically (Add or Remove Upvote)]
/*
-- 1. Check if client has already upvoted:
SELECT id FROM notification_likes WHERE notification_id = ? AND client_id = ?;

-- 2. If already upvoted -> Remove upvote and decrement:
BEGIN TRANSACTION;
DELETE FROM notification_likes WHERE notification_id = ? AND client_id = ?;
UPDATE notifications SET likes_count = MAX(0, likes_count - 1) WHERE id = ?;
COMMIT;

-- 3. If not yet upvoted -> Add upvote and increment:
BEGIN TRANSACTION;
INSERT INTO notification_likes (notification_id, client_id) VALUES (?, ?);
UPDATE notifications SET likes_count = likes_count + 1 WHERE id = ?;
COMMIT;
*/

-- [Create Notification (Administration)]
/*
INSERT INTO notifications (
    title, description, branch, priority, priority_weight,
    date_published, date_expiring, is_permanent, publisher_name, category
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
*/

-- [Update Notification (Administration)]
/*
UPDATE notifications
SET title = ?, description = ?, branch = ?, priority = ?, priority_weight = ?,
    date_published = ?, date_expiring = ?, is_permanent = ?, publisher_name = ?,
    category = ?, updated_at = CURRENT_TIMESTAMP
WHERE id = ?;
*/

-- [Delete Notification (Administration)]
/*
DELETE FROM notifications WHERE id = ?;
*/

-- [College Stats Query]
/*
SELECT 
  COUNT(*) as total_active,
  SUM(likes_count) as total_likes,
  SUM(CASE WHEN branch = 'General' THEN 1 ELSE 0 END) as general_count,
  SUM(CASE WHEN branch = 'EC' THEN 1 ELSE 0 END) as ec_count,
  SUM(CASE WHEN branch = 'AI&ML' THEN 1 ELSE 0 END) as aiml_count,
  SUM(CASE WHEN branch = 'CIVIL' THEN 1 ELSE 0 END) as civil_count,
  SUM(CASE WHEN branch = 'Mech' THEN 1 ELSE 0 END) as mech_count,
  SUM(CASE WHEN branch = 'css' THEN 1 ELSE 0 END) as css_count
FROM notifications
WHERE (is_permanent = 1 OR date_expiring IS NULL OR date_expiring >= date('now'));
*/
