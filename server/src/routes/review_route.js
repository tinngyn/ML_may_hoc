const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review_controller');
const adminAuth = require('../middleware/admin_auth');

// Tạo review mới
router.post('/', reviewController.createReview);

// Lấy tất cả review (admin)
router.get('/', adminAuth, reviewController.getAllReviews);

// Lấy review theo món
router.get('/dish/:dishId', reviewController.getReviewsByDish);

module.exports = router;
