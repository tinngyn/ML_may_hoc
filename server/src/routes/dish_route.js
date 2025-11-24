const express = require('express');
const router = express.Router();
const dishController = require('../controllers/dish_controller');
const adminAuth = require('../middleware/admin_auth');

router.get('/', dishController.getAllDishes);

router.post('/', adminAuth, dishController.createDish);

router.get('/category/:categoryId', dishController.getDishesByCategory);

router.put('/:id', adminAuth, dishController.updateDish);

router.delete('/:id', adminAuth, dishController.deleteDish);

// Đánh giá món ăn theo ID
router.post('/:id/rate', dishController.rateDish);

module.exports = router;
