import Product from '../db/models/product.js';
import Review from '../db/models/review.js';
import ProductAsset from '../db/models/asset.js';
import ProductInventory from '../db/models/inventory.js';
import ProductPricing from '../db/models/pricing.js';
import Category from '../db/models/category.js';
import Brand from '../db/models/brand.js';
import { logger } from '../logger.js';

// Save product details
export async function createProduct(productData) {
  try {
    const product = new Product(productData);
    await product.save();
    return product;
  } catch (error) {
    throw new Error(`Error saving product: ${error.message}`);
  }
}

// Save product reviews
export async function saveProductReviews(productId, reviews) {
  try {
    const reviewDocuments = await Review.insertMany(
      reviews.map((review) => ({ ...review, product: productId })),
    );
    const reviewIds = reviewDocuments.map((review) => review._id);
    await Product.findByIdAndUpdate(productId, {
      $push: { reviews: { $each: reviewIds } },
    });
    return reviewDocuments;
  } catch (error) {
    throw new Error(`Error saving reviews: ${error.message}`);
  }
}

async function listProducts(
  query = {},
  { sortBy = 'createdAt', sortOrder = 'descending' } = {},
) {
  return await Product.find(query).sort({ [sortBy]: sortOrder });
}

export async function listAllProducts(options) {
  return await listProducts({}, options);
}

export async function listProductByProductName(name) {
  return await listProducts({ productName: name });
}

export async function listProductBySku(skuVal) {
  return await listProducts({ sku: skuVal });
}

export async function getProductById(productId) {
  return await Product.findById(productId);
}

export async function updateProduct(
  productId,
  {
    productName,
    sku,
    shortDescription,
    longDescription,
    shippingNotes,
    warrantyInfo,
    brand,
    visibleToFrontEnd,
    featuredProduct,
  },
) {
  return await Product.findOneAndUpdate(
    { _id: productId },
    {
      $set: {
        productName,
        sku,
        shortDescription,
        longDescription,
        shippingNotes,
        warrantyInfo,
        brand,
        visibleToFrontEnd,
        featuredProduct,
      },
    },
    { new: true },
  );
}

export async function deleteProduct(productId) {
  return await Product.deleteOne({ _id: productId });
}

// Retrieve Products Based on a Category ID
// Static method to retrieve products by categoryId
export async function findProductsByCategory(categoryId) {
  return await Product.find({ categoryId }).populate(
    'categoryId',
    'categoryName description',
  );
}

//Retrieve Category Details for a Given Product
// Static method to retrieve a product with its category details
export async function findProductWithCategory(productId) {
  return Product.findById(productId).populate(
    'categoryId',
    'categoryName description',
  );
}

//Retrieve Category Details Using a Product Name
// Static method to retrieve category details for a given product name
export async function findCategoryByProductName(productName) {
  const product = await Product.findOne({ productName: productName }).populate(
    'categoryId',
    'categoryName description',
  );
  return product ? product.categoryId : null; // Return category details
}

export async function findProductsByBrand(brandId) {
  return await Product.find({ brandId }).populate(
    'brandId',
    'brandName description',
  );
}

export async function findProductWithBrand(productId) {
  return Product.findById(productId).populate(
    'brandId',
    'brandName description',
  );
}

export async function findBrandByProductName(productName) {
  const product = await Product.findOne({ productName: productName }).populate(
    'brandId',
    'brandName description',
  );
  return product ? product.categoryId : null; // Return brand details
}

// Get reviews for a specific product
export async function getProductReviews(productId) {
  try {
    const product = await Product.findById(productId).populate('reviews');
    if (!product) throw new Error('Product not found');
    return product.reviews;
  } catch (error) {
    throw new Error(`Error fetching reviews: ${error.message}`);
  }
}

// Fetch products based on search criteria
export async function searchProducts(criteria) {
  try {
    const query = {};
    if (criteria.productName)
      query.productName = new RegExp(criteria.productName, 'i'); // Case-insensitive
    if (criteria.sku) query.sku = criteria.sku;
    if (criteria.categoryId) query.categoryId = criteria.categoryId;
    if (criteria.brandId) query.brandId = criteria.brandId;

    return await Product.find(query);
  } catch (error) {
    throw new Error('Error fetching products: ' + error.message);
  }
}

// Save Product Assets
export async function saveProductAssets(assets) {
  try {
    if (assets) {
      const savedAssets = await ProductAsset.insertMany(assets);
      return savedAssets;
    } else {
      throw new Error('Blank assets');
    }
  } catch (error) {
    throw new Error(`Error saving product assets: ${error.message}`);
  }
}

export async function getProductAssets(productId) {
  try {
    // Validate productId
    if (!productId) {
      throw new Error('Product ID is required to fetch assets.');
    }

    // Fetch assets from the database
    const assets = await ProductAsset.find({ productId }).exec();

    return assets;
  } catch (error) {
    console.error('Error retrieving product assets:', error);
    throw new Error(`Could not fetch assets for product: ${error.message}`);
  }
}

export async function findInventoryByProduct(productId) {
  try {
    if (!productId) {
      throw new Error('Product ID is required.');
    }

    const inventory = await ProductInventory.find({ productId }).exec();
    return inventory;
  } catch (error) {
    console.error('Error finding inventory:', error);
    throw new Error(`Could not find inventory: ${error.message}`);
  }
}

export async function upsertInventory(inventoryData) {
  try {
    const { productId, bin, location, source, onHand, onHold } = inventoryData;

    if (!productId || !bin || !location || !source) {
      throw new Error(
        'Missing required fields: productId, bin, location, or source.',
      );
    }

    let inventory = await ProductInventory.findOne({
      productId,
      bin,
      location,
    });

    if (inventory) {
      // Update existing inventory
      inventory.onHand = onHand ?? inventory.onHand;
      inventory.onHold = onHold ?? inventory.onHold;
      inventory.source = source; // Update source if provided
      inventory = await inventory.save();
    } else {
      // Create new inventory
      inventory = new ProductInventory({
        productId,
        bin,
        location,
        source,
        onHand,
        onHold,
      });
      inventory = await inventory.save();
    }

    return inventory;
  } catch (error) {
    console.error('Error upserting inventory:', error);
    throw new Error(`Could not save inventory: ${error.message}`);
  }
}

/**
 * Retrieve pricing details for a specific product.
 * @param {string} productId - The ID of the product.
 * @returns {Promise<Array>} - A promise that resolves to an array of pricing records.
 */
export async function getPricingByProductId(productId) {
  try {
    if (!productId) {
      throw new Error('Product ID is required.');
    }

    const pricing = await ProductPricing.find({ productId }).exec();
    return pricing;
  } catch (error) {
    console.error('Error retrieving pricing:', error);
    throw new Error('Could not retrieve pricing data.');
  }
}

/**
 * Create or update a pricing record.
 * @param {Object} pricingData - The pricing data to save.
 * @returns {Promise<Object>} - A promise that resolves to the saved pricing record.
 */
export async function upsertPricing(pricingData) {
  try {
    const {
      productId,
      msrp,
      map,
      cost,
      sell,
      base,
      startDate,
      endDate,
      createdBy,
    } = pricingData;

    if (!productId || !msrp || !startDate || !createdBy) {
      throw new Error(
        'Missing required fields: productId, msrp, startDate, createdBy.',
      );
    }

    // Check for existing overlapping pricing records
    const overlappingPricing = await ProductPricing.findOne({
      productId,
      startDate: { $lte: new Date(endDate || Date.now()) },
      endDate: { $gte: new Date(startDate) },
    });

    let pricing;
    if (overlappingPricing) {
      // Update existing record
      overlappingPricing.msrp = msrp;
      overlappingPricing.map = map;
      overlappingPricing.cost = cost;
      overlappingPricing.sell = sell;
      overlappingPricing.base = base;
      overlappingPricing.startDate = startDate;
      overlappingPricing.endDate = endDate;
      overlappingPricing.createdBy = createdBy;
      pricing = await overlappingPricing.save();
    } else {
      // Create a new record
      pricing = new ProductPricing({
        productId,
        msrp,
        map,
        cost,
        sell,
        base,
        startDate,
        endDate,
        createdBy,
      });
      pricing = await pricing.save();
    }

    return pricing;
  } catch (error) {
    console.error('Error saving pricing:', error);
    throw new Error('Could not save pricing data.');
  }
}

/**
 * Validate and retrieve Category and Brand IDs
 * @param {String} categoryName
 * @param {String} brandName
 * @returns {Object} { categoryId, brandId }
 */
const validateCategoryAndBrand = async (categoryName, brandName) => {
  console.log('Searching for category:', categoryName);
  console.log('Searching for brand:', brandName);

  const category = await Category.findOne({ categoryName: categoryName });
  const brand = await Brand.findOne({ brandName: brandName });

  console.log('Category found:', category);
  console.log('Brand found:', brand);

  if (!category || !brand) {
    throw new Error(`Invalid category or brand: ${categoryName}, ${brandName}`);
  }

  return { categoryId: category._id, brandId: brand._id };
};

const preprocessSpecifications = (specifications) => {
  if (!specifications) {
    console.warn('Skipping invalid specifications:', specifications);
    return {}; // Return an empty object for invalid or missing specifications
  }

  if (typeof specifications === 'object') {
    // If it's already an object, return it directly
    return specifications;
  }

  if (typeof specifications === 'string') {
    try {
      return JSON.parse(specifications.trim()); // Attempt to parse JSON
    } catch (error) {
      console.error('Invalid JSON in specifications:', specifications);
      return {}; // Return an empty object for invalid JSON
    }
  }

  console.warn('Skipping unrecognized specifications format:', specifications);
  return {}; // Return an empty object for unexpected types
};

/**
 * Add a product to the database
 * @param {Object} productData
 */
export async function addProduct(productData) {
  try {
    const { categoryId, brandId } = await validateCategoryAndBrand(
      productData.Category,
      productData.Brand,
    );

    console.log('Raw specifications:', productData.specifications);

    const specifications = preprocessSpecifications(productData.specifications);

    const product = {
      productName: productData.productName,
      sku: productData.sku,
      shortDescription: productData.shortDescription,
      longDescription: productData.longDescription,
      shippingNotes: productData.shippingNotes,
      warrantyInfo: productData.warrantyInfo,
      visibleToFrontEnd: productData.visibleToFrontEnd === 'true',
      featuredProduct: productData.featuredProduct === 'true',
      categoryId,
      brandId,
      specifications,
    };

    await Product.create(product);
    logger.info(`Product added successfully: ${product.productName}`);
  } catch (error) {
    logger.error(`Error adding product: ${productData.productName}`, {
      error: error.message,
    });
    throw error;
  }
}

/**
 * Replace all existing products with new ones
 * @param {Array} productsData
 */
export async function replaceProducts(productsData) {
  await Product.deleteMany({});
  logger.info('All existing products deleted.');

  await addProducts(productsData);
}

/**
 * Add new products without removing existing ones
 * @param {Array} productsData
 */
export async function addProducts(productsData) {
  const validProducts = [];
  for (const productData of productsData) {
    try {
      const { categoryId, brandId } = await validateCategoryAndBrand(
        productData.Category,
        productData.Brand,
      );

      console.log('Raw specifications:', productData.specifications);

      const specifications = preprocessSpecifications(
        productData.specifications,
      );

      const product = {
        productName: productData.productName,
        sku: productData.sku,
        shortDescription: productData.shortDescription,
        longDescription: productData.longDescription,
        shippingNotes: productData.shippingNotes,
        warrantyInfo: productData.warrantyInfo,
        visibleToFrontEnd: productData.visibleToFrontEnd === 'true',
        featuredProduct: productData.featuredProduct === 'true',
        categoryId,
        brandId,
        specifications,
      };

      validProducts.push(product);
    } catch (error) {
      logger.error(`Skipping product: ${productData.productName}`, {
        error: error.message,
      });
    }
  }

  if (validProducts.length > 0) {
    await Product.insertMany(validProducts);
    logger.info(`${validProducts.length} products added successfully.`);
  } else {
    logger.warn('No valid products to add.');
  }
}

/**
 * Validate the structure of the CSV file.
 * @param {Object} firstRow - The first row of the CSV file.
 * @param {Array} requiredFields - List of required column names.
 * @returns {Boolean}
 */
export async function validateCSVStructure(firstRow, requiredFields) {
  const missingFields = requiredFields.filter((field) => !(field in firstRow));
  if (missingFields.length > 0) {
    throw new Error(
      `Missing required fields in CSV: ${missingFields.join(', ')}`,
    );
  }
  return true;
}

/* const isValidJSON = (jsonString) => {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (e) {
    return false;
  }
}; */
