const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
  Name: {
    type: [String],
    required: true,
  },
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
