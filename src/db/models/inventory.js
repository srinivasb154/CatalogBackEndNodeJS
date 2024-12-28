import mongoose, { Schema } from 'mongoose';

const inventorySchema = new Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  bin: { type: String, required: true },
  location: { type: String, required: true },
  source: { type: String, required: true },
  onHand: { type: Number, default: 0 },
  onHold: { type: Number, default: 0 },
});

const ProductInventory = mongoose.model('ProductInventory', inventorySchema);
export default ProductInventory;
