import Category from '../db/models/category.js';
import Brand from '../db/models/brand.js';
import Product from '../db/models/product.js';
import Review from '../db/models/review.js';
import ProductAsset from '../db/models/asset.js';
import ProductInventory from '../db/models/inventory.js';
import ProductPricing from '../db/models/pricing.js';

class ExportService {
  async exportData(columnMappings) {
    const result = {};

    // Export Categories
    const categories = await Category.find().lean();
    result.categories = categories.map((category) => ({
      [columnMappings.category_id || 'category_id']: category._id,
      [columnMappings.category_name || 'category_name']: category.categoryName,
      [columnMappings.description || 'description']: category.description,
    }));

    // Export Brands
    const brands = await Brand.find().lean();
    result.brands = brands.map((brand) => ({
      [columnMappings.brand_id || 'brand_id']: brand._id,
      [columnMappings.brand_name || 'brand_name']: brand.brandName,
      [columnMappings.description || 'description']: brand.description,
    }));

    // Export Products with Category and Brand Details
    const products = await Product.find().lean();
    const categoriesMap = Object.fromEntries(
      categories.map((c) => [c._id.toString(), c.categoryName]),
    );
    const brandsMap = Object.fromEntries(
      brands.map((b) => [b._id.toString(), b.brandName]),
    );

    result.products = products.map((product) => ({
      [columnMappings.product_name || 'product_name']: product.productName,
      [columnMappings.category_name || 'category_name']:
        categoriesMap[product.categoryId?.toString()] || null,
      [columnMappings.brand_name || 'brand_name']:
        brandsMap[product.brandId?.toString()] || null,
    }));

    // Export Product Specifications
    result.productSpecifications = products.map((product) => ({
      [columnMappings.product_name || 'product_name']: product.productName,
      [columnMappings.weight || 'weight']: product.specifications?.weight,
      [columnMappings.color || 'color']: product.specifications?.color,
    }));

    // Export Reviews
    const reviews = await Review.find().lean();
    const productsMap = Object.fromEntries(
      products.map((p) => [p._id.toString(), p.productName]),
    );

    result.productReviews = reviews.map((review) => ({
      [columnMappings.product_name || 'product_name']:
        productsMap[review.productId?.toString()] || null,
      [columnMappings.user || 'user']: review.user,
      [columnMappings.comment || 'comment']: review.comment,
    }));

    // Export Assets
    const assets = await ProductAsset.find().lean();
    result.productAssets = assets.map((asset) => ({
      [columnMappings.product_name || 'product_name']:
        productsMap[asset.productId?.toString()] || null,
      [columnMappings.file_name || 'file_name']: asset.fileName,
      [columnMappings.type || 'type']: asset.type,
    }));

    // Export Inventory
    const inventories = await ProductInventory.find().lean();
    result.productInventories = inventories.map((inventory) => ({
      [columnMappings.product_name || 'product_name']:
        productsMap[inventory.productId?.toString()] || null,
      [columnMappings.bin || 'bin']: inventory.bin,
      [columnMappings.location || 'location']: inventory.location,
    }));

    // Export Pricing
    const pricing = await ProductPricing.find().lean();
    result.productPricing = pricing.map((price) => ({
      [columnMappings.product_name || 'product_name']:
        productsMap[price.productId?.toString()] || null,
      [columnMappings.msrp || 'msrp']: price.msrp,
      [columnMappings.sell || 'sell']: price.sell,
    }));

    return result;
  }
}

export default new ExportService();
