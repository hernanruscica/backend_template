import BackendLogModel from '../models/BackendLogModel.js';

const BackendLogService = {
    async getAll(filters = {}) {
        const { log_type, log_level, action, limit = 100 } = filters;

        let whereClause = '';
        const params = [];
        const conditions = [];

        if (log_type) {
            conditions.push('log_type = ?');
            params.push(log_type);
        }
        if (log_level) {
            conditions.push('log_level = ?');
            params.push(log_level);
        }
        if (action) {
            conditions.push('action = ?');
            params.push(action);
        }

        whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

        const sql = `
            SELECT * FROM backend_logs
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT ?
        `;

        const { pool } = await import('../config/database.js');
        const [rows] = await pool.query(sql, [...params, parseInt(limit)]);

        return rows;
    },

    async getByUuid(uuid) {
        return await BackendLogModel.findByUuid(uuid);
    },

    async create(data) {
        return await BackendLogModel.create(data);
    }
};

export default BackendLogService;