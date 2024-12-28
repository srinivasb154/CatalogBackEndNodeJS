import mongoose, { Schema } from 'mongoose';

const productPricingSchema = new Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  msrp: { type: Number, required: true }, // Manufacturer’s Suggested Retail Price
  map: { type: Number }, // Minimum Advertised Price
  cost: { type: Number }, // Total expense to produce or acquire
  sell: { type: Number }, // Actual selling price
  base: { type: Number }, // Base price
  startDate: { type: Date, required: true }, // Pricing start date
  endDate: { type: Date }, // Pricing end date
  createdBy: { type: String, required: true }, // User who created the record
  createdAt: { type: Date, default: Date.now }, // Record creation date
});

const ProductPricing = mongoose.model('ProductPricing', productPricingSchema);
export default ProductPricing;
