const Review = require('../models/review');
const Dish = require('../models/dish');

// Tạo đánh giá cho món ăn
exports.createReview = async (req, res) => {
  const { name, phone, score, comment, dishId } = req.body;

  if (!dishId) {
    return res.status(400).json({ message: 'Thiếu dishId của món cần đánh giá' });
  }

  try {
    const dish = await Dish.findById(dishId);
    if (!dish) {
      return res.status(404).json({ message: 'Không tìm thấy món ăn' });
    }

    const review = new Review({
      name,
      phone,
      score,
      comment,
      dish: dishId
    });

    const saved = await review.save();

    // Cập nhật điểm trung bình vào Dish dựa trên toàn bộ review (an toàn hơn)
    const agg = await Review.aggregate([
      { $match: { dish: dish._id } },
      { $group: { _id: '$dish', avgScore: { $avg: '$score' }, count: { $sum: 1 } } }
    ]);

    if (agg[0]) {
      dish.averageRating = agg[0].avgScore;
      dish.ratingCount = agg[0].count;
      await dish.save();
    }

    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Lấy tất cả review (admin)
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('dish', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách đánh giá theo món ăn
exports.getReviewsByDish = async (req, res) => {
  const { dishId } = req.params;
  try {
    const reviews = await Review.find({ dish: dishId })
      .sort({ createdAt: -1 })
      .lean();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
