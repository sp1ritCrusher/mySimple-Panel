import { pool } from "../db.js";

export async function findOne(data) {
    //console.log("TESTE", data);
    const field = Object.keys(data)[0];
    const value = Object.values(data)[0];
    const query = 
    `SELECT * FROM sessions
     WHERE ${field} = $1`; 

    const { rows } = await pool.query(query, [value]);
    return rows[0];
}

export async function remove(data) {
    const field = Object.keys(data)[0];
    const value = Object.values(data)[0];
    const query = 
    `DELETE FROM sessions
     WHERE ${field} = $1
     RETURNING *`; 

    const { rows } = await pool.query(query, [value]);
    return rows[0];
}

export async function create(session) {
    const query = `
        INSERT INTO sessions (user_id, provider, session_id)
        VALUES ($1,$2,$3)
        RETURNING *
        `;

  const values = [
    session.user_id,
    session.provider,
    session.session_id,
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
}