// Simple admin token check for protected routes
module.exports = function adminAuth(req, res, next) {
  const expectedToken = process.env.ADMIN_TOKEN || 'supersecretadmin';
  const token = req.headers['x-admin-token'];

  if (!token || token !== expectedToken) {
    return res.status(401).json({ message: 'Bạn không có quyền truy cập.' });
  }

  next();
};
