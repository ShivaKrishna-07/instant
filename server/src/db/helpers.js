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
  const res = await query('SELECT id, email, name, about, profile_image, created_at FROM users WHERE email = $1', [email]);
  return res.rows[0] || null;
}

export async function userExistsByEmail(email) {
  const res = await query('SELECT id FROM users WHERE email = $1', [email]);
  return res.rows[0] || null;
}

export async function insertUser({ email, name, about, profile_image }) {
  const res = await query(
    'INSERT INTO users (email, name, about, profile_image) VALUES ($1, $2, $3, $4) RETURNING id, email, name, about, profile_image, created_at',
    [email, name, about, profile_image]
  );
  return res.rows[0];
}

export async function getAllUsers() {
  const res = await query('SELECT id, email, name, about, profile_image, created_at FROM users ORDER BY name ASC');
  return res.rows;
}

/** Messages helpers */
export async function insertMessage({ sender_id, receiver_id, type = 'text', message, message_status = 'sent' }) {
  const res = await query(
    'INSERT INTO messages (sender_id, receiver_id, type, message, message_status) VALUES ($1, $2, $3, $4, $5) RETURNING id, sender_id, receiver_id, type, message, message_status, created_at',
    [sender_id, receiver_id, type, message, message_status]
  );
  return res.rows[0];
}

export async function getMessageById(id) {
  const res = await query('SELECT id, sender_id, receiver_id, type, message, message_status, created_at FROM messages WHERE id = $1', [id]);
  return res.rows[0] || null;
}

export async function getMessagesBetweenUsers(userA, userB, limit = 100, offset = 0) {
  const res = await query(
    `SELECT id, sender_id, receiver_id, type, message, message_status, created_at
     FROM messages
     WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
     ORDER BY created_at ASC
     LIMIT $3 OFFSET $4`,
    [userA, userB, limit, offset]
  );
  return res.rows;
}

export async function updateMessageStatus(id, status) {
  const res = await query('UPDATE messages SET message_status = $1 WHERE id = $2 RETURNING id, message_status', [status, id]);
  return res.rows[0] || null;
}

export async function deleteMessage(id) {
  await query('DELETE FROM messages WHERE id = $1', [id]);
  return true;
}

export async function getConversationsForUser(userId) {
  // Get partner ids and latest message time
  const res = await query(
    `SELECT latest.partnerId, u.name, u.profile_image, m.message, m.type, m.message_status, m.created_at as lastMessageAt,
      COALESCE(unread.unreadCount, 0) AS unreadCount
     FROM (
       SELECT CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END AS partnerId, MAX(created_at) AS lastAt
       FROM messages
       WHERE sender_id = $1 OR receiver_id = $1
       GROUP BY partnerId
     ) latest
     JOIN messages m ON ((m.sender_id = $1 AND m.receiver_id = latest.partnerId) OR (m.sender_id = latest.partnerId AND m.receiver_id = $1)) AND m.created_at = latest.lastAt
     JOIN users u ON u.id = latest.partnerId
     LEFT JOIN (
       SELECT sender_id, COUNT(*) AS unreadCount FROM messages WHERE receiver_id = $1 AND message_status != 'read' GROUP BY sender_id
     ) unread ON unread.sender_id = latest.partnerId
     ORDER BY latest.lastAt DESC`,
    [userId]
  );
  return res.rows;
}

export default { query, getUserByEmail, userExistsByEmail, insertUser, getAllUsers, insertMessage, getMessageById, getMessagesBetweenUsers, updateMessageStatus, deleteMessage, getConversationsForUser };
