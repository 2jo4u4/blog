-- Migration: 0004_admin_user.sql
-- Ensure admin_users table exists and seed initial admin user (huangjay_is_admin)

CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial admin user with SHA-256 hashed password
INSERT OR IGNORE INTO admin_users (username, password_hash)
VALUES (
  'huangjay_is_admin',
  '8afdd9bdf9cff0505fe36b1e36b5587259db7e84d5b87aafc14cbb39f0de04b1'
);
