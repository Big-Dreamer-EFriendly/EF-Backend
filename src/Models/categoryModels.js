const mongoose = require('mongoose');
const { Schema } = mongoose;


const CategorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  
});

const Category = mongoose.model('categories', CategorySchema);
module.exports = Category;
