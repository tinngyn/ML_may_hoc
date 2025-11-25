// server/src/controllers/review_controller.js
const Review = require('../models/review');
const Dish = require('../models/dish');
const AI_Log = require('../models/ai_log');
const { execFile } = require('child_process');
const path = require('path');

// =======================
// HÀM GỌI PYTHON AI
// =======================
function runAI(comment) {
  return new Promise((resolve) => {
    // __dirname = server/src/controllers
    const scriptPath = path.join(__dirname, '..', '..', 'ml_ai', 'predict.py');
    // => server/ml_ai/predict.py
    console.log('🔎 [AI] Gọi python với comment =', comment);
    console.log('🔎 [AI] scriptPath =', scriptPath);

    execFile('python3', [scriptPath, comment], (err, stdout, stderr) => {
      if (err) {
        console.error('❌ [AI] Lỗi execFile:', err);
        if (stderr) console.error('❌ [AI] stderr:', stderr.toString());
        return resolve('AI lỗi');
      }

      const out = (stdout || '').toString().trim();
      if (stderr) console.error('⚠️ [AI] stderr:', stderr.toString());
      console.log('✅ [AI] stdout =', out);

      resolve(out || 'Chưa phân tích');
    });
  });
}

// =======================
// TẠO ĐÁNH GIÁ
// =======================
exports.createReview = async (req, res) => {
  const { name, phone, score, comment, dishId } = req.body;

  if (!dishId) {
    return res
      .status(400)
      .json({ message: 'Thiếu dishId của món cần đánh giá' });
  }

  try {
    const dish = await Dish.findById(dishId);
    if (!dish) {
      return res.status(404).json({ message: 'Không tìm thấy món ăn' });
    }

    // 1️⃣ Gọi AI phân tích comment
    const aiSentiment = await runAI(comment || '');
    console.log('✨ [AI] Kết quả cho review:', aiSentiment);

    // 2️⃣ Lưu review kèm kết quả AI
    const review = new Review({
      name,
      phone,
      score,
      comment,
      dish: dishId,
      ai_sentiment: aiSentiment,
    });

    const saved = await review.save();

    // 3️⃣ Lưu log AI
    await AI_Log.create({
      text: comment,
      sentiment: aiSentiment,
      dish: dishId,
    });

    // 4️⃣ Cập nhật điểm trung bình cho Dish
    const agg = await Review.aggregate([
      { $match: { dish: dish._id } },
      {
        $group: {
          _id: '$dish',
          avgScore: { $avg: '$score' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (agg[0]) {
      dish.averageRating = agg[0].avgScore;
      dish.ratingCount = agg[0].count;
      await dish.save();
    }

    res.status(201).json(saved);
  } catch (err) {
    console.error('❌ createReview error:', err);
    res.status(400).json({ message: err.message });
  }
};

// =======================
// LẤY TẤT CẢ REVIEW (ADMIN)
// =======================
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('dish', 'name')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error('❌ getAllReviews error:', err);
    res.status(500).json({ message: err.message });
  }
};

// =======================
// LẤY REVIEW THEO MÓN
// =======================
exports.getReviewsByDish = async (req, res) => {
  const { dishId } = req.params;

  try {
    const reviews = await Review.find({ dish: dishId })
      .sort({ createdAt: -1 })
      .lean();

    res.json(reviews);
  } catch (err) {
    console.error('❌ getReviewsByDish error:', err);
    res.status(500).json({ message: err.message });
  }
};
