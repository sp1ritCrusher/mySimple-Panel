import { pool } from "../db.js";

export async function findOne(data) {
    const field = Object.keys(data)[0];
    const value = Object.values(data)[0];
    const query = 
    `SELECT * FROM security_codes
     WHERE ${field} = $1`; 

    const { rows } = await pool.query(query, [value]);
    return rows[0];
}

export async function create(code) {
const query = `
    INSERT INTO security_codes (user_id, code, context)
    VALUES ($1,$2,$3)
    RETURNING *
  `;

  const values = [
    code.user_id,
    code.code,
    code.context
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
}

export async function deleteOne(data) {
    const field = Object.keys(data)[0];
    const value = Object.values(data)[0];
    const query = 
    `DELETE FROM security_codes
     WHERE ${field} = $1
     RETURNING *`; 
    const { rows } = await pool.query(query, [value]);
    return rows[0];
}