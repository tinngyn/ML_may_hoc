const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const apiRoutes = require('./src/routes/index');

const app = express();
const PORT = process.env.PORT || 8000;

connectDB();

console.log('>>> SERVER ĐANG CHẠY FILE NÀY <<<');

// Cấu hình CORS - PHẢI ĐẶT TRƯỚC TẤT CẢ
app.use(cors({
  origin: function (origin, callback) {
    // Cho phép requests không có origin (như Postman, mobile apps)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001'];
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Tạm thời cho phép tất cả để debug
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Admin-Token', 'x-admin-token'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Xử lý OPTIONS requests (preflight)
app.options('*', cors());

app.use((req, res, next) => {
  console.log('👉', req.method, req.url, 'Origin:', req.headers.origin);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route test
app.get('/test', (req, res) => {
  console.log('👉 GET /test handler chạy');
  res.json({ ok: true, msg: 'CORS OK' });
});

// API chính
app.use('/api', apiRoutes);

// Xử lý lỗi 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route không tồn tại' });
});

// Xử lý lỗi toàn cục
app.use((err, req, res, next) => {
  console.error('Lỗi server:', err);
  res.status(500).json({ message: 'Lỗi server nội bộ' });
});

app.listen(PORT, () => {
  console.log(`Server dang chay tren cong ${PORT}`);
});
