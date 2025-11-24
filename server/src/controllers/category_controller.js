const Category = require('../models/category');

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createCategory = async (req, res) => {
    const category = new Category({ name: req.body.name });
    try {
        const newCategory = await category.save();
        res.status(201).json(newCategory);
    } catch (err) {

        if (err.code === 11000) {
            return res.status(400).json({ message: 'Tên danh mục đã tồn tại.' });
        }
        res.status(400).json({ message: err.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Không tìm thấy danh mục.' });
        }
        category.name = req.body.name;
        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 4. Xóa Danh Mục (DELETE)
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Không tìm thấy danh mục.' });
        }
        await Category.deleteOne({ _id: req.params.id });
        res.json({ message: 'Danh mục đã được xóa.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};