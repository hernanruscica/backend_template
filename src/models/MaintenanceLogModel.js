import BaseModel from './BaseModel.js';
import { pool } from '../config/database.js';

const allowedFields = [
    'business_uuid',
    'title',
    'description',
    'type',
    'priority',
    'status',
    'time_usage',
    'channel_uuid',
    'datalogger_uuid',
    'completed_at',
    'completed_by',
    'is_active'
];

const MaintenanceLogModel = {
    ...BaseModel('maintenance_logs', allowedFields),

    async findAllByBusinessUuid(businessUuid) {
        const allItems = await this.findAll();
        return allItems.filter(item => item.business_uuid === businessUuid);
    },

    async findAllByDataloggerUuid(dataloggerUuid, businessUuid) {
        const [rows] = await pool.query(
            `SELECT ml.*, 
                    b.name as business_name
             FROM maintenance_logs ml
             LEFT JOIN businesses b ON ml.business_uuid = b.uuid
             WHERE ml.datalogger_uuid = ? 
               AND ml.business_uuid = ?
               AND ml.is_active = true
             ORDER BY ml.created_at DESC`,
            [dataloggerUuid, businessUuid]
        );
        return rows;
    },

    async findAllByDataloggerAndChannel(dataloggerUuid, channelUuid, businessUuid) {
        const [rows] = await pool.query(
            `SELECT ml.*, 
                    b.name as business_name
             FROM maintenance_logs ml
             LEFT JOIN businesses b ON ml.business_uuid = b.uuid
             WHERE ml.datalogger_uuid = ? 
               AND ml.channel_uuid = ?
               AND ml.business_uuid = ?
               AND ml.is_active = 1
             ORDER BY ml.created_at DESC`,
            [dataloggerUuid, channelUuid, businessUuid]
        );
        console.log("Maintenance logs fetched from database:", rows);
        return rows;
    },

    async findByUuid(uuid) {
        const [rows] = await pool.query(
            `SELECT ml.*, 
                    b.name as business_name
             FROM maintenance_logs ml
             LEFT JOIN businesses b ON ml.business_uuid = b.uuid
             WHERE ml.uuid = ?`,
            [uuid]
        );
        return rows[0] || null;
    },

    async complete(uuid, completedBy) {
        const [result] = await pool.query(
            `UPDATE maintenance_logs 
             SET status = 'completed', 
                 completed_at = NOW(), 
                 completed_by = ?,
                 updated_by = ?
             WHERE uuid = ?`,
            [completedBy, completedBy, uuid]
        );
        return result;
    }
};

export default MaintenanceLogModel;
