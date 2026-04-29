import { pool } from "../db.js";

export async function findById(id) {
    const query = 
    `SELECT * FROM products
     WHERE id = $1`; 

    const { rows } = await pool.query(query, [id]);
    return rows[0];
}

export async function create(product) {
    const query = `
    INSERT INTO products (code, name, description, price, amount, user_id)
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING *
  `;

  const values = [
    product.code,
    product.name,
    product.description,
    product.price,
    product.amount,
    product.user_id
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
}

export async function findByName(name) {
    const query = 
    ` SELECT * FROM products
     WHERE name = $1 `; 

    const { rows } = await pool.query(query, [name]);
    return rows[0];
}

export async function update(id, data) {
  const fields = Object.keys(data);

  if (fields.length === 0) return null;

  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(", ");
  const values = [...Object.values(data), id];

  const query = `
    UPDATE products
    SET ${setClause}
    WHERE id = $${fields.length + 1}
    RETURNING *
  `;

  const { rows } = await pool.query(query, values);
  return rows[0];
}

export async function removebyId(id) {
    const query = 
    ` DELETE FROM products
     WHERE id = $1 
     RETURNING * `; 

    const { rows } = await pool.query(query, [id]);
    return rows[0];
}

export async function findAny(id) {
    const query = ` SELECT * FROM products
    WHERE user_id = $1`;
    const { rows } = await pool.query(query, [id]);
    return rows;
}