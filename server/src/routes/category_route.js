const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category_controller');
const adminAuth = require('../middleware/admin_auth');

// Lấy tất cả danh mục
router.get('/', categoryController.getAllCategories);

// Tạo danh mục mới
router.post('/', adminAuth, categoryController.createCategory);

// Cập nhật danh mục theo ID
router.put('/:id', adminAuth, categoryController.updateCategory);

// Xóa danh mục theo ID
router.delete('/:id', adminAuth, categoryController.deleteCategory);

module.exports = router;
