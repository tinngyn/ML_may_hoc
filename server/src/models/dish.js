const mongoose = require('mongoose');

const DishSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên món ăn là bắt buộc'],
    trim: true,
    unique: true
  },

  price: {
    type: Number,
    required: [true, 'Giá là bắt buộc'],
    min: [0, 'Giá không được âm']
  },
  image: {
    type: String,
  },

  description: {
    type: String,
    default: 'Không có mô tả.'
  },
  id_category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', 
    required: [true, 'Món ăn phải thuộc về một danh mục']
  },
  averageRating: {
    type: Number,
    min: [0, 'Điểm không hợp lệ'],
    default: 0
  },
  ratingCount: {
    type: Number,
    min: [0, 'Số lượt không hợp lệ'],
    default: 0
  },
  dateCreated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Dish', DishSchema);
