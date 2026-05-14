import { pool } from '../config/database.js';
import { randomUUID } from 'crypto';

const allowedFields = [
    'action',
    'log_type',
    'details',
    'extra_data',
    'log_level'
];

const BackendLogModel = {
    tableName: 'backend_logs',
    allowedFields,

    async create(data) {
        const uuid = randomUUID();
        const fields = ['uuid'];
        const values = [uuid];
        const placeholders = ['?'];

        for (const key in data) {
            if (this.allowedFields.includes(key)) {
                fields.push(key);
                if (typeof data[key] === 'object' && data[key] !== null) {
                    values.push(JSON.stringify(data[key]));
                } else {
                    values.push(data[key]);
                }
                placeholders.push('?');
            }
        }

        const sql = `INSERT INTO ${this.tableName} (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;

        try {
            await pool.query(sql, values);
            return this.findByUuid(uuid);
        } catch (error) {
            console.warn('[Logger] Error al guardar en DB:', error.message);
            return null;
        }
    },

    async findByUuid(uuid) {
        const [rows] = await pool.query(
            'SELECT * FROM backend_logs WHERE uuid = ?',
            [uuid]
        );
        return rows[0] || null;
    },

    async findAll(limit = 100) {
        const [rows] = await pool.query(
            'SELECT * FROM backend_logs ORDER BY created_at DESC LIMIT ?',
            [limit]
        );
        return rows;
    }
};

export default BackendLogModel;