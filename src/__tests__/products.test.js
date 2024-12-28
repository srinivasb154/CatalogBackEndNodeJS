import mongoose from 'mongoose';
import { describe, expect, test, beforeEach } from '@jest/globals';

import {
  createProduct,
  listAllProducts,
  listProductByProductName,
  listProductBySku,
  getProductById,
  findProductsByCategory,
  findProductWithCategory,
  findCategoryByProductName,
  updateProduct,
  deleteProduct,
 
} from '../services/products.js';
import Product from '../db/models/product.js';
import Brand from '../db/models/brand.js';
import Category from '../db/models/category.js';

describe('creating products', () => {
  test('with all parameters should succeed', async () => {
    const brand1 = await Brand.create({
      brandName: "brand1",
    });

    const electronicsCategory = await Category.create({
      categoryName: "Electronics",
    });

    const product = {
      productName: 'First Product',
      sku: 'sku1',
      shortDescription: 'First Product short',
      longDescription: 'First Product long description',
      shippingNotes: 'Shipping notes for First Product',
      warrantyInfo: 'Warranty Info for First Product',
      visibleToFrontEnd: true,
      featuredProduct: false,
      brandId: brand1._id,
      categoryId: electronicsCategory._id,
    };

    const createdProduct = await createProduct(product);
    expect(createdProduct._id).toBeInstanceOf(mongoose.Types.ObjectId);

    const foundProduct = await Product.findById(createdProduct._id);
    expect(foundProduct).toEqual(expect.objectContaining(product));
    expect(foundProduct.createdAt).toBeInstanceOf(Date);
    expect(foundProduct.updatedAt).toBeInstanceOf(Date);
  });
});

const sampleProducts = [
  {
    productName: 'Product11',
    sku: '123-45-6787',
    shortDescription: 'Product11 Short',
    longDescription: 'Product11 Long description',
    shippingNotes: 'Product11 Shipping Notes',
    warrantyInfo: 'Product11 Shipping Notes',
    isibleToFrontEnd: true,
    featuredProduct: false,
  },
  {
    productName: 'Product12',
    sku: '123-45-6788',
    shortDescription: 'Product12 Short',
    longDescription: 'Product12 Long description',
    shippingNotes: 'Product12 Shipping Notes',
    warrantyInfo: 'Product12 Shipping Notes',
    isibleToFrontEnd: true,
    featuredProduct: true,
  },
  {
    productName: 'Product13',
    sku: '123-45-6789',
    shortDescription: 'Product13 Short',
    longDescription: 'Product13 Long description',
    shippingNotes: 'Product13 Shipping Notes',
    warrantyInfo: 'Product13 Shipping Notes',
    isibleToFrontEnd: false,
    featuredProduct: false,
  },
];

let createdSampleProducts = [];

beforeEach(async () => {

  await Product.deleteMany({});
  await Brand.deleteMany({});
  await Category.deleteMany({});
  createdSampleProducts = [];
  for (const product of sampleProducts) {
    const createdProduct = new Product(product);
    createdSampleProducts.push(await createdProduct.save());
  }
});

describe('listing products', () => {
  test('should return products sorted by creation date descending by default', async () => {
    const products = await listAllProducts();
    const sortedSampleProducts = createdSampleProducts.sort(
      (a, b) => b.createdAt - a.createdAt,
    );
    expect(products.map((product) => product.createdAt)).toEqual(
      sortedSampleProducts.map((product) => product.createdAt),
    );
  });

  test('should be able to filter product by productName', async () => {
    const products = await listProductByProductName('Product12');
    expect(products.length).toBe(1);
    expect(products[0].productName).toEqual('Product12');
    expect(products[0].sku).toEqual('123-45-6788');
  });

  test('should be able to filter product by sku', async () => {
    const products = await listProductBySku('123-45-6788');
    expect(products.length).toBe(1);
    expect(products[0].productName).toEqual('Product12');
    expect(products[0].sku).toEqual('123-45-6788');
  });
});

describe('getting a product', () => {
  test('should return the full product', async () => {
    const product = await getProductById(createdSampleProducts[0]._id);
    expect(product.toObject()).toEqual(createdSampleProducts[0].toObject());
  });

  test('should fail if the id does not exist', async () => {
    const product = await getProductById('000000000000000000000000');
    expect(product).toEqual(null);
  });
});

describe('getting products based on category', () => {

  test("should retrieve all products for a specific category", async () => {

    let electronicsCategory;
    let furnitureCategory;

    await Product.deleteMany({});
    await Category.deleteMany({});

    electronicsCategory = await Category.create({
      categoryName: "Electronics",
      description: "Electronic devices and gadgets",
    });

    furnitureCategory = await Category.create({
      categoryName: "Furniture",
      description: "Home and office furniture",
    });

    await Product.create([
      {
        productName: 'Laptop',
        sku: '123-45-6789',
        shortDescription: 'Laptop Short',
        longDescription: 'Laptop Long description',
        shippingNotes: 'Laptop Shipping Notes',
        warrantyInfo: 'Laptop Warranty Info',
        isibleToFrontEnd: false,
        featuredProduct: false,
        categoryId: electronicsCategory._id,
      },
      {
        productName: 'Smartphone',
        sku: '123-45-6790',
        shortDescription: 'Smartphone Short',
        longDescription: 'Smartphone Long description',
        shippingNotes: 'Smartphone Shipping Notes',
        warrantyInfo: 'Smartphone Warranty Info',
        isibleToFrontEnd: false,
        featuredProduct: false,
        categoryId: electronicsCategory._id,
      },
      {
        productName: 'Office Chair',
        sku: '123-45-6738',
        shortDescription: 'Office Chair Short',
        longDescription: 'Office Chair Long description',
        shippingNotes: 'Office Chair Shipping Notes',
        warrantyInfo: 'Office Chair Warranty Info',
        isibleToFrontEnd: false,
        featuredProduct: false,
        categoryId: furnitureCategory._id,
      },
    ]);

    const products = await findProductsByCategory(electronicsCategory._id);

    expect(products).toBeDefined();
    expect(products.length).toBe(2);

    expect(products[0].productName).toBe("Laptop");
    expect(products[1].productName).toBe("Smartphone");

    // Check populated category details
    expect(products[0].categoryId.categoryName).toBe("Electronics");
    expect(products[0].categoryId.description).toBe("Electronic devices and gadgets");
  });

  test("should return no products for a category with no products", async () => {
    const newCategory = await Category.create({
      categoryName: "Toys",
      description: "Children's toys",
    });

    const products = await findProductsByCategory(newCategory._id);
    expect(products).toBeDefined();
    expect(products.length).toBe(0);
  });

  test("should retrieve product with populated category details", async () => {
    let electronicsCategory;

    await Product.deleteMany({});
    await Category.deleteMany({});

    electronicsCategory = await Category.create({
      categoryName: "Electronics",
      description: "Electronic devices and gadgets",
    });

    await Product.create([
      {
        productName: 'Laptop',
        sku: '123-45-6789',
        shortDescription: 'Laptop Short',
        longDescription: 'Laptop Long description',
        shippingNotes: 'Laptop Shipping Notes',
        warrantyInfo: 'Laptop Warranty Info',
        isibleToFrontEnd: false,
        featuredProduct: false,
        categoryId: electronicsCategory._id,
      },
      {
        productName: 'Smartphone',
        sku: '123-45-6790',
        shortDescription: 'Smartphone Short',
        longDescription: 'Smartphone Long description',
        shippingNotes: 'Smartphone Shipping Notes',
        warrantyInfo: 'Smartphone Warranty Info',
        isibleToFrontEnd: false,
        featuredProduct: false,
        categoryId: electronicsCategory._id,
      },
    ]);
    const product = await findProductWithCategory(
      (await Product.findOne({ productName: "Laptop" }))._id
    );

    expect(product).toBeDefined();
    expect(product.productName).toBe("Laptop");

    // Check populated category details
    expect(product.categoryId.categoryName).toBe("Electronics");
    expect(product.categoryId.description).toBe("Electronic devices and gadgets");
  });

  test("should retrieve category details based on product name", async () => {
    let electronicsCategory;
    let furnitureCategory;

    await Product.deleteMany({});
    await Category.deleteMany({});

    electronicsCategory = await Category.create({
      categoryName: "Electronics",
      description: "Electronic devices and gadgets",
    });

    furnitureCategory = await Category.create({
      categoryName: "Furniture",
      description: "Home and office furniture",
    });

    await Product.create([
      {
        productName: 'Laptop',
        sku: '123-45-6789',
        shortDescription: 'Laptop Short',
        longDescription: 'Laptop Long description',
        shippingNotes: 'Laptop Shipping Notes',
        warrantyInfo: 'Laptop Warranty Info',
        isibleToFrontEnd: false,
        featuredProduct: false,
        categoryId: electronicsCategory._id,
      },
      {
        productName: 'Smartphone',
        sku: '123-45-6790',
        shortDescription: 'Smartphone Short',
        longDescription: 'Smartphone Long description',
        shippingNotes: 'Smartphone Shipping Notes',
        warrantyInfo: 'Smartphone Warranty Info',
        isibleToFrontEnd: false,
        featuredProduct: false,
        categoryId: electronicsCategory._id,
      },
      {
        productName: 'Office Chair',
        sku: '123-45-6738',
        shortDescription: 'Office Chair Short',
        longDescription: 'Office Chair Long description',
        shippingNotes: 'Office Chair Shipping Notes',
        warrantyInfo: 'Office Chair Warranty Info',
        isibleToFrontEnd: false,
        featuredProduct: false,
        categoryId: furnitureCategory._id,
      },
    ]);
    const categoryDetails = await findCategoryByProductName("Office Chair");
    console.log(categoryDetails);

    expect(categoryDetails).toBeDefined();
    expect(categoryDetails.categoryName).toBe("Furniture");
    expect(categoryDetails.description).toBe("Home and office furniture");
  });

  test("should return null when product name does not exist", async () => {
    const categoryDetails = await findCategoryByProductName("Non-existent Product");

    expect(categoryDetails).toBeNull();
  });
});

describe('updating products', () => {
  test('should update the specified property', async () => {
    await updateProduct(createdSampleProducts[0]._id, {
      productName: 'Product111',
    });
    const updatedProduct = await Product.findById(createdSampleProducts[0]._id);
    expect(updatedProduct.productName).toEqual('Product111');
  });

  test('should not update other properties', async () => {
    await updateProduct(createdSampleProducts[0]._id, {
      productName: 'Product111',
    });
    const updatedProduct = await Product.findById(createdSampleProducts[0]._id);
    expect(updatedProduct.sku).toEqual('123-45-6787');
  });

  test('should update the updatedAt timestamp', async () => {
    await updateProduct(createdSampleProducts[0]._id, {
      productName: 'Product111',
    });
    const updatedProduct = await Product.findById(createdSampleProducts[0]._id);
    expect(updatedProduct.updatedAt.getTime()).toBeGreaterThan(
      createdSampleProducts[0].updatedAt.getTime(),
    );
  });

  test('should fail if the id does not exist', async () => {
    const product = await updateProduct('000000000000000000000000', {
      productName: 'Product111',
    });
    expect(product).toEqual(null);
  });
});

describe('deleting products', () => {
  test('should remove the product from the database', async () => {
    const result = await deleteProduct(createdSampleProducts[0]._id);
    expect(result.deletedCount).toEqual(1);
    const deletedProduct = await Product.findById(createdSampleProducts[0]._id);
    expect(deletedProduct).toEqual(null);
  });

  test('should fail if the id does not exist', async () => {
    const result = await deleteProduct('000000000000000000000000');
    expect(result.deletedCount).toEqual(0);
  });
}); 


