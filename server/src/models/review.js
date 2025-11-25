const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên người đánh giá là bắt buộc'],
      trim: true,
      maxlength: [100, 'Tên tối đa 100 ký tự']
    },
    phone: {
      type: String,
      required: [true, 'Số điện thoại là bắt buộc'],
      trim: true,
      match: [/^[0-9]{9,11}$/, 'Số điện thoại không hợp lệ']
    },
    score: {
      type: Number,
      required: [true, 'Điểm đánh giá là bắt buộc'],
      min: [1, 'Điểm tối thiểu là 1'],
      max: [5, 'Điểm tối đa là 5']
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Nhận xét tối đa 500 ký tự']
    },
    dish: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dish',
      required: [true, 'Thiếu id món ăn']
    },
    // ✅ Kết quả phân tích cảm xúc từ AI
    ai_sentiment: {
      type: String,
      default: 'Chưa phân tích'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Review', ReviewSchema);
