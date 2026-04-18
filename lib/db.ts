import { getDb, newId, nowIso, toBool } from "@/lib/d1";
import { logger } from "@/lib/logger";

export type SubjectRecord = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isArchived: boolean;
  vectorStoreId: string | null;
  createdAt: string;
  updatedAt: string;
};

function mapSubject(row: any): SubjectRecord {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description ?? null,
    isArchived: toBool(row.is_archived),
    vectorStoreId: row.vector_store_id ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function ensureCoreTables() {
  const db = getDb();
  await db.prepare("CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT, password_hash TEXT, role TEXT NOT NULL DEFAULT 'ADMIN', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)").run();
  await db.prepare("CREATE TABLE IF NOT EXISTS subjects (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, description TEXT, is_archived INTEGER NOT NULL DEFAULT 0, vector_store_id TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)").run();
  await db.prepare("CREATE TABLE IF NOT EXISTS subject_files (id TEXT PRIMARY KEY, subject_id TEXT NOT NULL, display_name TEXT NOT NULL, openai_file_id TEXT NOT NULL, status TEXT NOT NULL, uploaded_at TEXT NOT NULL, uploaded_by TEXT, notes TEXT, is_active INTEGER NOT NULL DEFAULT 1)").run();
  await db.prepare("CREATE TABLE IF NOT EXISTS chat_sessions (id TEXT PRIMARY KEY, subject_id TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)").run();
  await db.prepare("CREATE TABLE IF NOT EXISTS chat_messages (id TEXT PRIMARY KEY, session_id TEXT NOT NULL, role TEXT NOT NULL, content TEXT NOT NULL, source_summary TEXT, created_at TEXT NOT NULL)").run();
  await db.prepare("CREATE TABLE IF NOT EXISTS admin_action_logs (id TEXT PRIMARY KEY, admin_id TEXT, action TEXT NOT NULL, subject_id TEXT, metadata TEXT, created_at TEXT NOT NULL)").run();
}

export async function listSubjects() {
  await ensureCoreTables();
  const db = getDb();
  const result = await db.prepare("SELECT * FROM subjects ORDER BY updated_at DESC").all();
  return (result.results || []).map(mapSubject);
}

export async function listActiveSubjectsWithReadyFileCounts() {
  try {
    await ensureCoreTables();
    const db = getDb();
    const result = await db
      .prepare(
        `SELECT s.*, COUNT(f.id) as ready_count
         FROM subjects s
         LEFT JOIN subject_files f ON f.subject_id = s.id AND f.is_active = 1 AND f.status = 'READY'
         WHERE s.is_archived = 0
         GROUP BY s.id
         ORDER BY s.code ASC`
      )
      .all();

    return (result.results || []).map((r: any) => ({ ...mapSubject(r), readyCount: Number(r.ready_count || 0) }));
  } catch (error) {
    logger.error("Unable to load active subjects with file counts. Falling back to subject list.", error);
    try {
      const subjects = await listSubjects();
      return subjects
        .filter((subject) => !subject.isArchived)
        .map((subject) => ({ ...subject, readyCount: 0 }));
    } catch (fallbackError) {
      logger.error("Fallback subject list load failed. Returning empty list.", fallbackError);
      return [];
    }
  }
}

export async function getSubjectById(id: string) {
  await ensureCoreTables();
  const db = getDb();
  const row = await db.prepare("SELECT * FROM subjects WHERE id = ?").bind(id).first();
  return row ? mapSubject(row) : null;
}

export async function createSubject(input: { code: string; name: string; description?: string; vectorStoreId: string }) {
  await ensureCoreTables();
  const db = getDb();
  const id = newId();
  const now = nowIso();
  await db
    .prepare(
      "INSERT INTO subjects (id, code, name, description, is_archived, vector_store_id, created_at, updated_at) VALUES (?, ?, ?, ?, 0, ?, ?, ?)"
    )
    .bind(id, input.code, input.name, input.description ?? null, input.vectorStoreId, now, now)
    .run();
  return getSubjectById(id);
}

export async function updateSubject(id: string, patch: { code?: string; name?: string; description?: string; isArchived?: boolean }) {
  await ensureCoreTables();
  const current = await getSubjectById(id);
  if (!current) return null;

  const db = getDb();
  const now = nowIso();
  await db
    .prepare(
      "UPDATE subjects SET code = ?, name = ?, description = ?, is_archived = ?, updated_at = ? WHERE id = ?"
    )
    .bind(
      patch.code ?? current.code,
      patch.name ?? current.name,
      patch.description ?? current.description,
      patch.isArchived === undefined ? (current.isArchived ? 1 : 0) : patch.isArchived ? 1 : 0,
      now,
      id
    )
    .run();

  return getSubjectById(id);
}

export async function deleteSubject(id: string) {
  await ensureCoreTables();
  const db = getDb();
  await db.prepare("DELETE FROM subjects WHERE id = ?").bind(id).run();
}

export async function listSubjectFiles(subjectId: string) {
  await ensureCoreTables();
  const db = getDb();
  const result = await db
    .prepare("SELECT * FROM subject_files WHERE subject_id = ? ORDER BY uploaded_at DESC")
    .bind(subjectId)
    .all();

  return (result.results || []).map((r: any) => ({
    id: r.id,
    subjectId: r.subject_id,
    displayName: r.display_name,
    openaiFileId: r.openai_file_id,
    status: r.status,
    uploadedAt: r.uploaded_at,
    uploadedBy: r.uploaded_by,
    notes: r.notes,
    isActive: toBool(r.is_active)
  }));
}

export async function createSubjectFile(input: { subjectId: string; displayName: string; uploadedBy?: string; notes?: string }) {
  await ensureCoreTables();
  const db = getDb();
  const id = newId();
  await db
    .prepare(
      "INSERT INTO subject_files (id, subject_id, display_name, openai_file_id, status, uploaded_at, uploaded_by, notes, is_active) VALUES (?, ?, ?, 'pending', 'UPLOADING', ?, ?, ?, 1)"
    )
    .bind(id, input.subjectId, input.displayName, nowIso(), input.uploadedBy ?? null, input.notes ?? null)
    .run();
  return id;
}

export async function updateSubjectFile(id: string, patch: { status?: string; openaiFileId?: string; isActive?: boolean }) {
  await ensureCoreTables();
  const db = getDb();
  const row = await db.prepare("SELECT * FROM subject_files WHERE id = ?").bind(id).first<any>();
  if (!row) return null;
  await db
    .prepare("UPDATE subject_files SET status = ?, openai_file_id = ?, is_active = ? WHERE id = ?")
    .bind(
      patch.status ?? row.status,
      patch.openaiFileId ?? row.openai_file_id,
      patch.isActive === undefined ? row.is_active : patch.isActive ? 1 : 0,
      id
    )
    .run();
  return true;
}

export async function createChatSession(subjectId: string) {
  await ensureCoreTables();
  const db = getDb();
  const id = newId();
  const now = nowIso();
  await db
    .prepare("INSERT INTO chat_sessions (id, subject_id, created_at, updated_at) VALUES (?, ?, ?, ?)")
    .bind(id, subjectId, now, now)
    .run();
  return { id, subjectId };
}

export async function getChatSession(id: string) {
  await ensureCoreTables();
  const db = getDb();
  const row = await db.prepare("SELECT * FROM chat_sessions WHERE id = ?").bind(id).first<any>();
  if (!row) return null;
  return { id: row.id, subjectId: row.subject_id };
}

export async function addChatMessage(input: { sessionId: string; role: string; content: string; sourceSummary?: string }) {
  await ensureCoreTables();
  const db = getDb();
  await db
    .prepare(
      "INSERT INTO chat_messages (id, session_id, role, content, source_summary, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(newId(), input.sessionId, input.role, input.content, input.sourceSummary ?? null, nowIso())
    .run();
}

export async function logAdminAction(input: { adminId: string; action: string; subjectId?: string; metadata?: unknown }) {
  await ensureCoreTables();
  const db = getDb();
  await db
    .prepare(
      "INSERT INTO admin_action_logs (id, admin_id, action, subject_id, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(newId(), input.adminId, input.action, input.subjectId ?? null, JSON.stringify(input.metadata ?? null), nowIso())
    .run();
}

export async function upsertUser(input: { email: string; name?: string; passwordHash?: string; role?: string }) {
  await ensureCoreTables();
  const db = getDb();
  const now = nowIso();
  const existing = await db.prepare("SELECT * FROM users WHERE email = ?").bind(input.email).first<any>();
  if (existing) {
    await db
      .prepare("UPDATE users SET name = ?, password_hash = COALESCE(?, password_hash), role = ?, updated_at = ? WHERE email = ?")
      .bind(input.name ?? existing.name, input.passwordHash ?? null, input.role ?? existing.role, now, input.email)
      .run();
    return;
  }

  await db
    .prepare("INSERT INTO users (id, email, name, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(newId(), input.email, input.name ?? null, input.passwordHash ?? null, input.role ?? "ADMIN", now, now)
    .run();
}
