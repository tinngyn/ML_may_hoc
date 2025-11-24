const express = require('express');
const router = express.Router();

const categoryRoutes = require('./category_route'); 
const dishRoutes = require('./dish_route');         
const reviewRoutes = require('./review_route');
const adminRoutes = require('./admin_route');

router.use('/categories', categoryRoutes);

router.use('/dishes', dishRoutes);

router.use('/reviews', reviewRoutes);

router.use('/admin', adminRoutes);

module.exports = router;
