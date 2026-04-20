const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'boi.db'));

// ── Schema ────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS rp_names (
    user_id TEXT PRIMARY KEY,
    rp_name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS timed_strikes (
    user_id    TEXT PRIMARY KEY,
    expires_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS investigations (
    user_id   TEXT PRIMARY KEY,
    roles     TEXT NOT NULL,
    reason    TEXT,
    initiated_by TEXT,
    initiated_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS pending_demotions (
    message_id   TEXT PRIMARY KEY,
    executor_id  TEXT NOT NULL,
    target_id    TEXT NOT NULL,
    old_role_id  TEXT NOT NULL,
    new_role_id  TEXT NOT NULL,
    reason       TEXT NOT NULL,
    evidence     TEXT,
    created_at   INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS action_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    type        TEXT NOT NULL,
    target_id   TEXT NOT NULL,
    executor_id TEXT NOT NULL,
    reason      TEXT,
    evidence    TEXT,
    extra       TEXT,
    created_at  INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS appeal_drafts (
    user_id    TEXT PRIMARY KEY,
    reason     TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS pending_appeals (
    message_id  TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL,
    record_id   INTEGER NOT NULL,
    reason      TEXT NOT NULL,
    created_at  INTEGER NOT NULL
  );
`);

// ── RP Names ─────────────────────────────────────────────────────

function saveRpName(userId, rpName) {
  db.prepare('INSERT OR REPLACE INTO rp_names (user_id, rp_name) VALUES (?, ?)').run(userId, rpName);
}

function getRpName(userId) {
  const row = db.prepare('SELECT rp_name FROM rp_names WHERE user_id = ?').get(userId);
  return row ? row.rp_name : null;
}

// ── Timed Strikes ─────────────────────────────────────────────────

function saveTimedStrike(userId, expiresAt) {
  db.prepare('INSERT OR REPLACE INTO timed_strikes (user_id, expires_at) VALUES (?, ?)').run(userId, expiresAt);
}

function getTimedStrike(userId) {
  return db.prepare('SELECT * FROM timed_strikes WHERE user_id = ?').get(userId) || null;
}

function deleteTimedStrike(userId) {
  db.prepare('DELETE FROM timed_strikes WHERE user_id = ?').run(userId);
}

function getExpiredStrikes() {
  return db.prepare('SELECT * FROM timed_strikes WHERE expires_at <= ?').all(Date.now());
}

// ── Investigations ────────────────────────────────────────────────

function startInvestigation(userId, roles, reason, initiatedBy) {
  db.prepare(`
    INSERT OR REPLACE INTO investigations (user_id, roles, reason, initiated_by, initiated_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, JSON.stringify(roles), reason, initiatedBy, Date.now());
}

function getInvestigation(userId) {
  const row = db.prepare('SELECT * FROM investigations WHERE user_id = ?').get(userId);
  if (!row) return null;
  return { ...row, roles: JSON.parse(row.roles) };
}

function clearInvestigation(userId) {
  db.prepare('DELETE FROM investigations WHERE user_id = ?').run(userId);
}

function getAllInvestigations() {
  return db.prepare('SELECT * FROM investigations').all().map(r => ({ ...r, roles: JSON.parse(r.roles) }));
}

// ── Pending Demotions ─────────────────────────────────────────────

function savePendingDemotion(messageId, data) {
  db.prepare(`
    INSERT OR REPLACE INTO pending_demotions
    (message_id, executor_id, target_id, old_role_id, new_role_id, reason, evidence, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(messageId, data.executorId, data.targetId, data.oldRoleId, data.newRoleId, data.reason, data.evidence || null, Date.now());
}

function getPendingDemotion(messageId) {
  const row = db.prepare('SELECT * FROM pending_demotions WHERE message_id = ?').get(messageId);
  if (!row) return null;
  return {
    executorId: row.executor_id,
    targetId:   row.target_id,
    oldRoleId:  row.old_role_id,
    newRoleId:  row.new_role_id,
    reason:     row.reason,
    evidence:   row.evidence,
  };
}

function deletePendingDemotion(messageId) {
  db.prepare('DELETE FROM pending_demotions WHERE message_id = ?').run(messageId);
}

// ── Action Log ────────────────────────────────────────────────────

function logAction(type, targetId, executorId, reason, evidence, extra) {
  db.prepare(`
    INSERT INTO action_log (type, target_id, executor_id, reason, evidence, extra, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(type, targetId, executorId, reason || null, evidence || null, extra ? JSON.stringify(extra) : null, Date.now());
}

function getHistory(targetId, limit = 20) {
  return db.prepare(`
    SELECT * FROM action_log WHERE target_id = ? ORDER BY created_at DESC LIMIT ?
  `).all(targetId, limit);
}

function getActionById(id) {
  return db.prepare('SELECT * FROM action_log WHERE id = ?').get(id) || null;
}

// ── Appeals ──────────────────────────────────────────────────

function saveAppealDraft(userId, reason) {
  db.prepare('INSERT OR REPLACE INTO appeal_drafts (user_id, reason, created_at) VALUES (?, ?, ?)').run(userId, reason, Date.now());
}

function getAppealDraft(userId) {
  return db.prepare('SELECT * FROM appeal_drafts WHERE user_id = ?').get(userId) || null;
}

function deleteAppealDraft(userId) {
  db.prepare('DELETE FROM appeal_drafts WHERE user_id = ?').run(userId);
}

function savePendingAppeal(messageId, data) {
  db.prepare('INSERT OR REPLACE INTO pending_appeals (message_id, user_id, record_id, reason, created_at) VALUES (?, ?, ?, ?, ?)').run(messageId, data.userId, data.recordId, data.reason, Date.now());
}

function getPendingAppeal(messageId) {
  return db.prepare('SELECT * FROM pending_appeals WHERE message_id = ?').get(messageId) || null;
}

function deletePendingAppeal(messageId) {
  db.prepare('DELETE FROM pending_appeals WHERE message_id = ?').run(messageId);
}

module.exports = {
  saveRpName, getRpName,
  saveTimedStrike, getTimedStrike, deleteTimedStrike, getExpiredStrikes,
  saveAppealDraft, getAppealDraft, deleteAppealDraft,
  savePendingAppeal, getPendingAppeal, deletePendingAppeal,
  getActionById,
  startInvestigation, getInvestigation, clearInvestigation, getAllInvestigations,
  savePendingDemotion, getPendingDemotion, deletePendingDemotion,
  logAction, getHistory,
};
