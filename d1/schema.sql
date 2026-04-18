CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'ADMIN',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_archived INTEGER NOT NULL DEFAULT 0,
  vector_store_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subject_files (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  openai_file_id TEXT NOT NULL,
  status TEXT NOT NULL,
  uploaded_at TEXT NOT NULL,
  uploaded_by TEXT,
  notes TEXT,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  source_summary TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_action_logs (
  id TEXT PRIMARY KEY,
  admin_id TEXT,
  action TEXT NOT NULL,
  subject_id TEXT,
  metadata TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,
  token_hash TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
