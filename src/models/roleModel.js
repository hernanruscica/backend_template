import pool from '../config/database.js';
import { randomUUID } from 'crypto';

export const RoleModel = {
  async create({ name, description, hierarchy_level, createdBy }) {
    const uuid = randomUUID();
    const sql = `
      INSERT INTO roles (uuid, name, description, hierarchy_level, created_by)
      VALUES (?, ?, ?, ?, ?)
    `;
    await pool.query(sql, [uuid, name, description, hierarchy_level, createdBy]);
    const newRole = await this.findByUuid(uuid);
    return newRole;
  },

  async findByUuid(uuid) {
    const sql = 'SELECT * FROM roles WHERE uuid = ?';
    const [rows] = await pool.query(sql, [uuid]);
    return rows[0];
  },

  async findByName(name) {
    const sql = 'SELECT * FROM roles WHERE name = ?';
    const [rows] = await pool.query(sql, [name]);
    return rows[0];
  },

  async addPermission(roleUuid, action, entity, createdBy) {
    const sql = 'INSERT INTO role_permissions (role_uuid, action, entity, created_by) VALUES (?, ?, ?, ?)';
    await pool.query(sql, [roleUuid, action, entity, createdBy]);
  },

  async getPermissions(roleUuid) {
    const sql = `
      SELECT action, entity
      FROM role_permissions
      WHERE role_uuid = ?
    `;
    const [rows] = await pool.query(sql, [roleUuid]);
    return rows;
  },

  async findAll() {
    const sql = 'SELECT * FROM roles';
    const [rows] = await pool.query(sql);
    return rows;
  },

  async update(uuid, fields, updatedBy) {
    const allowedFields = ['name', 'description', 'hierarchy_level'];
    
    const fieldEntries = Object.entries(fields);
    const validFields = fieldEntries.filter(([key]) => allowedFields.includes(key));
    
    let setClause = validFields.map(([key]) => `${key} = ?`).join(', ');
    const values = validFields.map(([, value]) => value);

    if (updatedBy) {
        if (setClause) {
            setClause += ', ';
        }
        setClause += 'updated_by = ?';
        values.push(updatedBy);
    }

    if (values.length === 0) {
      return { affectedRows: 0 };
    }

    const sql = `UPDATE roles SET ${setClause} WHERE uuid = ?`;
    const [result] = await pool.query(sql, [...values, uuid]);
    return result;
  },

  async delete(uuid) {
    const sql = 'DELETE FROM roles WHERE uuid = ?';
    const [result] = await pool.query(sql, [uuid]);
    return result;
  }
};
