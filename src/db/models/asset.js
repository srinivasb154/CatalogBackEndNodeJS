import mongoose, { Schema } from 'mongoose';

const productAssetSchema = new Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productAssetId: { type: Number, required: true },
    fileName: { type: String, required: true },
    type: {
      type: String,
      enum: ['Image', 'Video', 'Document', 'Other'],
      required: true,
    },
    extension: { type: String, required: true },
    binaryData: { type: Buffer, required: true },
  },
  { timestamps: true },
);

const ProductAsset = mongoose.model('ProductAsset', productAssetSchema);
export default ProductAsset;
