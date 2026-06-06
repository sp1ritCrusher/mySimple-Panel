import { pool } from "../db.js";

export async function createLog({ type, domain, description, actioner, target, action, data, ip, session }) {
  const query = `
    INSERT INTO logs (type, domain, description, actioner, target, action, data, ip, session)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *
  `;

  const values = [
    type,
    domain,
    description,
    actioner,
    target,
    action,
    Array.isArray(data) ? JSON.stringify(data) : JSON.stringify(data),
    ip,
    session
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
}

export async function findById(id) {
    const query = 
    `SELECT * FROM logs
     WHERE id = $1`; 

    const { rows } = await pool.query(query, [id]);
    return rows[0];
}

export async function findByOrder() {
  const query = `
    SELECT *
    FROM logs
    ORDER BY created_at DESC
  `;
  const { rows } = await pool.query(query);
  return rows;
}

export async function findAny() {
  const query = `SELECT * FROM logs ORDER BY created_at ASC`;
  const { rows } = await pool.query(query);
  return rows;
}

export async function deleteAll() {
  await pool.query(`DELETE FROM logs`);
}