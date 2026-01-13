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
