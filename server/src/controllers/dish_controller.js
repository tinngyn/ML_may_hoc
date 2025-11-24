const Dish = require('../models/dish');

exports.getAllDishes = async (req, res) => {
    try {
        const { category } = req.query;
        const filter = {};

        // Cho phép lọc món ăn ngay tại endpoint chính bằng query ?category=<id>
        if (category && category !== 'all') {
            filter.id_category = category;
        }

        const dishes = await Dish.find(filter).populate('id_category', 'name');
        res.json(dishes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createDish = async (req, res) => {
    const { name, price, description, id_category } = req.body;
    const dish = new Dish({ name, price, description, id_category });
    try {
        const newDish = await dish.save();
        res.status(201).json(newDish);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateDish = async (req, res) => {
    try {
        const dish = await Dish.findById(req.params.id);
        if (!dish) {
            return res.status(404).json({ message: 'Không tìm thấy món ăn.' });
        }
        Object.assign(dish, req.body);
        const updatedDish = await dish.save();
        res.json(updatedDish);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteDish = async (req, res) => {
    try {
        const dish = await Dish.findById(req.params.id);
        if (!dish) {
            return res.status(404).json({ message: 'Không tìm thấy món ăn.' });
        }
        await Dish.deleteOne({ _id: req.params.id });
        res.json({ message: 'Món ăn đã được xóa.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getDishesByCategory = async (req, res) => {
    // Giữ route cũ để không phá API, nhưng tận dụng logic chung của getAllDishes
    req.query.category = req.params.categoryId;
    return exports.getAllDishes(req, res);
};

exports.rateDish = async (req, res) => {
    const { score } = req.body; 
    if (!score || score < 1 || score > 5) {
        return res.status(400).json({ message: 'Điểm đánh giá phải từ 1 đến 5.' });
    }
    
    try {
        const dish = await Dish.findById(req.params.id);
        if (!dish) {
            return res.status(404).json({ message: 'Không tìm thấy món ăn.' });
        }
        const oldRating = dish.averageRating || 0;
        const count = dish.ratingCount || 0;

        dish.averageRating = ((oldRating * count) + score) / (count + 1);
        dish.ratingCount = count + 1;
        
        await dish.save();
        res.json({ message: 'Đánh giá thành công', newAverageRating: dish.averageRating });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
