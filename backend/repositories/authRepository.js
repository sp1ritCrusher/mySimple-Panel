import { pool } from "../db.js";

export async function findOne(data) {
    const field = Object.keys(data)[0];
    const value = Object.values(data)[0];
    const query = 
    `SELECT * FROM users_providers
     WHERE ${field} = $1`; 

    const { rows } = await pool.query(query, [value]);
    return rows[0];
}

export async function update(id, data) {
  const fields = Object.keys(data);
  if (fields.length === 0) return null;

  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(", ");
  const values = [...Object.values(data), id];
  const query = `
    UPDATE users_providers
    SET ${setClause}
    WHERE id = $${fields.length + 1}
    RETURNING *
  `;

  const { rows } = await pool.query(query, values);
  return rows[0];
}

export async function create(data) {
  const query = `
    INSERT INTO users_providers (user_id, provider, provider_sub, status)
    VALUES ($1,$2,$3,$4)
    RETURNING *
  `;

  const values = [ data.user_id, data.provider, data.provider_sub, data.status ];

  const { rows } = await pool.query(query, values);
  console.log(rows[0]);
  return rows[0];

}

