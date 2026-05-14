import BackendLogModel from '../models/BackendLogModel.js';

const formatTimestamp = () => new Date().toISOString();

const formatOutput = (logLevel, logType, action, details) => {
    const timestamp = formatTimestamp();
    const actionStr = action ? ` | action: ${action}` : '';
    return `[${logLevel.toUpperCase()}] [${timestamp}] | ${logType}${actionStr} | ${details}`;
};

const log = async (options) => {
    const { action, log_type, details, extra_data, log_level } = options;

    const consoleMsg = formatOutput(log_level, log_type, action, details);

    if (log_level === 'error') {
        console.error(consoleMsg);
    } else if (log_level === 'warn') {
        console.warn(consoleMsg);
    } else {
        console.log(consoleMsg);
    }

    try {
        await BackendLogModel.create({
            action: action || null,
            log_type,
            details,
            extra_data: extra_data || null,
            log_level
        });
    } catch (error) {
        console.warn('[Logger] Error al persistir log:', error.message);
    }
};

const logger = {
    log: async (options) => await log(options),

    info: async (logType, details, extraData = null) => {
        await log({
            action: null,
            log_type: logType,
            details,
            extra_data: extraData,
            log_level: 'info'
        });
    },

    warn: async (logType, details, extraData = null) => {
        await log({
            action: null,
            log_type: logType,
            details,
            extra_data: extraData,
            log_level: 'warn'
        });
    },

    error: async (logType, details, extraData = null) => {
        await log({
            action: null,
            log_type: logType,
            details,
            extra_data: extraData,
            log_level: 'error'
        });
    },

    crud: async (action, logType, details, extraData = null) => {
        const validActions = ['create', 'update', 'delete'];
        if (!validActions.includes(action)) {
            throw new Error(`Invalid action: ${action}. Must be one of: ${validActions.join(', ')}`);
        }
        await log({
            action,
            log_type: logType,
            details,
            extra_data: extraData,
            log_level: 'info'
        });
    }
};

export default logger;