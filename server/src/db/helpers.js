import pool from './index.js';

/**
 * Execute a parametrized query against the Postgres pool.
 * @param {string} text SQL text with $n placeholders
 * @param {Array} params parameter values
 * @returns {Promise<object>} result object with `rows` and `rowCount`
 */
export async function query(text, params = []) {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (err) {
    console.error('DB query error', { text, params, err: err?.message || err });
    throw err;
  }
}

/**
 * Get a user by email
 * @param {string} email
 * @returns {Promise<object|null>} user row or null
 */
export async function getUserByEmail(email) {
  const res = await query('SELECT id, email, name, about, profileImage, createdAt FROM users WHERE email = $1', [email]);
  return res.rows[0] || null;
}

export async function userExistsByEmail(email) {
  const res = await query('SELECT id FROM users WHERE email = $1', [email]);
  return res.rows[0] || null;
}

export async function insertUser({ email, name, about, profileImage }) {
  const res = await query(
    'INSERT INTO users (email, name, about, profileImage) VALUES ($1, $2, $3, $4) RETURNING id, email, name, about, profileImage, createdAt',
    [email, name, about, profileImage]
  );
  return res.rows[0];
}

export async function getAllUsers() {
  const res = await query('SELECT id, email, name, about, profileImage, createdAt FROM users ORDER BY name ASC');
  return res.rows;
}

/** Messages helpers */
export async function insertMessage({ senderId, receiverId, type = 'text', message, messageStatus = 'sent' }) {
  const res = await query(
    'INSERT INTO messages (senderId, receiverId, type, message, messageStatus) VALUES ($1, $2, $3, $4, $5) RETURNING id, senderId, receiverId, type, message, messageStatus, createdAt',
    [senderId, receiverId, type, message, messageStatus]
  );
  return res.rows[0];
}

export async function getMessageById(id) {
  const res = await query('SELECT id, senderId, receiverId, type, message, messageStatus, createdAt FROM messages WHERE id = $1', [id]);
  return res.rows[0] || null;
}

export async function getMessagesBetweenUsers(userA, userB, limit = 100, offset = 0) {
  const res = await query(
    `SELECT id, senderId, receiverId, type, message, messageStatus, createdAt
     FROM messages
     WHERE (senderId = $1 AND receiverId = $2) OR (senderId = $2 AND receiverId = $1)
     ORDER BY createdAt ASC
     LIMIT $3 OFFSET $4`,
    [userA, userB, limit, offset]
  );
  return res.rows;
}

export async function updateMessageStatus(id, status) {
  const res = await query('UPDATE messages SET messageStatus = $1 WHERE id = $2 RETURNING id, messageStatus', [status, id]);
  return res.rows[0] || null;
}

export async function deleteMessage(id) {
  await query('DELETE FROM messages WHERE id = $1', [id]);
  return true;
}

export async function getConversationsForUser(userId) {
  // Get partner ids and latest message time
  const res = await query(
    `SELECT latest.partnerId, u.name, u.profileImage, m.message, m.type, m.messageStatus, m.createdAt as lastMessageAt,
      COALESCE(unread.unreadCount, 0) AS unreadCount
     FROM (
       SELECT CASE WHEN senderId = $1 THEN receiverId ELSE senderId END AS partnerId, MAX(createdAt) AS lastAt
       FROM messages
       WHERE senderId = $1 OR receiverId = $1
       GROUP BY partnerId
     ) latest
     JOIN messages m ON ((m.senderId = $1 AND m.receiverId = latest.partnerId) OR (m.senderId = latest.partnerId AND m.receiverId = $1)) AND m.createdAt = latest.lastAt
     JOIN users u ON u.id = latest.partnerId
     LEFT JOIN (
       SELECT senderId, COUNT(*) AS unreadCount FROM messages WHERE receiverId = $1 AND messageStatus != 'read' GROUP BY senderId
     ) unread ON unread.senderId = latest.partnerId
     ORDER BY latest.lastAt DESC`,
    [userId]
  );
  return res.rows;
}

export default { query, getUserByEmail, userExistsByEmail, insertUser, getAllUsers, insertMessage, getMessageById, getMessagesBetweenUsers, updateMessageStatus, deleteMessage, getConversationsForUser };
