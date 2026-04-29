import { pool } from "../db.js";

export async function getUsers() {
    const query = ` SELECT * FROM users `;
    const { rows } = await pool.query(query);
    return rows;
}

export async function findById(id) {
    const query = 
    `SELECT * FROM users
     WHERE id = $1`; 

    const { rows } = await pool.query(query, [id]);
    return rows[0];
}

export async function findByEmail(email) {
    const query = 
    ` SELECT * FROM users
     WHERE email = $1 `; 

    const { rows } = await pool.query(query, [email]);
    return rows[0];
}

export async function deletebyId(id) {
    const query = 
    ` DELETE FROM users
     WHERE id = $1 
     RETURNING * `; 

    const { rows } = await pool.query(query, [id]);
    return rows[0];
}

export async function findOne(data) {
  if (data.$or) {
    const conditions = [];
    const values = [];

    data.$or.forEach((obj, index) => {
      const field = Object.keys(obj)[0];
      conditions.push(`${field} = $${index + 1}`);
      values.push(Object.values(obj)[0]);
    });
    const query = `SELECT * FROM users WHERE ${conditions.join(" OR ")}`;
    const { rows } = await pool.query(query, values);
    return rows[0];
  } else {
    const field = Object.keys(data)[0];
    const value = Object.values(data)[0];
    const query = `SELECT * FROM users WHERE ${field} = $1`;
    const { rows } = await pool.query(query, [value]);
    return rows[0];
  }
}


export async function update(id, data) {
  const fields = Object.keys(data);
  if (fields.length === 0) return null;

  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(", ");
  const values = [...Object.values(data), id];
  const query = `
    UPDATE users
    SET ${setClause}
    WHERE id = $${fields.length + 1}
    RETURNING *
  `;

  const { rows } = await pool.query(query, values);
  return rows[0];
}


export async function create(user) {
const query = `
    INSERT INTO users (name, email, password_hash, phone, status, power)
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING *
  `;

  const values = [
    user.name,
    user.email,
    user.password_hash,
    user.phone,
    user.status,
    user.power,
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
}