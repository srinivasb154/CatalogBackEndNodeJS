import mongoose, { Schema } from 'mongoose';

const brandSchema = new Schema(
    {
      brandName: { type: String, required: true},
      description: String,
      assets: String,
    },
    { timestamps: true },
)

const Brand = mongoose.model('Brand', brandSchema);
export default Brand;