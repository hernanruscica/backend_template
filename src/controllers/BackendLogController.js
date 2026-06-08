import BackendLogService from '../services/BackendLogService.js';
import catchAsync from '../utils/catchAsync.js';

const getAll = catchAsync(async (req, res, next) => {
    const { log_type, log_level, action, start_date, end_date, limit } = req.query;

    const filters = {
        log_type,
        log_level,
        action,
        start_date,
        end_date,
        limit
    };

    const logs = await BackendLogService.getAll(filters);

    res.status(200).json({
        success: true,
        count: logs.length,
        items: logs
    });
});

const getByUuid = catchAsync(async (req, res, next) => {
    const { uuid } = req.params;

    const log = await BackendLogService.getByUuid(uuid);

    if (!log) {
        return res.status(404).json({
            success: false,
            message: 'Log not found'
        });
    }

    res.status(200).json({
        success: true,
        item: log
    });
});

const create = catchAsync(async (req, res, next) => {
    const { action, log_type, details, extra_data, log_level } = req.body;

    const log = await BackendLogService.create({
        action,
        log_type,
        details,
        extra_data,
        log_level
    });

    res.status(201).json({
        success: true,
        message: 'Log created successfully',
        item: log
    });
});

export const BackendLogController = {
    getAll,
    getByUuid,
    create
};