import mongoose, { Schema } from 'mongoose';

const categorySchema = new Schema(
    {
      categoryName: { type: String, required: true },
      url: String,
      parentCategory: String,
      description: String,
      sortOrder: String,
      isVisible: Boolean,
      smartCategory: Boolean,
      productMustWatch: Boolean,
    },
    { timestamps: true },
);

const Category = mongoose.model('Category', categorySchema);
export default Category;