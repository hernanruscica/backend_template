import pool from '../config/database.js';

export const permissionMiddleware = async (req, res, next) => {
  if (!req.route) {
    return next();
  }

  const userRoles = req.user.roles;
  const method = req.method;
  let entity = req.baseUrl.split('/').pop();

  
  // Differentiate between soft and hard delete
  if (method === 'DELETE') {
    const isOwner = userRoles.includes('owner');
    if (isOwner) {
      req.hardDelete = true;
    }
  }

  try {
    if (!userRoles || userRoles.length === 0) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const connection = await pool.getConnection();
    try {
      const placeholders = userRoles.map(() => '?').join(',');
      const query = `
        SELECT COUNT(*) AS count
        FROM role_permissions rp
        JOIN roles r ON rp.role_uuid = r.uuid
        WHERE r.name IN (${placeholders})
          AND rp.action = ?
          AND rp.entity = ?
      `;
      
      const [rows] = await connection.execute(query, [...userRoles, method, entity]);
      
      if (rows[0].count > 0) {
        next();
      } else {
        res.status(403).json({ message: 'Forbidden' });
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Permission check failed:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
