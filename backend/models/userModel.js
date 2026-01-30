import db from "../db.js";

// Create a new user
export async function createUser(name, email, hashedPassword) {
  const [result] = await db.query(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, hashedPassword]
  );
  return result.insertId;
}

// Find a user by email
export async function findUserByEmail(email) {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  return rows[0];
}

// Get all users
export async function getAllUsers() {
  const [rows] = await db.query(
    "SELECT id, name, email FROM users"
  );
  return rows;
}

export async function saveResetToken(userId, token, expiry) {
  await db.query(
    "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?",
    [token, expiry, userId]
  );
}

export async function findUserByResetToken(token) {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()",
    [token]
  );
  return rows[0];
}

export async function updatePassword(userId, hashedPassword) {
  await db.query(
    "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?",
    [hashedPassword, userId]
  );
}
