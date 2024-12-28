import mongoose, { Schema } from 'mongoose';

const specificationSchema  = new Schema({
  weight: {
    type: String,
    required: false,
  },
  color: {
    type: String,
    required: false,
  },
  dimensions: {
    type: String,
    required: false,
  },
  capacity: {
    type: String,
    required: false,
  },
  material: {
    type: String,
    required: false,
  },
  origin: {
    type: String,
    required: false,
  },
  size: {
    type: String,
    required: false,
  },
  wattage: {
    type: String,
    required: false,
  },
  voltage: {
    type: String,
    required: false,
  },
  specialFeatures: {
    type: String,
    required: false,
  },
});

const productSchema = new Schema(
  {
    productName: { type: String, required: true },
    sku: String,
    shortDescription: String,
    longDescription: String,
    shippingNotes: String,
    warrantyInfo: String,
    visibleToFrontEnd: Boolean,
    featuredProduct: Boolean,
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' }, // Reference to brand
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }, // Reference to category
    specifications: specificationSchema, // Embedded document
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  },
  { timestamps: true },
);

// Retrieve Products Based on a Category ID
// Static method to retrieve products by categoryId
productSchema.statics.findByCategory = async function (categoryId) {
  return this.find({ categoryId }).populate(
    'categoryId',
    'categoryName description',
  );
};

//Retrieve Category Details for a Given Product
// Static method to retrieve a product with its category details
productSchema.statics.findProductWithCategory = async function (productId) {
  return this.findById(productId).populate(
    'categoryId',
    'categoryName description',
  );
};

//Retrieve Category Details Using a Product Name
// Static method to retrieve category details for a given product name
productSchema.statics.findCategoryByProductName = async function (productName) {
  const product = await this.findOne({ name: productName }).populate(
    'categoryId',
    'name description',
  );
  return product ? product.categoryId : null; // Return category details
};


const Product = mongoose.model('product', productSchema);
export default Product;