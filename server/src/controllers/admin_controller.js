// Đăng nhập admin với tài khoản cấu hình sẵn
exports.login = (req, res) => {
  const defaultUser = process.env.ADMIN_USER || 'admin';
  const defaultPass = process.env.ADMIN_PASS || '123456';
  const token = process.env.ADMIN_TOKEN || 'supersecretadmin';

  const { username, password } = req.body;

  if (username === defaultUser && password === defaultPass) {
    return res.json({ token, username });
  }

  return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
};
